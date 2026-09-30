'use strict';

/**
 * 微信开发者工具 CLI 的上传封装 —— 零第三方依赖，只用 Node 内置模块。
 *
 * 两个关键点（踩过才知道，别改）：
 *
 * 1. 不要走 cli.bat，也不要 `shell: true`。
 *    cli.bat 的内容就是 `<install>\node.exe <install>\cli.js %*`，所以这里直接 spawn 这两个文件、
 *    `shell: false`、参数逐个放进数组 —— 描述里的空格 / 中文 / 引号 / `&` 全都不需要转义，
 *    也就没有 cmd.exe 的命令注入面和代码页乱码问题。
 *
 * 2. 必须用开发者工具自带的那个 node.exe。
 *    cli.js 内部用 `installPath = dirname(process.execPath)` 算 productHash → 再算 userDirPath
 *    → 再去读 `.ide-status`。换成系统 node 或编辑器内置 node，execPath 一变 hash 就变，
 *    它会以为服务端口没开、或者连不上已经开着的 IDE。
 */

const { spawn } = require('child_process');
const {
    existsSync, readdirSync, readFileSync, statSync, unlinkSync, mkdirSync,
} = require('fs');
const { join, dirname } = require('path');
const os = require('os');
const http = require('http');
const { StringDecoder } = require('string_decoder');

/** 退出码：CLI 里 `IDE_SERVICE_PORT_DISABLED = -10`，Windows 上 libuv 会报成无符号值 */
const EXIT_PORT_DISABLED = -10;
const EXIT_PORT_DISABLED_UINT = 4294967286;

const DEVTOOLS_DIR_NAMES = ['微信web开发者工具', '微信开发者工具'];

// ---------------------------------------------------------------- 工具函数

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const stripAnsi = (s) => s.replace(ANSI_RE, '');

/** 按行切分子进程输出，正确处理跨 chunk 的多字节字符 */
function makeLineFeeder(onLine) {
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    return (chunk) => {
        buffer += decoder.write(chunk);
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = stripAnsi(buffer.slice(0, idx).replace(/\r$/, ''));
            buffer = buffer.slice(idx + 1);
            if (line) onLine(line);
        }
    };
}

// ------------------------------------------------------- 定位开发者工具

function candidateDevtoolsDirs(explicit) {
    const list = [];
    if (explicit) list.push(explicit);
    if (process.env.WECHAT_DEVTOOLS_HOME) list.push(process.env.WECHAT_DEVTOOLS_HOME);

    const roots = [
        process.env['ProgramFiles(x86)'],
        process.env['ProgramFiles'],
        process.env.LOCALAPPDATA,
    ].filter(Boolean);

    for (const root of roots) {
        for (const name of DEVTOOLS_DIR_NAMES) {
            list.push(join(root, 'Tencent', name));
            list.push(join(root, name));
        }
    }
    return list;
}

/** 找到同时含 node.exe 与 cli.js 的目录；找不到返回 null */
function resolveDevtools(explicit) {
    for (const dir of candidateDevtoolsDirs(explicit)) {
        const nodeExe = join(dir, 'node.exe');
        const cliJs = join(dir, 'cli.js');
        if (existsSync(nodeExe) && existsSync(cliJs)) return { dir, nodeExe, cliJs };
    }
    return null;
}

// ------------------------------------------------- 服务端口（前置条件）

/**
 * 「设置 → 安全设置 → 服务端口」的状态存在
 * `%LOCALAPPDATA%\微信开发者工具\User Data\<productHash>\Default\.ide-status`，内容为 `On` 才算开。
 *
 * <productHash> = md5(installPath + nwVersion)，不要去自己算（算错了就永远查不到），扫目录。
 */
function checkServicePort() {
    const local = process.env.LOCALAPPDATA || join(os.homedir(), 'AppData', 'Local');
    const base = join(local, '微信开发者工具', 'User Data');
    if (!existsSync(base)) {
        return { ok: false, reason: 'devtools-never-run' };
    }

    let hashes = [];
    try { hashes = readdirSync(base); } catch (_) { /* 读不到就当没开 */ }

    for (const hash of hashes) {
        const statusFile = join(base, hash, 'Default', '.ide-status');
        try {
            if (String(readFileSync(statusFile, 'utf8')).trim() === 'On') {
                return { ok: true, statusFile };
            }
        } catch (_) { /* 这个 hash 目录没有，继续 */ }
    }

    return {
        ok: false,
        reason: 'port-disabled',
        hint: '打开微信开发者工具 → 设置 → 安全设置 → 打开「服务端口」',
    };
}

// --------------------------------------------------- 让工具重新读产物

/**
 * 服务端口的**端口号**，和 `.ide-status` 在同一个 `Default` 目录下、文件名是 `.ide`，内容就是数字。
 * 找不到返回 null（工具没跑过 / 没开服务端口）。
 */
function findServicePort() {
    const local = process.env.LOCALAPPDATA || join(os.homedir(), 'AppData', 'Local');
    const base = join(local, '微信开发者工具', 'User Data');
    let hashes = [];
    try { hashes = readdirSync(base); } catch (_) { return null; }

    for (const hash of hashes) {
        const dir = join(base, hash, 'Default');
        try {
            if (String(readFileSync(join(dir, '.ide-status'), 'utf8')).trim() !== 'On') continue;
            const port = Number(String(readFileSync(join(dir, '.ide'), 'utf8')).trim());
            if (Number.isInteger(port) && port > 0) return port;
        } catch (_) { /* 这个 hash 目录不全，换下一个 */ }
    }
    return null;
}

/** 极简 GET，失败一律 resolve（刷新失败不该拖垮发版流程） */
function httpGet(url, timeoutMs) {
    return new Promise((resolve) => {
        let settled = false;
        const done = (v) => { if (!settled) { settled = true; resolve(v); } };
        let req;
        try {
            req = http.get(url, (res) => {
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString('utf8');
                    // 这套接口成功时回 {"error":0,...}；HTTP 200 但 error 非 0 也算失败
                    let apiError = null;
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed && parsed.error !== undefined && Number(parsed.error) !== 0) {
                            apiError = parsed.message || `error=${parsed.error}`;
                        }
                    } catch (_) { /* 不是 JSON 就看 HTTP 状态 */ }
                    if (apiError) done({ ok: false, error: String(apiError) });
                    else if (res.statusCode >= 400) done({ ok: false, error: `HTTP ${res.statusCode}` });
                    else done({ ok: true, body });
                });
            });
        } catch (err) {
            done({ ok: false, error: err && err.message ? err.message : String(err) });
            return;
        }
        req.on('error', (err) => done({ ok: false, error: err && err.message ? err.message : String(err) }));
        req.setTimeout(timeoutMs || 15000, () => {
            try { req.destroy(); } catch (_) { /* 已经烂了 */ }
            done({ ok: false, error: '请求超时' });
        });
    });
}

/**
 * 让开发者工具**重新读一遍产物**。
 *
 * 为什么需要它：Cocos 每次构建都把 `build/wechatgame` 里的文件整批重写，而开发者工具内部给项目
 * 建的文件缓存 / 监听不跟着更新 —— 表现就是「构建完了，点『编译』还是旧代码，非得『全部清除』
 * 才行」（Cocos 论坛 166556 同款，官方没给解法）。
 *
 * 而「全部清除」会连**数据缓存（Storage）**一起清掉，单机游戏的存档就在里面
 * （`nuonuo_save` / `nuonuo_daily_reward`），绝对不能那么干。所以走官方 HTTP 接口，
 * 只做这几件安全的事：
 *
 * - `/v2/resetfileutils`  —— 重置工具内部文件缓存，重新监听项目文件；
 * - `/v2/cleancache?clean=compile` —— 清编译缓存（编译过的脚本 bundle 卡在这儿）；
 * - `/v2/cleancache?clean=file`    —— 清文件缓存（模拟器里那份代码包卡在这儿）。
 *
 * 实测只清 `compile` 不够（「点编译还是旧代码」照旧），所以 `file` 也一起清。
 *
 * `clean` 的合法值是 `storage(数据) / file(文件) / seeion(登陆) / auth(授权) / network(网络) /
 * compile(编译) / all(所有)`。**这里绝对不能传 `storage` 或 `all`** —— 那就是在清存档。
 *
 * @param {string} projectDir 产物目录（= 开发者工具里打开的那个项目路径）
 */
async function refreshProject(projectDir) {
    if (!projectDir) return { ok: false, message: '没给产物目录' };

    const port = findServicePort();
    if (!port) {
        return {
            ok: false,
            skipped: true,
            message: '开发者工具没在跑（或没开服务端口），跳过刷新 —— 下次打开项目时它会重新编译',
        };
    }

    const q = `project=${encodeURIComponent(projectDir)}`;
    const reset = await httpGet(`http://127.0.0.1:${port}/v2/resetfileutils?${q}`);
    const clean = await httpGet(`http://127.0.0.1:${port}/v2/cleancache?clean=compile&${q}`);
    const cleanFile = await httpGet(`http://127.0.0.1:${port}/v2/cleancache?clean=file&${q}`);

    const steps = [
        { step: 'resetfileutils', ...reset },
        { step: 'cleancache(compile)', ...clean },
        { step: 'cleancache(file)', ...cleanFile },
    ];
    const ok = steps.every((s) => s.ok);
    return {
        ok,
        port,
        steps,
        message: ok
            ? '已让开发者工具重新读产物（重置文件监听 + 清了编译/文件缓存，存档没动）'
            : '刷新开发者工具没成功，可能要手动到工具里「清缓存 → 编译 / 文件」',
    };
}

// ------------------------------------------------------------- 跑子进程

/**
 * Windows 上 child.kill() 只杀直接子进程，而 cli.js 还会再 spawn 一层 node.exe。
 * 不用 /T 会留下孤儿进程继续占着服务端口。改用 taskkill 杀整棵树。
 */
function killTree(child) {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    try {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
                windowsHide: true, stdio: 'ignore',
            });
            return;
        }
    } catch (_) { /* 回落到 kill */ }
    try { child.kill('SIGKILL'); } catch (_) { /* 已经没了 */ }
}

/**
 * 跑一次开发者工具 CLI。
 *
 * @param {object} devtools  resolveDevtools() 的返回值
 * @param {string[]} args    cli.js 之后的参数，逐个传，不要自己加引号
 * @param {object} opts      { cwd, timeoutMs, onLine, stdinAnswer }
 * @returns {{ child: object, done: Promise<object> }}
 */
function runCli(devtools, args, opts = {}) {
    const {
        cwd,
        timeoutMs = 5 * 60 * 1000,
        onLine,
        stdinAnswer = 'n',
    } = opts;

    const child = spawn(devtools.nodeExe, [devtools.cliJs, ...args], {
        cwd,
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
    });

    // CLI 只在「服务端口没开」时会读 stdin（inquirer 的 confirm），其他时候从不读，
    // 所以这里写一个答案再立刻 EOF：多写的两个字节无害，但少了它就会永久挂起。
    try {
        child.stdin.on('error', () => {});   // 进程提前退出时的 EPIPE，忽略
        child.stdin.write(stdinAnswer + '\n');
        child.stdin.end();
    } catch (_) { /* 管道已关，忽略 */ }

    const feed = makeLineFeeder(onLine || (() => {}));
    child.stdout.on('data', feed);
    child.stderr.on('data', feed);

    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        killTree(child);
    }, timeoutMs);

    const done = new Promise((resolve) => {
        child.on('error', (error) => {
            clearTimeout(timer);
            resolve({ code: null, signal: null, error, timedOut });
        });
        child.on('close', (code, signal) => {
            clearTimeout(timer);
            resolve({ code, signal, timedOut });
        });
    });

    return { child, done };
}

// ------------------------------------------------------------ 环境探测

function readAppid(buildDir) {
    if (!buildDir) return null;
    try {
        const cfg = JSON.parse(readFileSync(join(buildDir, 'project.config.json'), 'utf8'));
        return cfg.appid || null;
    } catch (_) {
        return null;
    }
}

/**
 * 面板打开时调一次，把环境状态一次性给它。
 *
 * 注意参数语义：这里收的是 **Cocos 工程根目录**（`projectRoot`），产物目录由它推出
 * `<root>/build/wechatgame`。而 upload() 的 `projectDir` 收的是**产物目录本身**——
 * 两个名字像但含义不同，别搞混（搞混会拼成 build/wechatgame/build/wechatgame）。
 *
 * @param {object} o  { devtoolsDir, projectRoot, buildDir }
 *   buildDir 显式给出时优先（命令行 `--project` 那种场景）。
 */
function probe(o = {}) {
    const devtools = resolveDevtools(o.devtoolsDir);
    const port = checkServicePort();
    const buildDir = o.buildDir || (o.projectRoot ? join(o.projectRoot, 'build', 'wechatgame') : null);
    const buildExists = !!(buildDir && existsSync(join(buildDir, 'project.config.json')));

    return {
        devtoolsDir: devtools ? devtools.dir : null,
        devtoolsOk: !!devtools,
        devtoolsHint: devtools ? null : '没找到微信开发者工具，请确认安装路径或设 WECHAT_DEVTOOLS_HOME',
        servicePort: port.ok,
        servicePortReason: port.reason || null,
        servicePortHint: port.ok ? null : (port.hint || '请先启动一次微信开发者工具'),
        buildDir,
        buildExists,
        appid: readAppid(buildExists ? buildDir : null),
    };
}

// ------------------------------------------------------------ 登录态

/**
 * 查登录态（`cli.js islogin`），返回 `{ login: true|false|null }`，null 表示查不出来。
 *
 * 为什么上传要看这个：登录态在 **IDE 自己手里**，CLI 只是个 HTTP 客户端，通过
 * `127.0.0.1:<服务端口>` 跟 IDE 说话，上传请求最终由 IDE 带着登录身份发出去。
 * IDE 没登录 → 上传必然失败。而 CLI 的 v2 命令 catch 住错误后**照样以 0 退出**
 * （`r.error` 就是个 console.log，后面没有任何 process.exit），所以光看退出码
 * 是看不出「没登录」的，得主动查。
 *
 * 注意：IDE 没在跑时这条命令会**把 IDE 拉起来**（会打印 `IDE server has started`），
 * 所以超时给得比上传宽松。
 *
 * @param {object} o { devtoolsDir, projectDir, timeoutMs, onLine }
 */
async function checkLogin(o = {}) {
    const devtools = resolveDevtools(o.devtoolsDir);
    if (!devtools) return { login: null, message: '没找到微信开发者工具' };

    const collected = [];
    const args = ['islogin'];
    if (o.projectDir) args.push('--project', o.projectDir);

    const { done } = runCli(devtools, args, {
        cwd: devtools.dir,
        timeoutMs: o.timeoutMs || 60 * 1000,
        stdinAnswer: 'n',          // islogin 不读 stdin，照写一个防挂起
        onLine: (line) => {
            collected.push(line);
            if (o.onLine) o.onLine(line);
        },
    });

    const result = await done;
    if (result.error) return { login: null, message: `查登录态失败：${result.error.message}` };
    if (result.timedOut) return { login: null, message: '查登录态超时' };

    // 正常输出里就是单独一行 {"login":true}（CLI 源码：console.log("\n" + JSON.stringify(e))）
    for (const line of collected) {
        const m = /^\s*(\{.*\})\s*$/.exec(line);
        if (!m) continue;
        try {
            const parsed = JSON.parse(m[1]);
            if (typeof parsed.login === 'boolean') return { login: parsed.login };
        } catch (_) { /* 不是 JSON，接着找 */ }
    }

    // JSON 那行被 spinner 搅了的话，正则兜底
    const m = /"login"\s*:\s*(true|false)/.exec(collected.join('\n'));
    if (m) return { login: m[1] === 'true' };

    return { login: null, message: '没读懂 islogin 的输出' };
}

// -------------------------------------------------------------- 上传

/**
 * 从 CLI 输出里认出几类高发失败，好给一句能直接照做的提示。
 *
 * 只在上传**已经确定失败**之后调用（`-i` 没被写出来），所以不用担心误伤成功输出。
 * 匹配的是 CLI / 服务端回的错误文本（中文为主，也有 node 的 fs 报错），
 * 宁可漏认也别错认 —— 错认会把真实错误盖掉。
 *
 * 前两条是「产物和开发者工具对不上」这一族，放在最前面：它们的特征串最具体
 * （`ENOENT` / `require args is`），而且一旦命中，真实原因就是文件层面的事实，
 * 不该被后面那些语义模糊的中文关键词抢走。
 *
 * @param {string[]} lines       上传过程的完整输出
 * @param {string} [projectDir]  这次要传的产物目录，用来确认 ENOENT 缺的确实是产物里的文件
 */
function classifyOutput(lines, projectDir) {
    const text = lines.join('\n');

    // 产物里少了文件。真实案例：改过构建配置（尤其开/关「分离引擎」）之后，cocos-js 里的
    // 引擎文件整套换名（分离引擎是 plugin:cocos/* + 本地 ./custom-pipeline.js，
    // 非分离引擎是 ./_virtual_cc-<hash>.js），而开发者工具还拿着**上一版 cc.js 的依赖数组**
    // 去做预编译（compile_start）—— 撞上第一个已经不存在的相对路径就 ENOENT。
    // 产物本身是好的，坏的是 IDE 那边缓存的文件清单。
    if (/ENOENT/.test(text) && /no such file or directory/i.test(text)) {
        const m = /open\s+'([^']+)'/.exec(text);
        const missing = m ? m[1] : '';
        // 缺的必须真在产物目录里才认这一条。别的 ENOENT（比如 CLI 自己缺文件）套这个结论
        // 就是错认，宁可漏认。CLI 输出里的路径是正斜杠、可能大小写不同，两边都归一化再比。
        const norm = (p) => String(p).replace(/\\/g, '/').toLowerCase();
        if (missing && (!projectDir || norm(missing).startsWith(norm(projectDir)))) {
            return {
                kind: 'artifact-missing',
                message: `开发者工具读不到产物里的文件：${missing}`,
                hint: '产物本身没问题，是开发者工具还按上一版的产物清单在预编译（多见于改过构建配置、'
                    + '尤其开/关「分离引擎」之后）。先完全退出开发者工具（含后台进程）再重传；'
                    + '不行就到工具里「工具 → 清除缓存 → 全部清除」，打开项目编译一次确认能过，然后重传。',
            };
        }
    }

    // 开发者工具的模块加载器找不到模块。真实案例：开着「分离引擎」构建出来的包，
    // 引擎跑到插件子上下文里，项目根目录的 ./web-adapter 就不在它的模块表里了。
    if (/is not defined,\s*require args is/i.test(text)) {
        return {
            kind: 'module-not-found',
            message: '开发者工具加载产物模块失败：module ... is not defined',
            hint: '多半是「分离引擎」这条路的问题：先在工具里清除缓存重新编译；'
                + '若构建面板勾着「分离引擎（启用微信引擎插件）」，还要确认该游戏 AppID 已在'
                + '微信公众平台 → 设置 → 第三方设置 → 插件管理里添加了 Cocos 引擎插件 wx0446ba2621dda60a。',
        };
    }

    if (/未登录|请先登录|重新登录|登录过期|登录已过期|login expired|not logged in|please login|login required/i.test(text)) {
        return {
            kind: 'not-login',
            message: '微信开发者工具没有登录（或登录已过期）',
            hint: '在开发者工具里扫码登录后重试；面板上「重新检测」可以确认登录态',
        };
    }

    // 注意写 `(小游戏|小程序)` 而不是 `小游戏?` —— 后者只让「戏」可选，匹配不到「小程序」
    if (/无权限|没有权限|权限不足|不是该(小游戏|小程序)的开发者|no permission|permission denied|not authorized/i.test(text)) {
        return {
            kind: 'no-permission',
            message: '当前登录的微信号没有这个 AppID 的上传权限',
            hint: '确认登录的账号是该 AppID 的开发者（微信公众平台 → 成员管理）；AppID 见上面「环境」卡片',
        };
    }

    return null;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
function formatSize(bytes) {
    if (typeof bytes !== 'number' || !isFinite(bytes)) return '-';
    let n = bytes;
    let i = 0;
    while (n >= 1024 && i < SIZE_UNITS.length - 1) { n /= 1024; i += 1; }
    return `${i === 0 ? n : n.toFixed(2)} ${SIZE_UNITS[i]}`;
}

/** 把 `-i` 产出的 JSON 读成 [{name, size}]，读不到返回 null */
function readUploadInfo(infoFile) {
    try {
        const info = JSON.parse(readFileSync(infoFile, 'utf8'));
        const packages = info && info.size && info.size.packages;
        if (!Array.isArray(packages)) return null;
        return packages.map((p) => ({ name: p.name, size: p.size }));
    } catch (_) {
        return null;
    }
}

/**
 * 上传一个版本到微信后台。
 *
 * @param {object} o
 * @param {string} o.projectDir       构建产物目录，一般是 <项目>/build/wechatgame
 * @param {string} o.version          版本号（CLI 必填）
 * @param {string} o.desc             版本描述（CLI 必填）
 * @param {string} [o.devtoolsDir]    手动指定开发者工具目录
 * @param {boolean} [o.allowEnablePort] 服务端口没开时是否允许 CLI 自动开启（会往 stdin 写 y）
 * @param {string} [o.logDir]         `-i` 的落盘目录
 * @param {number} [o.timeoutMs]
 * @param {(line: string) => void} [o.onLine]
 * @returns {Promise<{ok: boolean, kind?: string, message?: string, hint?: string,
 *                    size?: Array<{name: string, size: number}>}>}
 */
async function upload(o) {
    const {
        projectDir,
        version,
        desc,
        devtoolsDir,
        allowEnablePort = false,
        timeoutMs = 4 * 60 * 1000,
        onLine,
    } = o;

    const log = onLine || (() => {});

    if (!projectDir || !existsSync(join(projectDir, 'project.config.json'))) {
        return {
            ok: false,
            kind: 'no-build',
            message: `产物目录里没有 project.config.json：${projectDir || '(未指定)'}`,
            hint: '请先构建一次微信小游戏',
        };
    }

    const devtools = resolveDevtools(devtoolsDir);
    if (!devtools) {
        return {
            ok: false,
            kind: 'no-devtools',
            message: '没找到微信开发者工具（需要目录下同时有 node.exe 和 cli.js）',
            hint: '确认安装路径，或设置环境变量 WECHAT_DEVTOOLS_HOME 指向安装目录',
        };
    }
    log(`[工具] ${devtools.dir}`);

    const port = checkServicePort();
    if (!port.ok && !allowEnablePort) {
        return {
            ok: false,
            kind: 'port-disabled',
            message: '微信开发者工具的「服务端口」没有开启',
            hint: port.hint || '打开微信开发者工具 → 设置 → 安全设置 → 打开「服务端口」',
        };
    }
    if (!port.ok) {
        log('[提示] 服务端口未开启，已让 CLI 以 --enable-service-port 方式拉起工具');
    }

    const logDir = o.logDir || join(os.tmpdir(), 'nuonuo-release');
    const infoFile = join(logDir, 'upload-info.json');
    try {
        mkdirSync(dirname(infoFile), { recursive: true });
        // 先删掉旧文件：CLI 失败时不写这个文件，靠「有没有被重新写出来」判断成败
        if (existsSync(infoFile)) unlinkSync(infoFile);
    } catch (_) { /* 删不掉也继续，后面还有文本兜底 */ }

    // v2 语法。注意 yargs 没有 .strict()，未知参数会被忽略而不是报错。
    const args = [
        'upload',
        '--project', projectDir,
        '-v', String(version),
        '-d', String(desc),
        '-i', infoFile,
    ];
    log(`[命令] node.exe cli.js ${['upload', '--project', projectDir, '-v', version, '-d', desc].join(' ')}`);

    const collected = [];
    const { done } = runCli(devtools, args, {
        cwd: devtools.dir,
        timeoutMs,
        stdinAnswer: allowEnablePort ? 'y' : 'n',
        onLine: (line) => {
            collected.push(line);
            log(line);
        },
    });

    const result = await done;

    if (result.error) {
        return { ok: false, kind: 'spawn-error', message: `启动 CLI 失败：${result.error.message}` };
    }
    if (result.timedOut) {
        return { ok: false, kind: 'timeout', message: `上传超时（${Math.round(timeoutMs / 1000)} 秒），已强制结束进程树` };
    }
    if (result.code === EXIT_PORT_DISABLED || result.code === EXIT_PORT_DISABLED_UINT) {
        return {
            ok: false,
            kind: 'port-disabled',
            message: '微信开发者工具的「服务端口」没有开启',
            hint: port.hint || '打开微信开发者工具 → 设置 → 安全设置 → 打开「服务端口」',
        };
    }

    // 成功判定不能只看退出码：CLI 的 v2 命令 catch 住错误后照样走完主流程以 0 退出。
    // 所以优先看 `-i` 有没有被重新写出来（这才是产物）。
    const size = existsSync(infoFile) ? readUploadInfo(infoFile) : null;
    if (size) {
        return { ok: true, size, infoFile };
    }

    if (result.code && result.code !== 0) {
        const classified = classifyOutput(collected, projectDir);
        if (classified) return { ok: false, ...classified };
        return { ok: false, kind: 'exit-code', message: `CLI 退出码 ${result.code}，上传未完成` };
    }

    // 最后一道兜底：CLI 成功时会打 `✔ upload` / `upload success`
    if (/✔\s*upload|upload success|上传成功/i.test(collected.join('\n'))) {
        return { ok: true, size: null, infoFile };
    }

    // 走到这儿就是真失败了。产物缺文件 / 模块找不到 / 没登录 / 没权限是最常见的几种，
    // 认出来给一句能直接照做的提示，比笼统的「CLI 吞了错误」有用得多。
    const classified = classifyOutput(collected, projectDir);
    if (classified) return { ok: false, ...classified };

    return {
        ok: false,
        kind: 'upload-failed',
        message: '上传没有成功（CLI 失败时会吞掉错误并以退出码 0 结束，请看上方完整输出）',
    };
}

module.exports = {
    probe,
    upload,
    checkLogin,
    classifyOutput,
    resolveDevtools,
    checkServicePort,
    findServicePort,
    refreshProject,
    formatSize,
    EXIT_PORT_DISABLED,
    EXIT_PORT_DISABLED_UINT,
};
