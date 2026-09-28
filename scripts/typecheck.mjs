#!/usr/bin/env node
/**
 * typecheck.mjs — 用 Cocos Creator 自带（或全局）的 TypeScript 对本工程做一次类型检查。
 *
 * 为什么需要它：Cocos 编辑器只在获得焦点时才编译脚本，改动后想先确认「有没有语法/类型错误」
 * 不用等编辑器；本脚本直接读 tsconfig.json + temp/declarations/cc.d.ts，跑 noEmit 全量检查。
 *
 * 用法（在 nuonuo 根目录）：
 *   node scripts/typecheck.mjs            # 只报 assets/ 下的错误
 *   node scripts/typecheck.mjs --all      # 连声明文件等所有文件的错误一起报
 *
 * TypeScript 解析顺序：环境变量 TS_PATH → Cocos 各版本的 app.asar.unpacked → 本工程 node_modules。
 */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CANDIDATES = [
  process.env.TS_PATH,
  'C:/ProgramData/cocos/editors/Creator/3.8.4/resources/app.asar.unpacked/node_modules/typescript',
  'C:/ProgramData/cocos/editors/Creator/3.8.3/resources/app.asar.unpacked/node_modules/typescript',
  path.join(ROOT, 'node_modules/typescript'),
].filter(Boolean);

let ts = null;
for (const c of CANDIDATES) {
  if (fs.existsSync(c) || fs.existsSync(c + '.js')) {
    try { ts = require(c); break } catch (e) { /* 换下一个 */ }
  }
}
if (!ts) {
  console.error('✗ 找不到 typescript。可用环境变量 TS_PATH 指定，例如：');
  console.error('  TS_PATH=/path/to/typescript node scripts/typecheck.mjs');
  process.exit(1);
}

const cfgPath = path.join(ROOT, 'tsconfig.json');
const cfg = ts.readConfigFile(cfgPath, ts.sys.readFile);
if (cfg.error) {
  console.error('✗ tsconfig.json 读取失败：', ts.flattenDiagnosticMessageText(cfg.error.messageText, ' '));
  process.exit(1);
}
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ROOT);
const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true, skipLibCheck: true });
const diagnostics = ts.getPreEmitDiagnostics(program);

const all = process.argv.includes('--all');
const assetsDir = path.join(ROOT, 'assets');
let shown = 0;
for (const d of diagnostics) {
  if (!d.file) continue;
  if (!all && !d.file.fileName.startsWith(assetsDir)) continue;
  shown += 1;
  const rel = path.relative(ROOT, d.file.fileName).replace(/\\/g, '/');
  const pos = d.file.getLineAndCharacterOfPosition(d.start);
  console.log(`${rel}:${pos.line + 1}:${pos.character + 1}  ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
}

console.log(`\n—— 结果 —— TypeScript ${ts.version}，检查 ${parsed.fileNames.length} 个文件，问题 ${shown} 处${all ? '' : '（仅 assets/，--all 看全部）'}`);
process.exit(shown ? 1 : 0);
