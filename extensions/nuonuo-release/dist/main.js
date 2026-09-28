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
const { join, dirname } = require('path');
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

/** 1.0.9 → 1.0.10；不是纯数字三段就原样返回 */
function bumpVersion(version) {
    const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version || '').trim());
    if (!m) return String(version || '');
    return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
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

async function runBuild() {
    const plan = loadBuildOptions();
    if (!plan.ok) {
        return { ok: false, message: plan.message, hint: plan.hint };
    }
    const options = plan.options;

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
    const buildDir = join(Editor.Project.path, 'build', 'wechatgame');

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
    state.startedAt = Date.now();

    setPhase('building', payload.skipBuild ? '跳过构建' : '准备构建', 0);

    try {
        if (!payload.skipBuild) {
            const built = await runBuild();
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

        saveSettings({ lastUploadedVersion: version, lastVersion: bumpVersion(version), lastDesc: desc });
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

// --------------------------------------------------------------- 导出

exports.methods = {
    openPanel() {
        Editor.Panel.open(PKG_NAME);
    },

    /** 面板 ready() 时拉全量状态（含日志 backlog） */
    getState(payload = {}) {
        const settings = loadSettings();
        const env = uploader.probe({
            devtoolsDir: payload.devtoolsDir,
            projectRoot: Editor.Project.path,
        });
        return {
            env,
            buildPlan: describeBuildPlan(),
            settings: {
                lastVersion: settings.lastVersion || '',
                lastDesc: settings.lastDesc || '',
                lastUploadedVersion: settings.lastUploadedVersion || '',
                // 三个勾选框的持久化（没存过就是 false）
                skipBuild: !!settings.skipBuild,
                buildOnly: !!settings.buildOnly,
                allowEnablePort: !!settings.allowEnablePort,
            },
            state: snapshot(),
        };
    },

    /** 只探测环境，不动状态。形状和 getState 的前两项一致，方便面板复用同一个渲染函数 */
    probeEnv(payload = {}) {
        return {
            env: uploader.probe({
                devtoolsDir: payload.devtoolsDir,
                projectRoot: Editor.Project.path,
            }),
            buildPlan: describeBuildPlan(),
        };
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
        state.startedAt = Date.now();
        setPhase('building', '准备构建', 0);

        try {
            const built = await runBuild();
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
        state.startedAt = Date.now();

        try {
            const uploaded = await runUpload({ version, desc, allowEnablePort: payload.allowEnablePort });
            state.lastResult = uploaded.ok
                ? { ok: true, stage: 'upload', message: `已上传 ${version}`, version }
                : { ok: false, stage: 'upload', message: uploaded.message, hint: uploaded.hint };
            if (uploaded.ok) {
                saveSettings({ lastUploadedVersion: version, lastVersion: bumpVersion(version), lastDesc: desc });
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
        return saveSettings(patch);
    },

    /** 在系统文件管理器里打开构建产物目录 */
    openBuildDir() {
        const root = Editor.Project.path;
        // 产物目录还没有就退到 build/，总比什么都不开强
        const dir = [join(root, 'build', 'wechatgame'), join(root, 'build')].find((d) => existsSync(d));
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
};

exports.load = function load() {
    console.log('[nuonuo-release] loaded');
};

exports.unload = function unload() {
    console.log('[nuonuo-release] unloaded');
};
