'use strict';

/**
 * nuonuo-release 主进程 —— 「构建微信小游戏 → 上传微信后台」的编排。
 *
 * 几点说明：
 * - 长任务全在主进程跑。builder 的构建本身在子进程池里，上传是异步 spawn，
 *   await 它们不会阻塞编辑器的事件循环。
 * - **不用 broadcast，状态和日志全靠面板轮询 `get-state`。**
 *   原因：面板随时可能被关掉再打开，而 broadcast 只播当下、没有 backlog，
 *   想补历史还得再走一条拉取路径；而且 broadcast 通道不需要在 contributions 里
 *   注册、行为不像 message 那样有明文保证。统一走轮询就只有一条路径要维护，
 *   面板重开也能原样捞回全部历史。日志量（几百行 / 一次发版）对 IPC 完全无压力。
 */

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join, dirname, isAbsolute } = require('path');
const { spawn } = require('child_process');
const uploader = require('./wechat-upload');

const PKG_NAME = 'nuonuo-release';

/** builder 的 BuildExitCode（编辑器 builder/@types 里的权威定义） */
const BUILD_SUCCESS = 36;
const BUILD_TIMEOUT_MS = 10 * 60 * 1000;

const MAX_LOG_LINES = 800;

let running = false;
let runId = 0;

const state = {
    running: false,
    runId: 0,
    phase: 'idle',          // idle | building | uploading | done
    progress: 0,
    message: '',
    logs: [],
    /** 本次运行累计写入的行数（只增不减）。日志环形缓冲会 shift()，length 不再增长，
     *  所以增量同步必须靠这个序号，不能靠数组长度。 */
    logSeq: 0,
    lastResult: null,
    startedAt: null,
    /** 这次**真正**用的构建参数（runBuild 里写入）。导出日志时不能现读 builder.json ——
     *  构建结束后那里会多出一条新的成功记录，读到的是它，和本次日志里的 taskMap key 对不上。 */
    lastBuildPlan: null,
};

// ------------------------------------------------------------ 状态 / 日志

function snapshot() {
    return {
        running: state.running,
        runId: state.runId,
        phase: state.phase,
        progress: state.progress,
        message: state.message,
        logs: state.logs.slice(),
        logSeq: state.logSeq,
        lastResult: state.lastResult,
        startedAt: state.startedAt,
    };
}

function log(line) {
    const text = String(line == null ? '' : line);
    for (const one of text.split(/\r?\n/)) {
        state.logs.push(one);
        state.logSeq += 1;
    }
    while (state.logs.length > MAX_LOG_LINES) state.logs.shift();
}

function setPhase(phase, message, progress) {
    state.phase = phase;
    if (message !== undefined) state.message = message;
    if (progress !== undefined) state.progress = progress;
}

// --------------------------------------------------------------- 设置

function settingsPath() {
    return join(Editor.Project.path, 'profiles', `${PKG_NAME}.json`);
}

function loadSettings() {
    try {
        return JSON.parse(readFileSync(settingsPath(), 'utf8'));
    } catch (_) {
        return {};
    }
}

function saveSettings(patch) {
    const merged = Object.assign(loadSettings(), patch);
    try {
        mkdirSync(dirname(settingsPath()), { recursive: true });
        writeFileSync(settingsPath(), JSON.stringify(merged, null, 4), 'utf8');
    } catch (err) {
        console.warn('[nuonuo-release] 写设置失败:', err);
    }
    return merged;
}

/** 面板要的那几个字段（getState / probeEnv 共用一份形状，面板就能复用同一个灌值函数） */
function settingsSnapshot() {
    const s = loadSettings();
    return {
        lastVersion: s.lastVersion || '',
        lastDesc: s.lastDesc || '',
        lastUploadedVersion: s.lastUploadedVersion || '',
        // 勾选框的持久化（没存过就是 false）
        skipBuild: !!s.skipBuild,
        buildOnly: !!s.buildOnly,
        allowEnablePort: !!s.allowEnablePort,
        refreshAfterBuild: !!s.refreshAfterBuild,
    };
}

/**
 * 保证 `profiles/nuonuo-release.json` 存在，返回它的绝对路径。
 *
 * 面板上的「打开版本号文件」要在文件管理器里定位它 —— 文件不存在的话定位会失败，
 * 所以先按当前值把全部字段写出来一份（空存档就写出 `lastVersion: ""` 这些键，
 * 用户打开能看懂该改哪儿，而不是一个 `{}`）。
 */
function ensureSettingsFile() {
    const p = settingsPath();
    if (existsSync(p)) return p;
    const s = settingsSnapshot();
    saveSettings({
        lastVersion: s.lastVersion,
        lastDesc: s.lastDesc,
        lastUploadedVersion: s.lastUploadedVersion,
        skipBuild: s.skipBuild,
        buildOnly: s.buildOnly,
        allowEnablePort: s.allowEnablePort,
        refreshAfterBuild: s.refreshAfterBuild,
    });
    return settingsPath();
}

// ----------------------------------------------------------- 构建版本号

/**
 * 只认 1.0.0 形式；其余一律当空串 —— 既防手滑，也防把引号注进 game.js 里。
 * （版本号现在是注入到产物的 `game.js`，不再写 `BuildVersion.ts` —— 见下面那节
 * 「往产物 game.js 注入版本号」。）
 */
function normalizeVersion(version) {
    const v = String(version == null ? '' : version).trim();
    return /^\d+\.\d+\.\d+$/.test(v) ? v : '';
}

/** 产物目录。options.buildPath 是 'project://build' 这种 project URL，也可能是绝对路径。 */
function resolveBuildDir(options) {
    const fallback = join(Editor.Project.path, 'build', 'wechatgame');
    if (!options) return fallback;
    const raw = String(options.buildPath || 'project://build');
    const outputName = String(options.outputName || 'wechatgame');
    let base = raw;
    if (raw.startsWith('project://')) base = join(Editor.Project.path, raw.slice('project://'.length));
    else if (!isAbsolute(raw)) base = join(Editor.Project.path, raw);
    return join(base, outputName);
}

/** 这次发版用的产物目录 —— 构建、上传、版本校验三处必须走同一个，否则迟早对不上 */
function currentBuildDir() {
    const plan = loadBuildOptions();
    return resolveBuildDir(plan.ok ? plan.options : null);
}

// ------------------------------------------------- 往产物 game.js 注入版本号

/**
 * 游戏设置弹窗里显示的版本号，读的是**产物的 `game.js` 里注入的全局变量**
 * （`GameGlobal.__NUONUO_VERSION__`），而不是编译进包的 `BuildVersion.ts` 常量。
 *
 * 为什么绕这一下：微信开发者工具会缓存**编译过的脚本 bundle**（`assets/main/index.js`），
 * 改了 `BuildVersion.ts` 它经常不重新编译 —— 表现就是「改了版本号、构建成功、游戏里还是
 * 上一个号」。`game.js` 是入口脚本，每次都会被重新读取，所以把版本号放这里最稳。
 *
 * 注入是**幂等**的：整行只有一条，带唯一标记，重复构建按标记替换，不会越插越多。
 * 用 `GameGlobal`（小游戏全局，`game.js` 第一行就能用）而不是 `window` ——
 * 那会儿 `web-adapter.js` 还没跑，`window` 可能还不存在。
 */
const GAME_JS_MARKER = '__NUONUO_VERSION__';
const GAME_JS_INJECT_RE = /^[^\n]*__NUONUO_VERSION__[^\n]*\n?/m;

function renderGameJsInjection(version) {
    return `;(function(v){try{if(typeof GameGlobal!=="undefined")GameGlobal.${GAME_JS_MARKER}=v;`
        + `if(typeof window!=="undefined")window.${GAME_JS_MARKER}=v;}catch(e){}})(${JSON.stringify(normalizeVersion(version))});`
        + `/*${GAME_JS_MARKER}*/`;
}

/** 把版本号写进 `<产物>/game.js`。`version` 为空串 = 只清掉上次注入的，保持「开发版」。 */
function injectGameJsVersion(buildDir, version) {
    const file = join(buildDir, 'game.js');
    if (!existsSync(file)) return { ok: false, message: `没找到 ${file}` };

    let text;
    try {
        text = readFileSync(file, 'utf8');
    } catch (err) {
        return { ok: false, message: `读不了 game.js：${err && err.message ? err.message : err}` };
    }

    const had = GAME_JS_INJECT_RE.test(text);
    const v = normalizeVersion(version);

    let next;
    let message;
    if (!v) {
        next = had ? text.replace(GAME_JS_INJECT_RE, '') : text;
        message = had ? '没填版本号，已清掉 game.js 里上次注入的版本号' : '没填版本号，game.js 保持原样';
    } else {
        const line = renderGameJsInjection(v);
        next = had ? text.replace(GAME_JS_INJECT_RE, `${line}\n`) : `${line}\n${text}`;
        message = `已写进 game.js：GameGlobal.__NUONUO_VERSION__ = ${v}`;
    }

    if (next === text) return { ok: true, message, version: v };
    try {
        writeFileSync(file, next, 'utf8');
    } catch (err) {
        return { ok: false, message: `写 game.js 失败：${err && err.message ? err.message : err}` };
    }
    return { ok: true, message, version: v };
}

/** 读 `<产物>/game.js` 里注入的版本号：没注入返回 null（旧产物 / 不是插件构建的包） */
function gameJsVersion(buildDir) {
    try {
        const text = readFileSync(join(buildDir, 'game.js'), 'utf8');
        const m = /__NUONUO_VERSION__[^\n]*?\("([^"]*)"\)/.exec(text);
        return m ? m[1] : null;
    } catch (_) {
        return null;
    }
}

// --------------------------------------------------------------- 构建

/**
 * 复用上次成功构建的参数当模板。
 *
 * 坑：
 * - `profiles/` 在 .gitignore 里，换机器就是空的 → 回退到 `settings/`。
 * - 别按 `time` 字符串排序（"2026-9-7" 和 "2026-10-7" 会排错），taskMap 的 key 本身就是毫秒时间戳。
 * - 要剥掉 logDest（上次那次带空格和中文的日志路径）和 id/taskId（会让它复用旧槽位）。
 */
function loadBuildOptions() {
    const readJson = (p) => {
        try { return JSON.parse(readFileSync(p, 'utf8')); } catch (_) { return null; }
    };

    const projectPath = Editor.Project.path;
    const candidates = [
        join(projectPath, 'profiles', 'v2', 'packages', 'builder.json'),
        join(projectPath, 'settings', 'v2', 'packages', 'builder.json'),
    ];

    let source = null;
    let profile = null;
    for (const p of candidates) {
        const parsed = readJson(p);
        if (parsed) { profile = parsed; source = p; break; }
    }

    const fail = (message, hint) => ({ ok: false, options: null, source, message, hint });

    if (!profile) {
        return fail('没找到 builder 的配置（profiles 和 settings 里都没有）',
            '先在「项目 → 构建发布」里手动构建一次微信小游戏');
    }

    const taskMap = (profile.BuildTaskManager && profile.BuildTaskManager.taskMap) || {};
    const succeeded = Object.entries(taskMap)
        .filter(([, task]) => task && task.state === 'success' && task.options)
        .sort((a, b) => Number(b[0]) - Number(a[0]));

    if (!succeeded.length) {
        return fail('没有成功的构建记录可以复用',
            '先在「项目 → 构建发布」里手动构建一次微信小游戏，插件之后就能复用那次的参数');
    }

    const [taskKey, task] = succeeded[0];
    let options;
    try {
        options = JSON.parse(JSON.stringify(task.options));
    } catch (_) {
        return fail('构建记录读不出来', `看看 ${source} 里的 taskMap["${taskKey}"]`);
    }

    delete options.logDest;
    delete options.id;
    delete options.taskId;

    Object.assign(options, {
        platform: 'wechatgame',
        buildPath: options.buildPath || 'project://build',
        outputName: options.outputName || 'wechatgame',
        taskName: 'wechatgame',
        debug: false,
        sourceMaps: false,
        md5Cache: false,
    });

    return {
        ok: true,
        options,
        source,
        taskKey,
        sceneCount: Array.isArray(options.scenes) ? options.scenes.length : 0,
        startScene: options.startScene || null,
    };
}

/** 给面板看的一行摘要：这次会用什么参数构建（开跑之前就能发现「没有可复用参数」） */
function describeBuildPlan() {
    const r = loadBuildOptions();
    if (!r.ok) return { ok: false, message: r.message, hint: r.hint };
    return {
        ok: true,
        source: r.source,
        platform: r.options.platform,
        buildPath: r.options.buildPath,
        outputName: r.options.outputName,
        sceneCount: r.sceneCount,
        startScene: r.startScene,
    };
}

async function runBuild(version) {
    const plan = loadBuildOptions();
    if (!plan.ok) {
        return { ok: false, message: plan.message, hint: plan.hint };
    }
    const options = plan.options;
    const buildDir = resolveBuildDir(options);
    const tag = normalizeVersion(version);

    // 记下这次**真正**用的那份参数，给导出日志的头部用。
    // 不能等导出时现读 builder.json：构建一成功那里就多一条新记录，读到的是它，key 对不上。
    state.lastBuildPlan = {
        taskKey: plan.taskKey,
        source: plan.source,
        sceneCount: plan.sceneCount,
        packages: options.packages || {},
        buildDir,
    };

    log(`[构建] 平台 wechatgame → ${options.buildPath}/${options.outputName}`);
    log(`[构建] 参数来自 ${plan.source} 的 taskMap["${plan.taskKey}"]（${plan.sceneCount} 个场景）`);

    // 构建本身跑在 builder 的子进程池里，这里只轮询进度给面板看
    const poller = setInterval(async () => {
        try {
            const info = await Editor.Message.request('builder', 'query-tasks-info', { type: 'build' });
            const current = (info.list || []).find((t) => t.state === 'processing')
                || Object.values(info.queue || {})[0];
            if (current) setPhase('building', current.message || '构建中', current.progress || 0);
        } catch (_) { /* 查不到就保持原样 */ }
    }, 700);

    const timeout = new Promise((resolve) => {
        setTimeout(() => resolve({ __timeout: true }), BUILD_TIMEOUT_MS);
    });

    try {
        const result = await Promise.race([
            Editor.Message.request('builder', 'add-task', options, true),
            timeout,
        ]);

        if (result && result.__timeout) {
            return { ok: false, message: `构建超时（${BUILD_TIMEOUT_MS / 60000} 分钟）` };
        }

        // 注意 TaskAddResult.BUSY === 0 是 falsy，不能写 `if (result)`，必须显式比 36
        if (result === BUILD_SUCCESS) {
            log('[构建] 成功');

            // 1) 把版本号注入产物的 game.js —— 游戏设置弹窗显示的就是它。
            //    走这条路是因为开发者工具会缓存编译过的脚本 bundle（assets/main/index.js），
            //    改了 BuildVersion.ts 它经常不重新编译；game.js 是入口脚本，每次都会被重新读取。
            const injected = injectGameJsVersion(buildDir, tag);
            log(`[版本] ${injected.message}`);
            if (!injected.ok) {
                return { ok: false, message: `没能把版本号写进 game.js：${injected.message}` };
            }

            // 2) 让开发者工具重新读产物 —— **默认关着**，面板「选项」里那个勾选框才开。
            //
            //    为什么改成 opt-in：这一步会清掉开发者工具的**文件缓存**，而那份缓存很可能正是它
            //    解析 `require` 用的东西 —— 清完再启动游戏，就会报
            //    `module 'web-adapter.js' is not defined, require args is './web-adapter'`
            //    （实测踩过一次，代价是游戏直接起不来）。所以不再每次构建都自动执行。
            //
            //    什么时候真需要它：**切换过构建配置**（尤其开/关「分离引擎」，产物里引擎文件整套换名）
            //    之后，工具内部的项目状态会和磁盘对不上。那时候手动勾上跑一次就好。
            if (loadSettings().refreshAfterBuild) {
                try {
                    const refreshed = await uploader.refreshProject(buildDir);
                    log(`[工具] ${refreshed.message}`);
                    for (const step of (refreshed.steps || [])) {
                        if (!step.ok) log(`[工具]   ${step.step} 失败：${step.error}`);
                    }
                } catch (err) {
                    log(`[工具] 刷新开发者工具出错（不影响构建）：${err && err.message ? err.message : err}`);
                }
            } else {
                log('[工具] 没勾「构建后让开发者工具重新读产物」，跳过（只切过构建配置时才需要）');
            }

            return { ok: true };
        }

        // add-task 不返回任务 id，失败时去任务列表里捞最新那条拿详情
        let detail = '';
        try {
            const info = await Editor.Message.request('builder', 'query-tasks-info', { type: 'build' });
            const last = (info.list || []).slice().sort((a, b) => Number(b.id) - Number(a.id))[0];
            if (last) detail = last.detailMessage || last.message || '';
        } catch (_) { /* 拿不到详情就算了 */ }

        if (detail) for (const line of String(detail).split(/\r?\n/)) log(`[构建] ${line}`);

        return {
            ok: false,
            message: `构建失败（BuildExitCode ${result}）`,
            hint: detail ? undefined : '构建失败但没有拿到详情，请看编辑器的构建日志',
        };
    } catch (err) {
        return { ok: false, message: `构建出错：${err && err.message ? err.message : err}` };
    } finally {
        clearInterval(poller);
    }
}

// --------------------------------------------------------------- 上传

async function runUpload(payload) {
    const buildDir = currentBuildDir();

    setPhase('uploading', '上传中', 0);

    const result = await uploader.upload({
        projectDir: buildDir,
        version: payload.version,
        desc: payload.desc,
        devtoolsDir: payload.devtoolsDir || undefined,
        allowEnablePort: !!payload.allowEnablePort,
        logDir: join(Editor.Project.path, 'temp', 'nuonuo-release'),
        onLine: (line) => log(`[上传] ${line}`),
    });

    if (result.ok) {
        if (Array.isArray(result.size) && result.size.length) {
            const total = result.size.reduce((sum, p) => sum + (p.size || 0), 0);
            log(`[上传] 包体积合计 ${uploader.formatSize(total)}`);
            for (const pkg of result.size) {
                log(`[上传]   ${pkg.name}: ${uploader.formatSize(pkg.size)}`);
            }
        }
        log(`[上传] 成功：${payload.version}`);
    }

    return result;
}

// ------------------------------------------------------------ 登录预检

/**
 * 上传前先查登录态，**放在构建之前**。
 *
 * 上传要求 IDE 已登录（登录态在 IDE 手里，CLI 只是个客户端），而没登录时 CLI 会
 * 吞掉错误并以 **0** 退出 —— 光看退出码看不出来。构建又要跑十几秒，
 * 等构建完才发现没登录太亏，所以把这一步提到最前面。
 *
 * 只拦「明确查到没登录」这一种。查不出来（工具没装、输出没读懂、超时）一律放行：
 * 宁可让上传自己去报错，也不能因为探测失灵把正常流程堵死。
 */
async function preflightLogin(payload = {}) {
    const r = await uploader.checkLogin({
        devtoolsDir: payload.devtoolsDir,
        projectDir: currentBuildDir(),
    });

    if (r.login === true) {
        log('[登录] 开发者工具已登录');
        return null;
    }
    if (r.login === false) {
        return {
            ok: false,
            message: '微信开发者工具没有登录（或登录已过期）',
            hint: '在开发者工具里扫码登录后重试；之后可用面板上的「重新检测」确认',
        };
    }
    log(`[提示] 登录态没查出来（${r.message || '未知原因'}），直接往下走`);
    return null;
}

// ------------------------------------------------------------ 主流程

async function buildAndUpload(payload = {}) {
    if (running) {
        return { ok: false, message: '已有任务在跑，等它结束再说' };
    }

    const version = String(payload.version || '').trim();
    const desc = String(payload.desc || '').trim() || `release ${version}`;

    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        return { ok: false, message: `版本号要写成 1.0.0 这样，收到的是「${version}」` };
    }
    if (version.length > 32) {
        return { ok: false, message: '版本号太长了' };
    }

    running = true;
    runId += 1;
    state.running = true;
    state.runId = runId;
    state.logs = [];
    state.logSeq = 0;
    state.lastResult = null;
    state.lastBuildPlan = null;
    state.startedAt = Date.now();

    setPhase('building', '检查登录态', 0);

    try {
        const loginFail = await preflightLogin(payload);
        if (loginFail) {
            state.lastResult = { ok: false, stage: 'preflight', message: loginFail.message, hint: loginFail.hint };
            log(`[失败] ${loginFail.message}`);
            if (loginFail.hint) log(`[提示] ${loginFail.hint}`);
            setPhase('done', loginFail.message, 0);
            return state.lastResult;
        }

        setPhase('building', payload.skipBuild ? '跳过构建' : '准备构建', 0);

        if (!payload.skipBuild) {
            const built = await runBuild(version);
            if (!built.ok) {
                state.lastResult = { ok: false, stage: 'build', message: built.message, hint: built.hint };
                log(`[失败] ${built.message}`);
                if (built.hint) log(`[提示] ${built.hint}`);
                setPhase('done', built.message, 0);
                return state.lastResult;
            }
        } else {
            log('[构建] 已跳过，直接用现有产物');
        }

        // 上传前**无条件**核对版本号。
        //
        // 游戏设置弹窗显示的就是产物 `game.js` 里注入的那个（`GameGlobal.__NUONUO_VERSION__`），
        // 读不到就显示「开发版」—— 所以这里只认它：注入值跟要发的号不一致、或者压根没注入，
        // 都拦下来。上传不可撤销，而「后台记 1.0.8、游戏里是开发版/上一个号」只有进游戏才看得出来。
        //
        // 这段原来只在「跳过构建」那条路上跑，构建那条路顶多 warn 一句就照常上传，所以漏过。
        {
            const injected = gameJsVersion(currentBuildDir());
            const what = payload.skipBuild ? '现有产物' : '刚构建出来的产物';
            let problem = null;

            if (injected === null) {
                problem = `${what}的 game.js 里没有版本号注入 —— 游戏里会显示「开发版」，`
                    + `跟后台要记的 ${version} 对不上`;
            } else if (injected !== version) {
                problem = `${what}对不上：game.js 里注入的是 ${injected}，这次要发的是 ${version}`;
            }

            if (problem) {
                const hint = payload.skipBuild
                    ? '取消勾选「跳过构建」让插件重新构建一次（它会把版本号写进 game.js），或删掉 build/wechatgame 重建'
                    : '再点一次构建通常就好；仍不行就删掉 build/wechatgame 重新构建';
                state.lastResult = { ok: false, stage: 'stale-build', message: problem, hint };
                log(`[失败] ${problem}`);
                log(`[提示] ${hint}`);
                setPhase('done', problem, 0);
                return state.lastResult;
            }

            log(`[版本] game.js 里注入的版本号确认是 ${injected}`);
        }

        const uploaded = await runUpload({ version, desc, allowEnablePort: payload.allowEnablePort });
        if (!uploaded.ok) {
            state.lastResult = {
                ok: false,
                stage: 'upload',
                message: uploaded.message,
                hint: uploaded.hint,
            };
            log(`[失败] ${uploaded.message}`);
            if (uploaded.hint) log(`[提示] ${uploaded.hint}`);
            setPhase('done', uploaded.message, 0);
            return state.lastResult;
        }

        saveSettings({ lastUploadedVersion: version, lastDesc: desc });
        state.lastResult = { ok: true, stage: 'upload', message: `已上传 ${version}`, version };
        setPhase('done', `已上传 ${version}`, 1);
        return state.lastResult;
    } catch (err) {
        const message = `出了意外：${err && err.message ? err.message : err}`;
        state.lastResult = { ok: false, stage: 'unknown', message };
        log(`[失败] ${message}`);
        setPhase('done', message, 0);
        return state.lastResult;
    } finally {
        running = false;
        state.running = false;
        state.startedAt = null;
    }
}

// ------------------------------------------------------------ 日志导出

/** 文件名用：2026-09-30_18-20-31（不用空格和冒号 —— 空格路径在 CLI 那边踩过坑） */
function fileStamp(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
        + `_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

/** 正文用：2026-09-30 18:20:31 */
function readStamp(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
        + ` ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function readPluginVersion() {
    try {
        return JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version || '?';
    } catch (_) {
        return '?';
    }
}

function describeEditor() {
    const parts = [];
    try {
        if (Editor.App && Editor.App.version) parts.push(`Cocos Creator ${Editor.App.version}`);
    } catch (_) { /* 拿不到版本号不影响导出 */ }
    parts.push(`${process.platform} ${process.arch}`);
    parts.push(`node ${process.versions.node}`);
    return parts.join(' | ');
}

/**
 * 「复制日志」要导出的文本：先一段上下文头，再是完整日志。
 *
 * 为什么要带头部：面板上看到的日志只是主进程 `log()` 写进去的那些，光看它答不出
 * 「这次构建到底开没开分离引擎」「产物目录是哪个」「环境探测成什么样」这类问题，
 * 而这些恰恰是最需要一眼看到的信息。平台选项（`packages`）里就藏着 `separateEngine`。
 *
 * 日志本身是环形缓冲（MAX_LOG_LINES），被 shift() 挤掉的旧行拿不回来。
 */
function buildDiagnosticText() {
    const now = new Date();
    const env = uploader.probe({ projectRoot: Editor.Project.path });
    const plan = loadBuildOptions();
    const settings = loadSettings();
    const out = [];

    out.push('===== nuonuo-release 诊断日志 =====');
    out.push(`导出时间: ${readStamp(now)}`);
    out.push(`插件版本: ${PKG_NAME} ${readPluginVersion()}`);
    out.push(`编辑器: ${describeEditor()}`);
    out.push(`工程路径: ${Editor.Project.path}`);
    out.push(`面板设置: version=${settings.lastVersion || ''} desc=${settings.lastDesc || ''}`
        + ` skipBuild=${!!settings.skipBuild} buildOnly=${!!settings.buildOnly}`
        + ` allowEnablePort=${!!settings.allowEnablePort}`
        + ` lastUploaded=${settings.lastUploadedVersion || ''}`);
    out.push(`运行状态: runId=${state.runId} phase=${state.phase} running=${!!state.running}`
        + (state.startedAt ? ` startedAt=${readStamp(new Date(state.startedAt))}` : ''));

    if (!state.lastResult) {
        out.push('上次结果: （本进程还没跑过任务）');
    } else if (state.lastResult.ok) {
        out.push(`上次结果: 成功 stage=${state.lastResult.stage} message=${state.lastResult.message}`);
    } else {
        out.push(`上次结果: 失败 stage=${state.lastResult.stage} message=${state.lastResult.message}`
            + (state.lastResult.hint ? ` hint=${state.lastResult.hint}` : ''));
    }

    // 优先报「这次真正用过的」参数。构建成功后 builder.json 会多出一条新记录，
    // 此时 loadBuildOptions() 拿到的是它 —— 直接报它就会和本次日志里的 taskMap key 对不上。
    const used = state.lastBuildPlan;
    if (used) {
        out.push(`本次构建参数: ${used.source} taskMap["${used.taskKey}"]（${used.sceneCount} 个场景）`);
        out.push(`本次平台选项: ${JSON.stringify(used.packages)}`);
        out.push(`产物目录: ${used.buildDir}`);
    } else if (plan.ok) {
        out.push('本次构建参数: （这次没构建 —— 跳过构建或只上传）');
        out.push(`下次构建会用: ${plan.source} taskMap["${plan.taskKey}"]（${plan.sceneCount} 个场景）`);
        out.push(`下次平台选项: ${JSON.stringify(plan.options.packages || {})}`);
        out.push(`产物目录: ${resolveBuildDir(plan.options)}`);
    } else {
        out.push(`构建参数: 不可用 —— ${plan.message}${plan.hint ? `（${plan.hint}）` : ''}`);
    }

    out.push('环境探测:');
    out.push(`  开发者工具: ${env.devtoolsOk ? env.devtoolsDir : (env.devtoolsHint || '未找到')}`);
    out.push(`  服务端口: ${env.servicePort ? '已开启' : `未开启（${env.servicePortHint || ''}）`}`);
    out.push(`  构建产物: ${env.buildExists ? env.buildDir : '还没有构建产物'}`);
    out.push(`  AppID: ${env.appid || '-'}`);

    out.push(`--- 日志（本次运行，${state.logs.length} 行，缓冲上限 ${MAX_LOG_LINES} 行）---`);
    if (!state.logs.length) out.push('（还没有日志：面板打开后没跑过任务，或者任务刚启动）');
    for (const line of state.logs) out.push(line);
    out.push('===== 日志结束 =====');

    return { text: out.join('\n'), lines: state.logs.length };
}

// --------------------------------------------------------------- 导出

exports.methods = {
    openPanel() {
        Editor.Panel.open(PKG_NAME);
    },

    /** 面板 ready() 时拉全量状态（含日志 backlog） */
    getState(payload = {}) {
        const env = uploader.probe({
            devtoolsDir: payload.devtoolsDir,
            projectRoot: Editor.Project.path,
        });
        return {
            env,
            buildPlan: describeBuildPlan(),
            settings: settingsSnapshot(),
            state: snapshot(),
        };
    },

    /** 只探测环境，不动状态。形状和 getState 的前几项一致，方便面板复用同一个渲染函数 */
    probeEnv(payload = {}) {
        return {
            env: uploader.probe({
                devtoolsDir: payload.devtoolsDir,
                projectRoot: Editor.Project.path,
            }),
            buildPlan: describeBuildPlan(),
            // 顺便把设置也带上：面板「重新检测」时能把你手改过的版本号读回来
            settings: settingsSnapshot(),
        };
    },

    /**
     * 面板「环境」卡片的登录态那一行。
     *
     * 单独一条消息（没并进 probeEnv）：查一次要起一个 CLI 进程，IDE 没在跑时
     * 这条命令还会把 IDE 拉起来，慢的时候好几秒 —— 不能拖住面板首次渲染。
     */
    checkLogin(payload = {}) {
        return uploader.checkLogin({
            devtoolsDir: payload.devtoolsDir,
            projectDir: currentBuildDir(),
        });
    },

    buildAndUpload,

    async buildOnly(payload = {}) {
        if (running) return { ok: false, message: '已有任务在跑，等它结束再说' };
        running = true;
        runId += 1;
        state.running = true;
        state.runId = runId;
        state.logs = [];
        state.logSeq = 0;
        state.lastResult = null;
        state.lastBuildPlan = null;
        state.startedAt = Date.now();
        setPhase('building', '准备构建', 0);

        // 这个勾选框是**存本机**的（关掉面板再打开也不会回默认值），很容易忘了自己勾着 ——
        // 结果点了以为在发版，其实只构建。日志里明说一句，省得对着后台找包（踩过一次）。
        log('[提示] 「只构建，不上传」是勾着的 —— 这次只构建，不会传到微信后台');

        try {
            // 只构建也把版本号打进去 —— 否则「只构建 → 勾跳过构建再上传」会传上去一个写着
            // 「开发版」的包，而后台记着另一个版本号。没填版本号就不打（包显示开发版）。
            const built = await runBuild(payload.version);
            state.lastResult = built.ok
                ? { ok: true, stage: 'build', message: '构建完成' }
                : { ok: false, stage: 'build', message: built.message, hint: built.hint };
            if (!built.ok) {
                log(`[失败] ${built.message}`);
                if (built.hint) log(`[提示] ${built.hint}`);
            }
            setPhase('done', state.lastResult.message, built.ok ? 1 : 0);
            return state.lastResult;
        } finally {
            running = false;
            state.running = false;
            state.startedAt = null;
        }
    },

    async uploadOnly(payload = {}) {
        if (running) return { ok: false, message: '已有任务在跑，等它结束再说' };
        const version = String(payload.version || '').trim();
        if (!/^\d+\.\d+\.\d+$/.test(version)) {
            return { ok: false, message: `版本号要写成 1.0.0 这样，收到的是「${version}」` };
        }
        const desc = String(payload.desc || '').trim() || `release ${version}`;

        running = true;
        runId += 1;
        state.running = true;
        state.runId = runId;
        state.logs = [];
        state.logSeq = 0;
        state.lastResult = null;
        state.lastBuildPlan = null;
        state.startedAt = Date.now();

        try {
            setPhase('uploading', '检查登录态', 0);
            const loginFail = await preflightLogin(payload);
            if (loginFail) {
                state.lastResult = { ok: false, stage: 'preflight', message: loginFail.message, hint: loginFail.hint };
                log(`[失败] ${loginFail.message}`);
                if (loginFail.hint) log(`[提示] ${loginFail.hint}`);
                setPhase('done', loginFail.message, 0);
                return state.lastResult;
            }

            const uploaded = await runUpload({ version, desc, allowEnablePort: payload.allowEnablePort });
            state.lastResult = uploaded.ok
                ? { ok: true, stage: 'upload', message: `已上传 ${version}`, version }
                : { ok: false, stage: 'upload', message: uploaded.message, hint: uploaded.hint };
            if (uploaded.ok) {
                saveSettings({ lastUploadedVersion: version, lastDesc: desc });
            } else {
                log(`[失败] ${uploaded.message}`);
                if (uploaded.hint) log(`[提示] ${uploaded.hint}`);
            }
            setPhase('done', state.lastResult.message, uploaded.ok ? 1 : 0);
            return state.lastResult;
        } finally {
            running = false;
            state.running = false;
            state.startedAt = null;
        }
    },

    /**
     * 记住面板上用户填的 / 勾的东西（上传成功时也会再存一次版本号）。
     *
     * 逐字段判断，只写传进来的那些 —— 面板是「改了哪个就发哪个」，
     * 不能无脑覆盖，否则改版本号会把勾选框清掉。
     */
    rememberSettings(payload = {}) {
        const patch = {};
        if (payload.version !== undefined) patch.lastVersion = String(payload.version || '').trim();
        if (payload.desc !== undefined) patch.lastDesc = String(payload.desc || '').trim();
        if (payload.skipBuild !== undefined) patch.skipBuild = !!payload.skipBuild;
        if (payload.buildOnly !== undefined) patch.buildOnly = !!payload.buildOnly;
        if (payload.allowEnablePort !== undefined) patch.allowEnablePort = !!payload.allowEnablePort;
        if (payload.refreshAfterBuild !== undefined) patch.refreshAfterBuild = !!payload.refreshAfterBuild;
        return saveSettings(patch);
    },

    /** 在系统文件管理器里打开构建产物目录 */
    openBuildDir() {
        const root = Editor.Project.path;
        // 产物目录还没有就退到 build/，总比什么都不开强
        const dir = [currentBuildDir(), join(root, 'build')].find((d) => existsSync(d));
        if (!dir) {
            return { ok: false, message: '还没有构建产物（build/ 目录不存在）', hint: '先构建一次' };
        }

        // 不用 shell:true，路径里的空格/中文原样传参即可。
        // explorer 成功时也返回退出码 1，所以不看退出码；detached + unref 让它不跟着编辑器走。
        const cmd = process.platform === 'win32' ? 'explorer'
            : process.platform === 'darwin' ? 'open'
                : 'xdg-open';
        try {
            const child = spawn(cmd, [dir], { detached: true, stdio: 'ignore' });
            child.on('error', (err) => console.warn('[nuonuo-release] 打开文件夹失败:', err));
            child.unref();
            return { ok: true, dir };
        } catch (err) {
            return { ok: false, message: `打不开文件夹：${err && err.message ? err.message : err}`, dir };
        }
    },

    /**
     * 面板「打开版本号文件」。
     *
     * 版本号就存在 `profiles/nuonuo-release.json` 的 `lastVersion` 里（面板打开、点「重新检测」
     * 都会把它读回来）。这里在文件管理器里**定位并选中**这个文件：
     *
     * - 比直接调默认程序打开安全：不用过 `cmd.exe`（路径含中文时 cmd 的代码页会乱码），
     *   也不依赖 .json 有没有关联编辑器；
     * - 选中之后敲一下回车就能用默认编辑器打开。
     *
     * 文件不存在就先按当前值写一份出来（一个 `{}` 会让人不知道该改哪儿）。
     */
    openVersionFile() {
        let file;
        try {
            file = ensureSettingsFile();
        } catch (err) {
            return { ok: false, message: `写设置文件失败：${err && err.message ? err.message : err}` };
        }

        const dir = dirname(file);
        // win: explorer /select,<路径> 是「选中」；mac: open -R 同义；linux 没有统一做法，开目录
        const cmd = process.platform === 'win32' ? 'explorer'
            : process.platform === 'darwin' ? 'open'
                : 'xdg-open';
        const args = process.platform === 'win32' ? [`/select,${file}`]
            : process.platform === 'darwin' ? ['-R', file]
                : [dir];

        // 和 openBuildDir 一样：不用 shell:true；explorer 成功时也返回退出码 1，所以不看退出码
        try {
            const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
            child.on('error', (err) => console.warn('[nuonuo-release] 打开版本号文件失败:', err));
            child.unref();
            return { ok: true, file, dir };
        } catch (err) {
            return { ok: false, message: `打不开：${err && err.message ? err.message : err}`, file };
        }
    },

    /**
     * 面板「复制日志」。
     *
     * 文本由主进程拼（只有它手里有完整的 state.logs 和这套构建参数），**并且每次都先落盘**：
     * 面板的 webview 里剪贴板不保证可用（navigator.clipboard 要安全上下文，
     * execCommand 也可能被拒），磁盘那份是兜底。
     *
     * 固定再写一份 `last.log` —— 排查时不用去猜这一次的时间戳文件名，直接看固定路径。
     * 目录是 `temp/nuonuo-release/`，和上传时 `-i` 的 upload-info.json 同一处。
     */
    exportLog() {
        try {
            const { text, lines } = buildDiagnosticText();
            const dir = join(Editor.Project.path, 'temp', PKG_NAME);
            const lastFile = join(dir, 'last.log');
            const file = join(dir, `log-${fileStamp(new Date())}.log`);
            mkdirSync(dir, { recursive: true });
            writeFileSync(file, text, 'utf8');
            writeFileSync(lastFile, text, 'utf8');
            return { ok: true, text, lines, chars: text.length, file, lastFile };
        } catch (err) {
            return { ok: false, message: `导出日志失败：${err && err.message ? err.message : err}` };
        }
    },
};

exports.load = function load() {
    console.log('[nuonuo-release] loaded');
};

exports.unload = function unload() {
    console.log('[nuonuo-release] unloaded');
};
