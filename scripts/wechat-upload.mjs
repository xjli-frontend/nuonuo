#!/usr/bin/env node
/**
 * wechat-upload.mjs — 不开编辑器，直接把构建产物传到微信后台。
 *
 * 为什么需要它：编辑器扩展（extensions/nuonuo-release）适合「构建 + 上传」一条龙，
 * 但只想重传一次、或者想在 CI / 别的终端里传的时候，开编辑器太重。这个脚本复用
 * 扩展里同一份 CLI 封装（dist/wechat-upload.js），保证两条路的判定逻辑完全一致。
 *
 * 用法（在 nuonuo 根目录）：
 *   node scripts/wechat-upload.mjs --check                 # 只探测环境，不上传
 *   node scripts/wechat-upload.mjs -v 1.0.1 -d "修复闪退"   # 上传
 *   node scripts/wechat-upload.mjs -v 1.0.1 --project ./build/wechatgame
 *
 * 前置条件（跟扩展面板里显示的一致）：
 *   1. 微信开发者工具已安装（目录下同时有 node.exe 和 cli.js）
 *   2. 「设置 → 安全设置 → 服务端口」已开启（或用 --allow-enable-port 让它自己拉起来）
 *   3. build/wechatgame 里已有构建产物（project.config.json 存在）
 */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const WRAPPER = path.join(ROOT, 'extensions', 'nuonuo-release', 'dist', 'wechat-upload.js');
if (!fs.existsSync(WRAPPER)) {
  console.error(`✗ 找不到扩展里的封装：${WRAPPER}`);
  process.exit(1);
}
const wx = require(WRAPPER);

// ------------------------------------------------------------------ 参数

const HELP = `
用法：node scripts/wechat-upload.mjs [选项]

  -v, --version <x.y.z>   版本号（上传时必填）
  -d, --desc <文字>       版本描述（留空则为 "release <版本号>"）
      --project <目录>    构建产物目录（默认 <工程>/build/wechatgame）
      --devtools <目录>   微信开发者工具安装目录（优先于自动探测）
      --allow-enable-port 服务端口没开时允许 CLI 自己开启（默认不动这个安全设置）
      --timeout <秒>      上传超时（默认 240）
  -c, --check             只检查环境，不上传
  -h, --help              显示这段帮助

退出码：0 成功 / 1 失败 / 2 参数错误
`.trim();

function parseArgs(argv) {
  const out = { check: false, allowEnablePort: false, timeoutSec: 240 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('-')) {
        console.error(`✗ ${a} 后面要跟一个值`);
        process.exit(2);
      }
      i += 1;
      return v;
    };
    switch (a) {
      case '-v': case '--version': out.version = next(); break;
      case '-d': case '--desc': out.desc = next(); break;
      case '--project': out.project = next(); break;
      case '--devtools': out.devtools = next(); break;
      case '--timeout': out.timeoutSec = Number(next()); break;
      case '--allow-enable-port': out.allowEnablePort = true; break;
      case '-c': case '--check': out.check = true; break;
      case '-h': case '--help': console.log(HELP); process.exit(0); break;
      default:
        console.error(`✗ 不认识的参数：${a}\n\n${HELP}`);
        process.exit(2);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const projectDir = path.resolve(args.project || path.join(ROOT, 'build', 'wechatgame'));

// ------------------------------------------------------------------ 执行

const tick = (ok) => (ok ? '✓' : '✗');

const env = wx.probe({ devtoolsDir: args.devtools, projectRoot: ROOT, buildDir: projectDir });

console.log('环境：');
console.log(`  ${tick(env.devtoolsOk)} 开发者工具  ${env.devtoolsOk ? env.devtoolsDir : env.devtoolsHint}`);
console.log(`  ${tick(env.servicePort)} 服务端口    ${env.servicePort ? '已开启' : env.servicePortHint}`);
console.log(`  ${tick(env.buildExists)} 构建产物    ${env.buildExists ? env.buildDir : `没有（${projectDir}）`}`);
console.log(`  · AppID      ${env.appid || '-'}`);

if (args.check) {
  const ok = env.devtoolsOk && env.servicePort && env.buildExists;
  process.exit(ok ? 0 : 1);
}

if (!args.version) {
  console.error('\n✗ 缺少版本号：-v 1.0.1');
  process.exit(2);
}
if (!/^\d+\.\d+\.\d+$/.test(args.version)) {
  console.error(`\n✗ 版本号要写成 1.0.0 这样，现在是「${args.version}」`);
  process.exit(2);
}
if (!Number.isFinite(args.timeoutSec) || args.timeoutSec <= 0) {
  console.error('\n✗ --timeout 要给一个正数（秒）');
  process.exit(2);
}

const desc = (args.desc || '').trim() || `release ${args.version}`;

console.log('');
const result = await wx.upload({
  projectDir,
  version: args.version,
  desc,
  devtoolsDir: args.devtools,
  allowEnablePort: args.allowEnablePort,
  timeoutMs: args.timeoutSec * 1000,
  logDir: path.join(ROOT, 'temp', 'nuonuo-release'),
  onLine: (line) => console.log(`  ${line}`),
});

if (result.ok) {
  if (Array.isArray(result.size) && result.size.length) {
    const total = result.size.reduce((n, p) => n + (p.size || 0), 0);
    console.log(`\n✓ 上传成功 ${args.version}，包体积合计 ${wx.formatSize(total)}`);
    for (const p of result.size) console.log(`    ${p.name}: ${wx.formatSize(p.size)}`);
  } else {
    console.log(`\n✓ 上传成功 ${args.version}`);
  }
  process.exit(0);
}

console.error(`\n✗ ${result.message}`);
if (result.hint) console.error(`  ${result.hint}`);
process.exit(1);
