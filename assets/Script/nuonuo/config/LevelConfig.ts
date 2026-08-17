/**
 * 关卡配置数据（100 关）
 *
 * 【设计依据】docs/关卡设计100关.md
 *   - 16 章节结构（玩家不可见），起承转合微观节奏
 *   - 机制引入期 Ch1-7（L1-39）：逐一教会 滑块/堆叠/传送门/水冰/单向门/按钮墙桥/clearItem
 *   - 组合深化期 Ch8-15（L40-95）：每章一个组合主题
 *   - 持续更新锚点 Ch16（L96-100）：赛季里程碑，非终点
 *
 * 【生成说明】本文件按策划文档手工编排，可用关卡编辑器（editor.html）二次调整/试玩验证。
 * 生成时间：2026-08-09
 */

import { ItemType, LevelConfig } from '../types/index';

export const LEVELS: LevelConfig[] = [
  // ============================================================
  // Ch1 · 基础滑块归位（L1-3）— 种子
  // ============================================================

  // 第 1 关 〔起〕首次拖拽：单物品一步归位
  {
    level: 1,
    grid: { rows: 3, cols: 3 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 2] },
    ],
    maxSteps: 2,
  },

  // 第 2 关 〔起〕拐角与中途停顿：需两步换向
  {
    level: 2,
    grid: { rows: 4, cols: 4 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [3, 3] },
    ],
    maxSteps: 4,
  },

  // 第 3 关 〔承〕多物品与类型匹配
  {
    level: 3,
    grid: { rows: 4, cols: 4 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [3, 0] },
      { type: ItemType.BOOK_BLUE, pos: [3, 2] },
    ],
    maxSteps: 4,
  },

  // ============================================================
  // Ch2 · 堆叠（L4-9）— 核心钩子
  // ============================================================

  // 第 4 关 〔起〕堆叠初见：下层被锁
  {
    level: 4,
    grid: { rows: 4, cols: 4 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [3, 3] },
      { type: ItemType.BOOK_BLUE, pos: [3, 0] },
    ],
    maxSteps: 6,
  },

  // 第 5 关 〔起·里程碑〕堆叠顺序 + 多实例匹配
  {
    level: 5,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 1 },
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 2 },
      { type: ItemType.MUG_RED, pos: [3, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.PLANT_GREEN, pos: [4, 2] },
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.MUG_RED, pos: [4, 4] },
    ],
    maxSteps: 6,
  },

  // 第 6 关 〔承〕堆叠 + 路径规划
  {
    level: 6,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 2 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 1] },
      { type: ItemType.BOOK_BLUE, pos: [4, 0] },
      { type: ItemType.PLANT_GREEN, pos: [4, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [4, 4] },
    ],
    maxSteps: 9,
  },

  // 第 7 关 〔转〕堆叠 × 障碍（首个组合）
  {
    level: 7,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [2, 1],
      [2, 3],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 2] },
      { type: ItemType.BOOK_BLUE, pos: [4, 0] },
      { type: ItemType.PLANT_GREEN, pos: [4, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
    ],
    maxSteps: 11,
  },

  // 第 8 关 〔合〕3 层堆叠 boss（上）
  {
    level: 8,
    grid: { rows: 6, cols: 5 },
    obstacles: [
      [2, 2],
      [3, 0],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 1] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [5, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
    ],
    maxSteps: 25,
  },

  // 第 9 关 〔合·章节boss〕爽关缓冲
  {
    level: 9,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 1] },
      { type: ItemType.PLANT_GREEN, pos: [5, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
    ],
    maxRefreshes: 4,
    maxSteps: 8,
  },

  // ============================================================
  // Ch3 · 传送门（L10-15）
  // ============================================================

  // 第 10 关 〔起·里程碑〕传送门初见
  {
    level: 10,
    grid: { rows: 5, cols: 5 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 4] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 0], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 4] },
      { type: ItemType.PLANT_GREEN, pos: [4, 0] },
    ],
    maxSteps: 15,
  },

  // 第 11 关 〔起〕传送门方向选择（捷径可选）
  {
    level: 11,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 4] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 1] },
      { type: ItemType.BOOK_BLUE, pos: [4, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
    ],
    maxSteps: 12,
  },

  // 第 12 关 〔承〕限次传送门
  {
    level: 12,
    grid: { rows: 5, cols: 5 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [3, 4], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 4] },
      { type: ItemType.BOOK_BLUE, pos: [0, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [4, 0] },
    ],
    maxSteps: 12,
  },

  // 第 13 关 〔承〕双对传送门
  {
    level: 13,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 4], uses: 2 },
      { id: 2, pos: [1, 4], uses: 2 },
      { id: 2, pos: [4, 0], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [2, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [3, 2] },
    ],
    maxSteps: 28,
  },

  // 第 14 关 〔转〕传送门 × 堆叠
  {
    level: 14,
    grid: { rows: 6, cols: 5 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 4], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 1] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3] },
    ],
    maxSteps: 25,
  },

  // 第 15 关 〔合·章节boss·里程碑〕传送门综合
  {
    level: 15,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
      { id: 2, pos: [0, 5], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [3, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [3, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 1] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 0] },
    ],
  },

  // ============================================================
  // Ch4 · 水洼→冰块（L16-21）
  // ============================================================

  // 第 16 关 〔起〕水洼初见：倒计时
  {
    level: 16,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    waters: [
      { pos: [2, 2], freezeIn: 5 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 4] },
      { type: ItemType.BOOK_BLUE, pos: [4, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
    ],
    maxSteps: 15,
  },

  // 第 17 关 〔起〕水洼位置认知
  {
    level: 17,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    waters: [
      { pos: [1, 2], freezeIn: 6 },
      { pos: [3, 2], freezeIn: 6 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 4] },
      { type: ItemType.BOOK_BLUE, pos: [4, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
    ],
    maxSteps: 15,
  },

  // 第 18 关 〔承〕目标格冰封风险
  {
    level: 18,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    waters: [
      { pos: [2, 1], freezeIn: 6 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 2] },
    ],
    maxSteps: 15,
  },

  // 第 19 关 〔承〕时序博弈
  {
    level: 19,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    waters: [
      { pos: [2, 2], freezeIn: 5 },
      { pos: [3, 2], freezeIn: 5 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 2] },
      { type: ItemType.LAMP_ORANGE, pos: [3, 4] },
    ],
    maxRefreshes: 2,
    maxSteps: 24,
  },

  // 第 20 关 〔转〕水冰 × 传送门
  {
    level: 20,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    waters: [
      { pos: [2, 3], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 1] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 0] },
    ],
  },

  // 第 21 关 〔合·章节boss〕水冰综合
  {
    level: 21,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
      { pos: [3, 4], freezeIn: 5 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 3] },
    ],
  },

  // ============================================================
  // Ch5 · 单向门（L22-27）
  // ============================================================

  // 第 22 关 〔起〕单向门初见：方向
  {
    level: 22,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    oneways: [
      { pos: [2, 2], dir: 'right' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 0], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.BOOK_BLUE, pos: [2, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
    ],
    maxSteps: 11,
  },

  // 第 23 关 〔起〕单向门绕行
  {
    level: 23,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [2, 3], dir: 'down' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.BOOK_BLUE, pos: [4, 2] },
      { type: ItemType.PLANT_GREEN, pos: [4, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
    ],
    maxSteps: 11,
  },

  // 第 24 关 〔承〕单向门阵列
  {
    level: 24,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [2, 3], dir: 'down' },
      { pos: [3, 1], dir: 'up' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.PLANT_GREEN, pos: [5, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
    ],
    maxSteps: 14,
  },

  // 第 25 关 〔承·里程碑〕单向门 + 障碍
  {
    level: 25,
    grid: { rows: 6, cols: 5 },
    obstacles: [
      [2, 2],
      [3, 2],
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [3, 3], dir: 'left' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [0, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
    ],
    maxSteps: 21,
  },

  // 第 26 关 〔转〕单向门 × 堆叠/传送
  {
    level: 26,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    oneways: [
      { pos: [2, 3], dir: 'right' },
      { pos: [3, 1], dir: 'down' },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 1] },
      { type: ItemType.BOOK_BLUE, pos: [5, 5] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
    ],
    maxSteps: 45,
  },

  // 第 27 关 〔合·章节boss〕单向门综合
  {
    level: 27,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [2, 4], dir: 'down' },
      { pos: [3, 1], dir: 'up' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 5], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 5] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2] },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 4] },
    ],
    maxSteps: 80,
  },

  // ============================================================
  // Ch6 · 按钮·活动墙/桥（L28-33）
  // ============================================================

  // 第 28 关 〔起〕按钮 × 活动墙初见
  {
    level: 28,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [4, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 0], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 4] },
      { type: ItemType.BOOK_BLUE, pos: [4, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 2] },
    ],
    maxSteps: 12,
  },

  // 第 29 关 〔起〕活动桥变体
  {
    level: 29,
    grid: { rows: 5, cols: 5 },
    obstacles: [[2, 0], [2, 4]],
    buttons: [
      { id: 1, pos: [3, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 2], kind: 'bridge' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [4, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
    ],
    maxSteps: 11,
  },

  // 第 30 关 〔承·里程碑〕按钮驻留策略
  {
    level: 30,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [1, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [2, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 4] },
      { type: ItemType.PLANT_GREEN, pos: [5, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
    ],
    maxSteps: 22,
  },

  // 第 31 关 〔承〕多按钮 × 多墙桥
  {
    level: 31,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [4, 4] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 2], kind: 'wall' },
      { id: 2, pos: [3, 2], kind: 'bridge' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [3, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
      { type: ItemType.HAT_PURPLE, pos: [3, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [2, 0] },
    ],
    maxSteps: 19,
  },

  // 第 32 关 〔转〕按钮 × 单向门/水
  {
    level: 32,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 3], kind: 'wall' },
    ],
    oneways: [
      { pos: [2, 4], dir: 'right' },
    ],
    waters: [
      { pos: [3, 1], freezeIn: 6 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 2], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 5], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 5] },
      { type: ItemType.BOOK_BLUE, pos: [5, 5] },
      { type: ItemType.PLANT_GREEN, pos: [0, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3] },
      { type: ItemType.HAT_PURPLE, pos: [0, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 1] },
    ],
    maxSteps: 21,
  },

  // 第 33 关 〔合·章节boss〕按钮墙桥综合
  {
    level: 33,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [4, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 1], kind: 'wall' },
      { id: 2, pos: [3, 4], kind: 'bridge' },
    ],
    portals: [
      { id: 1, pos: [0, 5], uses: 2 },
      { id: 1, pos: [5, 0], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 1], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 1] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [3, 0] },
    ],
    maxSteps: 64,
  },

  // ============================================================
  // Ch7 · clearItem 通关模式（L34-39）
  // ============================================================

  // 第 34 关 〔起〕clearItem 初见：替代胜利
  {
    level: 34,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 4], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.MUG_RED, pos: [4, 4] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 3] },
      { type: ItemType.BOOK_BLUE, pos: [4, 2] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.MUG_RED, targetCount: 2 },
    maxSteps: 3,
  },

  // 第 35 关 〔起〕clearItem 选目标
  {
    level: 35,
    grid: { rows: 5, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.PLANT_GREEN, pos: [0, 0], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [4, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [2, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.PLANT_GREEN, pos: [4, 1] },
      { type: ItemType.PLANT_GREEN, pos: [4, 3] },
      { type: ItemType.MUG_RED, pos: [0, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [4, 2] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.PLANT_GREEN, targetCount: 2 },
    maxSteps: 14,
  },

  // 第 36 关 〔承〕clearItem + 堆叠
  {
    level: 36,
    grid: { rows: 6, cols: 5 },
    obstacles: [],
    items: [
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 1], layer: 2 },
      { type: ItemType.MUG_RED, pos: [1, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.PLANT_GREEN, pos: [5, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 3] },
      { type: ItemType.MUG_RED, pos: [0, 3] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 0] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.SHOE_YELLOW, targetCount: 1 },
    maxSteps: 22,
  },

  // 第 37 关 〔承〕clearItem + 传送门
  {
    level: 37,
    grid: { rows: 6, cols: 5 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 4], uses: 2 },
    ],
    items: [
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [2, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 4] },
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
      { type: ItemType.HAT_PURPLE, pos: [5, 4] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.BOOK_BLUE, targetCount: 2 },
    maxSteps: 16,
  },

  // 第 38 关 〔转〕clearItem × 多机制
  {
    level: 38,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    oneways: [
      { pos: [2, 3], dir: 'right' },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.LAMP_ORANGE, pos: [0, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.LAMP_ORANGE, pos: [5, 3] },
      { type: ItemType.LAMP_ORANGE, pos: [4, 2] },
      { type: ItemType.MUG_RED, pos: [0, 3] },
      { type: ItemType.BOOK_BLUE, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.LAMP_ORANGE, targetCount: 2 },
    maxSteps: 24,
  },

  // 第 39 关 〔合·里程碑〕机制引入期收束：全机制同台 + clearItem
  {
    level: 39,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    waters: [
      { pos: [3, 3], freezeIn: 6 },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [0, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 1], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 1], layer: 2 },
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 4] },
      { type: ItemType.MUG_RED, pos: [6, 0] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 5] },
      { type: ItemType.ALARM_PINK, pos: [0, 3] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.HEADPHONE_BLACK, targetCount: 2 },
    maxSteps: 16,
  },

  // ============================================================
  // Ch8 · 时序×空间（L40-46）— 水冰倒计时与传送门空间折叠的博弈
  // ============================================================

  // 第 40 关 〔起·里程碑〕时序与空间的初步交织
  {
    level: 40,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    waters: [
      { pos: [2, 3], freezeIn: 5 },
    ],
    portals: [
      { id: 1, pos: [0, 1], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [5, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2] },
    ],
  },

  // 第 41 关 〔起〕冰封切封传送门
  {
    level: 41,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    waters: [
      { pos: [0, 1], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [2, 0], uses: 3 },
      { id: 1, pos: [5, 5], uses: 3 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [3, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 1] },
    ],
  },

  // 第 42 关 〔承〕双水洼时序差
  {
    level: 42,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    waters: [
      { pos: [3, 1], freezeIn: 4 },
      { pos: [3, 4], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [2, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 3] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 3] },
    ],
    maxSteps: 71,
  },

  // 第 43 关 〔承〕传送门绕开冰封目标
  {
    level: 43,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    waters: [
      { pos: [3, 1], freezeIn: 5 },
    ],
    portals: [
      { id: 1, pos: [2, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 3] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 1] },
    ],
    maxRefreshes: 2,
  },

  // 第 44 关 〔转〕堆叠 × 时序 × 空间（三机制）
  {
    level: 44,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    waters: [
      { pos: [3, 3], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5] },
      { type: ItemType.ALARM_PINK, pos: [6, 4] },
    ],
  },

  // 第 45 关 〔合·章节boss·里程碑〕时序×空间综合
  {
    level: 45,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
      { pos: [3, 4], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
      { id: 2, pos: [1, 6], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
    ],
  },

  // 第 46 关 〔合〕爽关缓冲
  {
    level: 46,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 1] },
      { type: ItemType.PLANT_GREEN, pos: [5, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 5] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
    ],
    maxRefreshes: 4,
    maxSteps: 7,
  },

  // ============================================================
  // Ch9 · 方向×状态（L47-53）— 单向门方向约束与按钮墙桥状态切换的联动
  // ============================================================

  // 第 47 关 〔起〕单向门控按钮路径
  {
    level: 47,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    oneways: [
      { pos: [2, 1], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [2, 4] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 0], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [0, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 5] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
    ],
    maxSteps: 46,
  },

  // 第 48 关 〔起〕墙后单向门
  {
    level: 48,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 2], kind: 'wall' },
    ],
    oneways: [
      { pos: [3, 2], dir: 'down' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 5], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 5] },
      { type: ItemType.BOOK_BLUE, pos: [5, 5] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 2] },
    ],
    maxSteps: 45,
  },

  // 第 49 关 〔承〕按钮驻留 × 单向门回路
  {
    level: 49,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    buttons: [
      { id: 1, pos: [6, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 4], kind: 'bridge' },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 0] },
      { type: ItemType.BOOK_BLUE, pos: [6, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [0, 3] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 1] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 1] },
    ],
    maxSteps: 69,
  },

  // 第 50 关 〔承·里程碑〕多按钮 × 多单向门
  {
    level: 50,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [6, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 4], kind: 'bridge' },
    ],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 3], dir: 'left' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 2 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 3] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 3] },
    ],
  },

  // 第 51 关 〔转〕方向×状态×堆叠
  {
    level: 51,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    buttons: [
      { id: 1, pos: [1, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 3], kind: 'wall' },
    ],
    oneways: [
      { pos: [4, 3], dir: 'right' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [2, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 4] },
      { type: ItemType.ALARM_PINK, pos: [6, 4] },
    ],
    maxSteps: 63,
  },

  // 第 52 关 〔合·章节boss〕方向×状态综合
  {
    level: 52,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [6, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'bridge' },
    ],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
      { pos: [3, 4], dir: 'up' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 2] },
    ],
    maxSteps: 63,
  },

  // 第 53 关 〔合〕爽关缓冲
  {
    level: 53,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 5] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 5] },
    ],
    maxRefreshes: 4,
    maxSteps: 44,
  },

  // ============================================================
  // Ch10 · 堆叠链×机关序列（L54-60）
  // ============================================================

  // 第 54 关 〔起〕堆叠解锁触发按钮
  {
    level: 54,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    buttons: [
      { id: 1, pos: [3, 2] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 4], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [5, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 5] },
    ],
    maxSteps: 23,
  },

  // 第 55 关 〔起·里程碑〕堆叠 × 传送门序列
  {
    level: 55,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 5] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1] },
    ],
    maxSteps: 33,
  },

  // 第 56 关 〔承〕双堆叠塔
  {
    level: 56,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
      [3, 3],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 5] },
      { type: ItemType.HAT_PURPLE, pos: [0, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
    ],
    maxSteps: 33,
  },

  // 第 57 关 〔承〕堆叠链 × 水冰
  {
    level: 57,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 0], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 5], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [6, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5] },
      { type: ItemType.ALARM_PINK, pos: [6, 2] },
    ],
    maxRefreshes: 2,
    maxSteps: 18,
  },

  // 第 58 关 〔转〕堆叠链 × 按钮序列
  {
    level: 58,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    buttons: [
      { id: 1, pos: [3, 1] },
      { id: 2, pos: [3, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 1], kind: 'wall' },
      { id: 2, pos: [4, 5], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 5] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [6, 6] },
      { type: ItemType.MUG_RED, pos: [0, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
    ],
    maxSteps: 26,
  },

  // 第 59 关 〔合·章节boss〕堆叠链综合
  {
    level: 59,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [0, 0], uses: 2 },
      { id: 1, pos: [6, 6], uses: 2 },
    ],
    buttons: [
      { id: 1, pos: [3, 1] },
      { id: 2, pos: [3, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 2], kind: 'wall' },
      { id: 2, pos: [4, 4], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 0], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [2, 6], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 3], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [0, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.APPLE_GREEN, pos: [6, 2] },
    ],
    maxSteps: 46,
  },

  // 第 60 关 〔合·里程碑〕爽关缓冲
  {
    level: 60,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 2], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [0, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 1] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 3] },
      { type: ItemType.HAT_PURPLE, pos: [5, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5] },
    ],
    maxRefreshes: 4,
    maxSteps: 9,
  },

  // ============================================================
  // Ch11 · 限次资源博弈（L61-67）— 道具需求峰值 ①
  // ============================================================

  // 第 61 关 〔起〕限次传送门 + 刷新=1
  {
    level: 61,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 5], uses: 1 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 2 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
    ],
    maxRefreshes: 1,
    maxSteps: 29,
  },

  // 第 62 关 〔起〕双限次门 + 刷新=1
  {
    level: 62,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 5], uses: 1 },
      { id: 2, pos: [1, 5], uses: 1 },
      { id: 2, pos: [5, 0], uses: 1 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 2 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 4] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
    ],
    maxRefreshes: 1,
    maxSteps: 48,
  },

  // 第 63 关 〔承〕限次 + 堆叠
  {
    level: 63,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [6, 5], uses: 1 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [6, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 4] },
      { type: ItemType.ALARM_PINK, pos: [0, 3] },
    ],
    maxRefreshes: 1,
    maxSteps: 25,
  },

  // 第 64 关 〔承〕限次 + 水冰
  {
    level: 64,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    waters: [
      { pos: [3, 3], freezeIn: 5 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 5], uses: 1 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 1], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 5] },
    ],
    maxRefreshes: 1,
    maxSteps: 20,
  },

  // 第 65 关 〔转·里程碑〕限次综合
  {
    level: 65,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 6], uses: 1 },
      { id: 2, pos: [1, 6], uses: 1 },
      { id: 2, pos: [5, 0], uses: 1 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
    ],
    maxRefreshes: 1,
  },

  // 第 66 关 〔合·章节boss〕稀缺 × 状态综合
  {
    level: 66,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [6, 6], uses: 1 },
      { id: 2, pos: [1, 6], uses: 1 },
      { id: 2, pos: [5, 0], uses: 1 },
    ],
    buttons: [
      { id: 1, pos: [3, 1] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 2 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.PLANT_GREEN, pos: [0, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 3] },
      { type: ItemType.MUG_RED, pos: [6, 4] },
    ],
    maxRefreshes: 1,
  },

  // 第 67 关 〔合〕爽关解压
  {
    level: 67,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 5] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 5] },
    ],
    maxRefreshes: 4,
    maxSteps: 34,
  },

  // ============================================================
  // Ch12 · clearItem 速通变体（L68-74）— 替代胜利条件下的效率/路径优化
  // ============================================================

  // 第 68 关 〔起〕clearItem + 障碍迷宫
  {
    level: 68,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 1],
      [2, 4],
      [3, 1],
      [3, 4],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 5], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 5] },
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3] },
      { type: ItemType.HAT_PURPLE, pos: [5, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 4] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.MUG_RED, targetCount: 2 },
    maxSteps: 12,
  },

  // 第 69 关 〔起〕clearItem + 限次门
  {
    level: 69,
    grid: { rows: 6, cols: 6 },
    obstacles: [[2, 2], [3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [4, 5], uses: 1 },
    ],
    items: [
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [3, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.MUG_RED, pos: [0, 0] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [3, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 1] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.BOOK_BLUE, targetCount: 2 },
    maxSteps: 44,
  },

  // 第 70 关 〔承·里程碑〕clearItem + 堆叠（目标在下层）
  {
    level: 70,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.PLANT_GREEN, pos: [1, 4], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 4], layer: 2 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 5], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 3] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 2] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.PLANT_GREEN, targetCount: 3 },
    maxSteps: 12,
  },

  // 第 71 关 〔承〕clearItem + 时序
  {
    level: 71,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    waters: [
      { pos: [3, 3], freezeIn: 5 },
    ],
    items: [
      { type: ItemType.SHOE_YELLOW, pos: [1, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 5], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.SHOE_YELLOW, pos: [6, 1] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 4] },
      { type: ItemType.MUG_RED, pos: [6, 3] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 1] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.SHOE_YELLOW, targetCount: 2 },
    maxRefreshes: 2,
    maxSteps: 12,
  },

  // 第 72 关 〔转〕clearItem + 状态（目标需开墙）
  {
    level: 72,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    buttons: [
      { id: 1, pos: [3, 1] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 5], kind: 'wall' },
    ],
    items: [
      { type: ItemType.LAMP_ORANGE, pos: [2, 5], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 6], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 6], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.LAMP_ORANGE, pos: [2, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [4, 6] },
      { type: ItemType.MUG_RED, pos: [6, 0] },
      { type: ItemType.BOOK_BLUE, pos: [6, 6] },
      { type: ItemType.PLANT_GREEN, pos: [0, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 1] },
      { type: ItemType.ALARM_PINK, pos: [0, 1] },
      { type: ItemType.MUG_RED, pos: [6, 5] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.LAMP_ORANGE, targetCount: 2 },
    maxSteps: 3,
  },

  // 第 73 关 〔合·章节boss〕clearItem 速通综合
  {
    level: 73,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    items: [
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 2], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 4], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 1] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 3] },
      { type: ItemType.MUG_RED, pos: [0, 0] },
      { type: ItemType.BOOK_BLUE, pos: [0, 5] },
      { type: ItemType.PLANT_GREEN, pos: [6, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 6] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 1] },
      { type: ItemType.ALARM_PINK, pos: [6, 3] },
      { type: ItemType.MUG_RED, pos: [0, 4] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.HEADPHONE_BLACK, targetCount: 3 },
    maxSteps: 14,
  },

  // 第 74 关 〔合〕爽关
  {
    level: 74,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    items: [
      { type: ItemType.ALARM_PINK, pos: [0, 0], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [0, 1], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.ALARM_PINK, pos: [5, 0] },
      { type: ItemType.ALARM_PINK, pos: [5, 1] },
      { type: ItemType.MUG_RED, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 5] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.ALARM_PINK, targetCount: 1 },
    maxRefreshes: 4,
    maxSteps: 2,
  },

  // ============================================================
  // Ch13 · 复合死锁拆解（L75-81）— 道具需求峰值 ②
  // ============================================================

  // 第 75 关 〔起·里程碑〕死锁假象：顺序即解
  {
    level: 75,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 1],
      [3, 4],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 1], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 1], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 0] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 5] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [0, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5] },
    ],
    maxRefreshes: 2,
    maxSteps: 19,
  },

  // 第 76 关 〔起〕堆叠死锁
  {
    level: 76,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2], [3, 3]],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 0], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [6, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
    ],
    maxRefreshes: 2,
    maxSteps: 23,
  },

  // 第 77 关 〔承〕传送门死锁
  {
    level: 77,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 4], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 4] },
      { type: ItemType.ALARM_PINK, pos: [6, 3] },
    ],
    maxRefreshes: 2,
    maxSteps: 28,
  },

  // 第 78 关 〔承〕水冰死锁
  {
    level: 78,
    grid: { rows: 7, cols: 6 },
    obstacles: [[3, 2]],
    waters: [
      { pos: [3, 3], freezeIn: 4 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 4], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 3] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 4] },
      { type: ItemType.ALARM_PINK, pos: [6, 1] },
    ],
    maxRefreshes: 2,
    maxSteps: 35,
  },

  // 第 79 关 〔转〕复合死锁
  {
    level: 79,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 6], uses: 1 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [0, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 1], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 5], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 2], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [2, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [6, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 1] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.APPLE_GREEN, pos: [6, 0] },
    ],
    maxRefreshes: 1,
  },

  // 第 80 关 〔合·章节boss·里程碑〕死锁综合巅峰
  {
    level: 80,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 6], uses: 1 },
    ],
    waters: [
      { pos: [3, 4], freezeIn: 4 },
    ],
    buttons: [
      { id: 1, pos: [3, 1] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 0], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [2, 6], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [5, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [6, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [6, 6] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 0] },
    ],
    maxRefreshes: 1,
    maxSteps: 57,
  },

  // 第 81 关 〔合〕强力爽关
  {
    level: 81,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 5] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 5] },
    ],
    maxRefreshes: 4,
    maxSteps: 19,
  },

  // ============================================================
  // Ch14 · 极限综合（L82-88）— 全机制高密度交织
  // ============================================================

  // 第 82 关 〔起〕全机制同台
  {
    level: 82,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 3], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [4, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.APPLE_GREEN, pos: [6, 3] },
    ],
    maxRefreshes: 2,
  },

  // 第 83 关 〔承〕机制交织 A：传送 × 水冰 × 单向
  {
    level: 83,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 5], dir: 'left' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [0, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 3] },
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.APPLE_GREEN, pos: [6, 2] },
    ],
    maxRefreshes: 2,
  },

  // 第 84 关 〔承〕机制交织 B：状态 × 方向 × 时序
  {
    level: 84,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [5, 4] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'bridge' },
    ],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
    ],
    waters: [
      { pos: [3, 4], freezeIn: 6 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 3], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.APPLE_GREEN, pos: [6, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
    ],
    maxRefreshes: 2,
    maxSteps: 64,
  },

  // 第 85 关 〔转·里程碑〕极限综合前奏
  {
    level: 85,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
      { id: 2, pos: [1, 6], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [0, 2] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 5], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 2 },
      { type: ItemType.HAT_PURPLE, pos: [2, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [4, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 5], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [6, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 3] },
    ],
    maxRefreshes: 2,
  },

  // 第 86 关 〔合·章节boss〕极限综合（上）
  {
    level: 86,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 6], uses: 2 },
    ],
    waters: [
      { pos: [3, 4], freezeIn: 5 },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 5], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 2], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 5], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 5], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 6], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [6, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 2] },
      { type: ItemType.MUG_RED, pos: [5, 6] },
      { type: ItemType.BOOK_BLUE, pos: [5, 0] },
      { type: ItemType.APPLE_GREEN, pos: [0, 0] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
    ],
    maxRefreshes: 2,
  },

  // 第 87 关 〔合〕极限综合（下）· clearItem 模式
  {
    level: 87,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
      { id: 2, pos: [1, 6], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
      { pos: [3, 4], freezeIn: 6 },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.APPLE_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [1, 5], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [2, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [1, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [0, 1], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [4, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 6], layer: 1 },
    ],
    targets: [
      { type: ItemType.APPLE_GREEN, pos: [6, 1] },
      { type: ItemType.APPLE_GREEN, pos: [6, 5] },
      { type: ItemType.APPLE_GREEN, pos: [6, 3] },
      { type: ItemType.MUG_RED, pos: [0, 0] },
      { type: ItemType.BOOK_BLUE, pos: [0, 6] },
      { type: ItemType.PLANT_GREEN, pos: [6, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
      { type: ItemType.HAT_PURPLE, pos: [0, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 6] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2] },
      { type: ItemType.ALARM_PINK, pos: [5, 4] },
      { type: ItemType.MUG_RED, pos: [5, 2] },
      { type: ItemType.BOOK_BLUE, pos: [4, 5] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.APPLE_GREEN, targetCount: 3 },
    maxRefreshes: 2,
    maxSteps: 28,
  },

  // 第 88 关 〔合〕爽关缓冲
  {
    level: 88,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    portals: [
      { id: 1, pos: [0, 0] },
      { id: 1, pos: [4, 5] },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 3], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 1] },
      { type: ItemType.HAT_PURPLE, pos: [5, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
    ],
    maxRefreshes: 4,
    maxSteps: 46,
  },

  // ============================================================
  // Ch15 · 自由组合沙盘（L89-95）— 开放式多解谜题
  // ============================================================

  // 第 89 关 〔起〕多解沙盘
  {
    level: 89,
    grid: { rows: 7, cols: 7 },
    obstacles: [],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
      { id: 2, pos: [0, 6], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 4], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [3, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [3, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 3], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [3, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 5] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 3] },
      { type: ItemType.HAT_PURPLE, pos: [0, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 6] },
    ],
    maxRefreshes: 3,
  },

  // 第 90 关 〔承·里程碑〕堆叠多解
  {
    level: 90,
    grid: { rows: 7, cols: 7 },
    obstacles: [],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [3, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [3, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [6, 5] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 1] },
      { type: ItemType.ALARM_PINK, pos: [0, 1] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [6, 3] },
      { type: ItemType.PLANT_GREEN, pos: [5, 5] },
    ],
    maxRefreshes: 3,
    maxSteps: 26,
  },

  // 第 91 关 〔承〕clearItem 多解
  {
    level: 91,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [0, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 1], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 5], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [5, 5], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 2], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 4], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.MUG_RED, pos: [6, 0] },
      { type: ItemType.MUG_RED, pos: [6, 6] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 2] },
      { type: ItemType.HAT_PURPLE, pos: [0, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3] },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 3] },
      { type: ItemType.MUG_RED, pos: [4, 3] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.MUG_RED, targetCount: 3 },
    maxRefreshes: 3,
    maxSteps: 15,
  },

  // 第 92 关 〔转〕机关多解
  {
    level: 92,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [5, 1] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'wall' },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 6], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 6], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 4], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 5] },
      { type: ItemType.ALARM_PINK, pos: [6, 6] },
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [5, 4] },
      { type: ItemType.PLANT_GREEN, pos: [6, 2] },
    ],
    maxRefreshes: 3,
  },

  // 第 93 关 〔合·章节boss〕沙盘综合
  {
    level: 93,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 5], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 2 },
      { type: ItemType.HAT_PURPLE, pos: [2, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [2, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [4, 1], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
    ],
    maxRefreshes: 3,
  },

  // 第 94 关 〔合〕创意解谜
  {
    level: 94,
    grid: { rows: 7, cols: 7 },
    obstacles: [],
    waters: [
      { pos: [3, 3], freezeIn: 8 },
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 3 },
      { id: 1, pos: [5, 6], uses: 3 },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [2, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [2, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [4, 1], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 5], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [6, 4], layer: 1 },
      { type: ItemType.MUG_RED, pos: [3, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [3, 6], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [1, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [0, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 1] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [0, 6] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [1, 3] },
      { type: ItemType.APPLE_GREEN, pos: [3, 6] },
    ],
    maxRefreshes: 3,
  },

  // 第 95 关 〔合·大里程碑〕组合深化期收束
  {
    level: 95,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 3 },
      { id: 1, pos: [5, 6], uses: 3 },
    ],
    waters: [
      { pos: [3, 4], freezeIn: 8 },
    ],
    oneways: [
      { pos: [3, 2], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [0, 2] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 5], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 5], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [6, 3], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 4] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 3] },
      { type: ItemType.PLANT_GREEN, pos: [6, 0] },
    ],
    maxRefreshes: 3,
  },

  // ============================================================
  // Ch16 · 持续更新锚点（L96-100）— 赛季里程碑
  // ============================================================

  // 第 96 关 精选回顾·堆叠极限
  {
    level: 96,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 1],
      [3, 5],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 2], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 2], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 4], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 0], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 6], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [2, 6], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [4, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [6, 3], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 2] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 6] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 0] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 3] },
      { type: ItemType.BOOK_BLUE, pos: [4, 3] },
      { type: ItemType.APPLE_GREEN, pos: [6, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 3] },
    ],
    maxRefreshes: 2,
    maxSteps: 32,
  },

  // 第 97 关 精选回顾·机关交响
  {
    level: 97,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 5], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
      { id: 2, pos: [6, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 4], kind: 'wall' },
      { id: 2, pos: [3, 1], kind: 'bridge' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 5], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 2 },
      { type: ItemType.HAT_PURPLE, pos: [2, 3], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [4, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 5], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 0], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 2], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [0, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 4], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 6], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 5] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 6] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 2] },
      { type: ItemType.ALARM_PINK, pos: [0, 6] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [6, 4] },
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 0] },
    ],
    maxRefreshes: 2,
  },

  // 第 98 关 精选回顾·死锁巅峰
  {
    level: 98,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 5], uses: 1 },
    ],
    waters: [
      { pos: [3, 4], freezeIn: 4 },
    ],
    buttons: [
      { id: 1, pos: [0, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [4, 3], kind: 'wall' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 5], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 5], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [5, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 6], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 2], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [6, 4], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 6], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 1] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 0] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 6] },
      { type: ItemType.PLANT_GREEN, pos: [6, 2] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 4] },
      { type: ItemType.HAT_PURPLE, pos: [0, 2] },
    ],
    maxRefreshes: 1,
    maxSteps: 78,
  },

  // 第 99 关 精选回顾·clearItem 速通巅峰
  {
    level: 99,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 6], uses: 2 },
      { id: 2, pos: [1, 6], uses: 2 },
      { id: 2, pos: [4, 0], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    items: [
      { type: ItemType.APPLE_GREEN, pos: [1, 1], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [1, 5], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [2, 3], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [0, 2], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 4], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [6, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 4], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [1, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [6, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [6, 5], layer: 1 },
    ],
    targets: [
      { type: ItemType.APPLE_GREEN, pos: [6, 1] },
      { type: ItemType.APPLE_GREEN, pos: [6, 5] },
      { type: ItemType.APPLE_GREEN, pos: [0, 3] },
      { type: ItemType.APPLE_GREEN, pos: [6, 3] },
      { type: ItemType.MUG_RED, pos: [0, 0] },
      { type: ItemType.BOOK_BLUE, pos: [0, 6] },
      { type: ItemType.PLANT_GREEN, pos: [6, 0] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 6] },
      { type: ItemType.HAT_PURPLE, pos: [0, 1] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 5] },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 4] },
      { type: ItemType.ALARM_PINK, pos: [5, 2] },
      { type: ItemType.MUG_RED, pos: [5, 0] },
      { type: ItemType.BOOK_BLUE, pos: [5, 6] },
    ],
    winCondition: { mode: 'clearItem', targetType: ItemType.APPLE_GREEN, targetCount: 4 },
    maxRefreshes: 2,
    maxSteps: 16,
  },

  // 第 100 关 赛季里程碑·持续更新锚点
  {
    level: 100,
    grid: { rows: 7, cols: 7 },
    obstacles: [[3, 3]],
    portals: [
      { id: 1, pos: [1, 0], uses: 3 },
      { id: 1, pos: [4, 6], uses: 3 },
      { id: 2, pos: [1, 6], uses: 3 },
      { id: 2, pos: [6, 0], uses: 3 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 8 },
      { pos: [3, 4], freezeIn: 8 },
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 5], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [1, 3] },
      { id: 2, pos: [5, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'bridge' },
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [1, 1], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [1, 1], layer: 2 },
      { type: ItemType.PLANT_GREEN, pos: [1, 1], layer: 3 },
      { type: ItemType.SHOE_YELLOW, pos: [1, 5], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [1, 5], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [1, 5], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [2, 3], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [4, 3], layer: 1 },
      { type: ItemType.MUG_RED, pos: [5, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [5, 4], layer: 1 },
      { type: ItemType.APPLE_GREEN, pos: [2, 5], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [4, 1], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0], layer: 1 },
      { type: ItemType.HAT_PURPLE, pos: [5, 6], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [6, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [6, 2] },
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.PLANT_GREEN, pos: [6, 5] },
      { type: ItemType.SHOE_YELLOW, pos: [0, 5] },
      { type: ItemType.HAT_PURPLE, pos: [6, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 3] },
      { type: ItemType.ALARM_PINK, pos: [0, 2] },
      { type: ItemType.MUG_RED, pos: [5, 4] },
      { type: ItemType.BOOK_BLUE, pos: [5, 2] },
      { type: ItemType.APPLE_GREEN, pos: [0, 0] },
      { type: ItemType.PLANT_GREEN, pos: [6, 4] },
      { type: ItemType.SHOE_YELLOW, pos: [6, 1] },
      { type: ItemType.HAT_PURPLE, pos: [0, 6] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 3] },
    ],
    maxRefreshes: 2,
  },
];

/**
 * 根据关卡编号获取关卡配置
 * @param level 关卡编号（从 1 开始）
 * @returns 关卡配置，如果不存在返回 null
 */
export function getLevelConfig(level: number): LevelConfig | null {
  if (level < 1 || level > LEVELS.length) return null;
  return LEVELS[level - 1];
}

/** 总关卡数 */
export const TOTAL_LEVELS = LEVELS.length;
