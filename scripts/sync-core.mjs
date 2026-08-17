#!/usr/bin/env node
/**
 * sync-core.mjs — 把「挪挪收纳屋」的引擎无关核心逻辑同步进本工程
 *
 * 方向：挪挪收纳屋/src  →  assets/Script/nuonuo/   （单向：只读源、只写工程内）
 * 只覆盖 .ts 内容，.meta 一律不碰（符合 CLAUDE.md 约定：保留文件名 + .meta）。
 *
 * 源工程里 DOM/Canvas 耦合的文件（scenes/* / systems/BoardRenderer / managers/InputManager
 * / core/GameApp / editor/* / ui/Button / main.ts / assets/GameAssets）不在白名单内，自然被跳过。
 * 白名单只含「纯逻辑」文件，其中两处做过引擎无关化适配，由脚本内 transform 自动完成：
 *   - core/GameState.ts：localStorage → getStorageAdapter()（注入 Storage 适配器）
 *   - utils/Utils.ts：删除依赖 DOM 的 screenToCanvas()，换成一段说明
 * 因此源工程更新后可直接同步，无需再手工做适配。
 *
 * 用法（在 nuonuo 根目录）：
 *   node scripts/sync-core.mjs            # 只对比，打印差异（安全，不写文件）
 *   node scripts/sync-core.mjs --apply    # 真正同步
 *
 * 源工程路径默认按本机目录布局推断，可用环境变量 NUONUO_SRC 覆盖。
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRC = process.env.NUONUO_SRC
  || path.join(ROOT, '..', '..', '挪挪收纳屋', 'src');   // 只读
const DEST = path.join(ROOT, 'assets', 'Script', 'nuonuo'); // 只写

// 白名单：源工程里的纯逻辑文件（相对 src 路径）
const FILES = [
  'config/GameConfig.ts',
  'config/LevelConfig.ts',
  'core/EventCenter.ts',
  'core/GameState.ts',      // transform：localStorage → Storage 适配器
  'core/ObjectPool.ts',
  'systems/Board.ts',
  'systems/CollisionSystem.ts',
  'systems/PathCalculator.ts',
  'types/index.ts',
  'utils/Utils.ts',         // transform：删除 screenToCanvas
];

// 需要做引擎无关化适配的文件 → transform 函数
const TRANSFORMS = {
  'core/GameState.ts': adaptGameState,
  'utils/Utils.ts': adaptUtils,
};

// 工程内本地文件：源工程没有，同步时绝不覆盖/删除
const LOCAL_FILES = new Set([
  'core/Storage.ts',   // Storage 适配器（由 NuonuoBootstrap 注入，源工程无）
  'index.ts',          // 统一出口 barrel（本工程新增）
]);

const APPLY = process.argv.includes('--apply');

// ========== transform 实现 ==========

/** 探测源文件换行符（Windows 工程常用 CRLF，脚本拼接多行文本时保持一致） */
function eolOf(src) {
  return src.includes('\r\n') ? '\r\n' : '\n';
}

/** 整词替换所有出现的字面量文本；找不到就抛错（与 localStorage 检测一致：宁可失败也别静默漂移） */
function replaceComment(text, from, to) {
  if (!text.includes(from)) {
    throw new Error(`未找到注释文案「${from}」，源结构可能已变化`);
  }
  return text.split(from).join(to);
}

/** GameState：注入 Storage 适配器，把 localStorage 换成 getStorageAdapter() */
function adaptGameState(src) {
  const EOL = eolOf(src);
  let out = src;

  // 1. 注入 import（幂等：已注入则跳过）
  if (!out.includes('getStorageAdapter')) {
    const imports = [...out.matchAll(/^import[^\n]*\n/gm)];
    if (!imports.length) {
      throw new Error('未找到 import 语句，无法注入 Storage 适配器');
    }
    const last = imports[imports.length - 1];
    const idx = last.index + last[0].length;
    out = out.slice(0, idx) + "import { getStorageAdapter } from './Storage';" + EOL + out.slice(idx);
  }

  // 2. 替换 localStorage 调用（找不到说明源结构变了，宁可失败也别静默写错）
  if (!/localStorage\.(getItem|setItem)\(/.test(out)) {
    throw new Error('未找到 localStorage.getItem/setItem 调用，源结构可能已变化');
  }
  out = out.replace(/localStorage\.getItem\(/g, 'getStorageAdapter().getItem(');
  out = out.replace(/localStorage\.setItem\(/g, 'getStorageAdapter().setItem(');

  // 3. 同步调整注释，保持文案与代码一致（与上一步一致：不命中即失败，避免注释悄悄漂移）
  out = replaceComment(
    out,
    '从 localStorage 加载存档',
    '从存储适配器加载存档（浏览器=localStorage，微信/Cocos=sys.localStorage，由宿主注入）',
  );
  out = replaceComment(out, '保存存档到 localStorage', '保存存档到存储适配器');
  out = replaceComment(
    out,
    'localStorage 不可用时静默失败（微信环境可能没有 localStorage）',
    '存储不可用时静默失败（如宿主未注入适配器）',
  );

  return out;
}

/** Utils：删除依赖 DOM 的 screenToCanvas（连同 JSDoc），换成一段说明 */
function adaptUtils(src) {
  const EOL = eolOf(src);
  // 锚定 screenToCanvas 自己的 JSDoc（不能从文件顶部的 /** 开始匹配，否则会把整段吞掉）；\r?\n 兼容 CRLF/LF
  const re = /\/\*\*\r?\n \* 画布坐标转换工具[\s\S]*?\r?\n\}/;
  if (!re.test(src)) {
    throw new Error('未找到 screenToCanvas 定义，源结构可能已变化');
  }
  const note = [
    '/**',
    ' * 说明：screenToCanvas 依赖 DOM 的 getBoundingClientRect，属于渲染/适配层，',
    ' * 不放入引擎无关核心包。由宿主在渲染层自行实现：',
    ' * - 原生 Canvas 版：用 canvas.getBoundingClientRect()',
    ' * - Cocos 版：用 UITransform.convertToNodeSpaceAR 等坐标转换',
    ' */',
  ].join(EOL);
  return src.replace(re, note);
}

// ========== 同步主流程 ==========

if (!fs.existsSync(SRC)) {
  console.error(`✗ 源目录不存在：${SRC}`);
  console.error('  可用环境变量 NUONUO_SRC 指定挪挪收纳屋的 src 路径');
  process.exit(1);
}

let sync = 0, same = 0, missing = 0, failed = 0;

for (const f of FILES) {
  const srcFile = path.join(SRC, f);
  const dstFile = path.join(DEST, f);

  if (!fs.existsSync(srcFile)) {
    console.log(`⚠  源缺失              ${f}`);
    missing += 1;
    continue;
  }

  let content;
  try {
    content = fs.readFileSync(srcFile, 'utf8');
    if (TRANSFORMS[f]) content = TRANSFORMS[f](content);
  } catch (e) {
    console.log(`⚠  转换失败，跳过      ${f} — ${e.message}`);
    failed += 1;
    continue;
  }

  if (fs.existsSync(dstFile) && fs.readFileSync(dstFile, 'utf8') === content) {
    same += 1;
    continue;
  }

  if (APPLY) {
    fs.mkdirSync(path.dirname(dstFile), { recursive: true });
    fs.writeFileSync(dstFile, content);
    console.log(`✓  已同步              ${f}`);
  } else {
    console.log(`≠  待同步(差异)        ${f}`);
  }
  sync += 1;
}

for (const f of LOCAL_FILES) {
  if (fs.existsSync(path.join(DEST, f))) {
    console.log(`·  本地文件(不同步)    ${f}`);
  }
}

console.log('\n—— 汇总 ——');
console.log(`待同步 ${sync} | 无变化 ${same} | 源缺失 ${missing} | 转换失败 ${failed}`);
if (!APPLY) console.log('（未加 --apply，仅对比，未写入任何文件）');
