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

// -------------------------------------------------------------- 上传

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
        return { ok: false, kind: 'exit-code', message: `CLI 退出码 ${result.code}，上传未完成` };
    }

    // 最后一道兜底：CLI 成功时会打 `✔ upload` / `upload success`
    if (/✔\s*upload|upload success|上传成功/i.test(collected.join('\n'))) {
        return { ok: true, size: null, infoFile };
    }

    return {
        ok: false,
        kind: 'upload-failed',
        message: '上传没有成功（CLI 失败时会吞掉错误并以退出码 0 结束，请看上方完整输出）',
    };
}

module.exports = {
    probe,
    upload,
    resolveDevtools,
    checkServicePort,
    formatSize,
    EXIT_PORT_DISABLED,
    EXIT_PORT_DISABLED_UINT,
};
