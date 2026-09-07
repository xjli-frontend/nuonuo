/**
 * 第 15 关模拟：按端口 Board/PathCalculator 同款规则搜索状态空间
 * 目标：
 *  1. 是否存在「顶层物品可拖但可落点为空（点它不出黄色块）」的状态
 *  2. 该状态下是否还有别的物品可动（能否自救）
 *  3. 关卡本身是否可通关（4 个物品全部归位）
 */
const ROWS = 8, COLS = 6;

const OBSTACLES = new Set([
  [3,1],[3,5],[3,4],[4,1],[1,1],[2,1],[3,3],[1,3],[1,4],[1,5],[6,1],[6,2],[6,3],[6,4]
].map(([r,c]) => `${r},${c}`));

const WATERS = [
  { pos: [4,0], freezeIn: 5 },
  { pos: [4,2], freezeIn: 3 },
];

// 物品：type, 初始位置；targets: type → 允许的目标格（同格可重复归位）
const ITEMS = [
  { type: 'SHOE', r: 0, c: 0, layer: 3 },
  { type: 'HAT',  r: 0, c: 0, layer: 2 },
  { type: 'LAMP', r: 0, c: 0, layer: 1 },
  { type: 'HAT',  r: 0, c: 2, layer: 1 },
];
const TARGETS = new Map([
  ['LAMP', [[4,5]]],
  ['SHOE', [[4,4]]],
  ['HAT',  [[7,5]]],
]);

function key(items, wc, ice, placed) {
  const it = items.map(i => i.placed ? `P${i.type}` : `${i.r},${i.c},${i.type}`).join('|');
  const w = wc.map(x => x.counter).join(',');
  const ic = items.filter(i => i.frozenUnder).map(i => `${i.r},${i.c}`).join(';');
  const iceSet = [...ice].sort().join(';');
  return `${it}@${w}@${ic}@${iceSet}@${placed}`;
}

function stateOf(s) {
  return {
    items: s.items.map(i => ({ ...i })),
    wc: s.wc.map(w => ({ ...w })),
    ice: new Set(s.ice),
    placed: s.placed,
    steps: s.steps,
  };
}

// 计算某物品当前可落点（含越过水洼继续走）
function reachableOf(s, idx) {
  const it = s.items[idx];
  if (it.placed) return [];
  const res = [];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr,dc] of dirs) {
    let r = it.r + dr, c = it.c + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const k = `${r},${c}`;
      if (OBSTACLES.has(k)) break;
      // 冰块（水洼冻成或物品移走后暴露）挡住
      if (s.ice.has(k)) break;
      const occ = s.items.find(o => !o.placed && o.r === r && o.c === c);
      if (occ) break;
      res.push([r, c]);
      r += dr; c += dc;
    }
  }
  return res;
}

// 移动成功后的状态推进
function applyMove(s, idx, [tr, tc]) {
  const it = s.items[idx];
  const ns = stateOf(s);
  const moved = ns.items[idx];
  const fromKey = `${it.r},${it.c}`;

  // 处理起始格：移走后如果下方已冻结则暴露冰块
  if (it.frozenUnder) ns.ice.add(fromKey);
  // 目标格有水洼倒计时：保留在格子上
  const toWater = ns.wc.find(w => w.pos[0] === tr && w.pos[1] === tc);

  // 移动物品
  moved.r = tr; moved.c = tc; moved.frozenUnder = false;
  // 落到水洼上：格子的 freezeCounter 继续跟格子走（物品压在水上）
  // （port: toFreezeCounter 保留，物品压水；tick 作用于 waterPositions 格子）

  // 归位判定：落在匹配目标格 → placed
  const tgt = TARGETS.get(moved.type);
  if (tgt && tgt.some(([r,c]) => r === tr && c === tc)) {
    moved.placed = true;
    ns.placed++;
    // 归位物品压着水洼：水洼信息保留在格子（port 同款）；此处简化为水洼照常 tick
  }

  // tickWaters：每个仍在倒计时的水洼 -1；到 0 → 若格上有未归位物品 → frozenUnder，否则 ICE
  let froze = false;
  for (const w of ns.wc) {
    if (w.counter <= 0) continue;
    w.counter--;
    if (w.counter <= 0) {
      const [wr, wc] = w.pos;
      const occ = ns.items.find(o => !o.placed && o.r === wr && o.c === wc);
      if (occ) {
        occ.frozenUnder = true; // 物品下方结冰（port: freezeCounter = -1）
      } else {
        ns.ice.add(`${wr},${wc}`);
      }
      froze = true;
    }
  }
  ns.steps = s.steps + 1;
  return ns;
}

function topDraggable(s, idx) {
  const it = s.items[idx];
  if (it.placed) return false;
  // 同格堆叠：layer 1 才能拖；模拟里堆叠只出现在开局 [0,0]
  const same = s.items.filter(o => !o.placed && o.r === it.r && o.c === it.c);
  if (same.length > 1) {
    const minLayer = Math.min(...same.map(o => o.layer));
    return it.layer === minLayer;
  }
  return true;
}

const start = {
  items: ITEMS.map(i => ({ ...i, placed: false, frozenUnder: false })),
  wc: WATERS.map(w => ({ pos: w.pos, counter: w.freezeIn })),
  ice: new Set(),
  placed: 0,
  steps: 0,
};

const seen = new Set();
const queue = [start];
let noHighlightState = null;
let winFound = false;
let maxPlaced = 0;
let statesExplored = 0;
const noHighlight = []; // 收集「顶层物品可拖但零可落点」的状态

while (queue.length > 0 && statesExplored < 200000 && !process.env.REPLAY_ONLY) {
  const s = queue.shift();
  statesExplored++;
  const k = key(s.items, s.wc, s.ice, s.placed);
  if (seen.has(k)) continue;
  seen.add(k);

  if (s.placed > maxPlaced) maxPlaced = s.placed;
  if (s.placed === 4) { winFound = true; console.log('✅ 可通关：存在全归位路径，步数', s.steps); }

  // 检查零可落点状态
  for (let i = 0; i < s.items.length; i++) {
    if (!topDraggable(s, i)) continue;
    const reach = reachableOf(s, i);
    if (reach.length === 0) {
      noHighlight.push({
        itemIdx: i,
        item: s.items[i],
        items: s.items.map(o => `${o.type}@${o.r},${o.c}${o.placed ? '(已归位)' : ''}`),
        ice: [...s.ice],
        wc: s.wc.map(w => `[${w.pos}]${w.counter}`),
        steps: s.steps,
      });
      break;
    }
  }

  for (let i = 0; i < s.items.length; i++) {
    if (!topDraggable(s, i)) continue;
    const reach = reachableOf(s, i);
    for (const [tr, tc] of reach) {
      const ns = applyMove(s, i, [tr, tc]);
      queue.push(ns);
    }
  }
}

console.log(`\n状态数: ${statesExplored}, 最大归位数: ${maxPlaced}/4, 可通关: ${winFound}`);
console.log(`\n「可拖但零可落点」状态数: ${noHighlight.length}`);
for (const st of noHighlight.slice(0, 10)) {
  console.log(`- 第${st.steps}步: 点 ${st.item.type}@${st.item.r},${st.item.c} 无黄色可落点`);
  console.log(`  场上: ${st.items.join(' | ')}, 冰块: ${st.ice.join(',') || '无'}, 水洼: ${st.wc.join(',')}`);
}

// ========== 手推解法逐步回放（验证模拟正确性） ==========
console.log('\n==== 回放手推解法 ====');
let s = stateOf(start);
function dump(tag) {
  console.log(tag, s.items.map(o => `${o.type}@${o.r},${o.c}${o.placed ? '✓' : ''}`).join(' | '),
    'ice:', [...s.ice].join(',') || '-', 'wc:', s.wc.map(w => `${w.pos[0]},${w.pos[1]}:${w.counter}`).join(' '), 'placed:', s.placed);
}
const plan = [
  [3, [5,2]],   // m1  HAT#1@[0,2] 下穿 col 2 → [5,2]（[6,2] 障碍，最多第 5 行）
  [3, [5,5]],   // m2  HAT#1 右 → [5,5]（必须先挪开，否则挡住 row 5 整条通道）
  [2, [7,0]],   // m3  LAMP(堆顶) 下穿 col 0 → [7,0]（[4,2] 此时结冰）
  [1, [6,0]],   // m4  HAT#2(堆中) 下穿 col 0 → [6,0]
  [0, [5,0]],   // m5  SHOE(堆底) 下穿 col 0 → [5,0]（[4,0] 此时结冰，三件全部穿出）
  [3, [7,5]],   // m6  HAT#1 下 → [7,5] 归位(1)
  [2, [7,5]],   // m7  LAMP 右 → [7,5]（停在 HAT 目标上，类型不符）
  [2, [4,5]],   // m8  LAMP 上 → [4,5] 归位(2)
  [1, [7,0]],   // m9  HAT#2 下 → [7,0]
  [1, [7,5]],   // m10 HAT#2 右 → [7,5] 归位(3)（同目标第二件）
  [0, [5,4]],   // m11 SHOE 右 → [5,4]
  [0, [4,4]],   // m12 SHOE 上 → [4,4] 归位(4) 通关
];
dump('初始');
for (const [idx, [tr, tc]] of plan) {
  const reach = reachableOf(s, idx);
  const hit = reach.some(([r, c]) => r === tr && c === tc);
  console.log(`移动 ${s.items[idx].type} → [${tr},${tc}] 可落点含目标? ${hit} (可落点: ${reach.map(p => p.join(',')).join(' ')})`);
  if (!hit) { console.log('❌ 解法在此中断'); break; }
  s = applyMove(s, idx, [tr, tc]);
  dump('移动后');
}
