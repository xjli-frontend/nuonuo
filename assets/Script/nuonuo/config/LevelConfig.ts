/**
 * 关卡配置数据
 *
 * 【注意】本文件由关卡编辑器生成，已覆盖原有手写关卡。
 * 生成时间：2026/8/27 21:37:17
 */

import { ItemType, LevelConfig } from '../types/index';

export const LEVELS: LevelConfig[] = [
  // 第 1 关
  {
    level: 1,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [1, 0],
      [1, 1],
      [1, 2],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [2, 0],
      [2, 2],
      [2, 1],
      [0, 2],
      [0, 1],
      [0, 0],
      [4, 4],
      [3, 4],
      [2, 4],
      [1, 4],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [3, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [0, 4] },
    ],
  },

  // 第 2 关
  {
    level: 2,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [1, 1],
      [1, 3],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [4, 2],
      [4, 3],
      [4, 4],
      [4, 1],
      [1, 0],
    ],
    items: [
      { type: ItemType.BOOK_BLUE, pos: [3, 0], layer: 1 },
      { type: ItemType.MUG_RED, pos: [0, 2], layer: 1 },
    ],
    targets: [
      { type: ItemType.BOOK_BLUE, pos: [0, 1] },
      { type: ItemType.MUG_RED, pos: [4, 0] },
    ],
    maxSteps: 99,
  },

  // 第 3 关
  {
    level: 3,
    grid: { rows: 5, cols: 4 },
    obstacles: [
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 1],
      [1, 0],
      [1, 2],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 2 },
      { type: ItemType.SHOE_YELLOW, pos: [0, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [3, 3], layer: 3 },
      { type: ItemType.HAT_PURPLE, pos: [3, 3], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [3, 3], layer: 2 },
    ],
    targets: [
      { type: ItemType.MUG_RED, pos: [4, 0] },
      { type: ItemType.BOOK_BLUE, pos: [4, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [1, 3] },
      { type: ItemType.HAT_PURPLE, pos: [3, 0] },
    ],
    maxSteps: 99,
  },

  // 第 4 关
  {
    level: 4,
    grid: { rows: 6, cols: 5 },
    obstacles: [
      [2, 3],
      [2, 2],
      [2, 1],
      [2, 4],
      [3, 1],
      [0, 4],
      [0, 3],
      [0, 2],
      [0, 1],
    ],
    items: [
      { type: ItemType.APPLE_GREEN, pos: [1, 4], layer: 2 },
      { type: ItemType.HEADPHONE_BLACK, pos: [4, 0], layer: 3 },
      { type: ItemType.ALARM_PINK, pos: [1, 4], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [4, 0], layer: 2 },
      { type: ItemType.ALARM_PINK, pos: [1, 0], layer: 1 },
      { type: ItemType.SHOE_YELLOW, pos: [4, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.APPLE_GREEN, pos: [4, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 4] },
      { type: ItemType.ALARM_PINK, pos: [4, 4] },
      { type: ItemType.BOOK_BLUE, pos: [1, 3] },
      { type: ItemType.SHOE_YELLOW, pos: [5, 0] },
    ],
    maxSteps: 30,
  },

  // 第 5 关
  {
    level: 5,
    grid: { rows: 7, cols: 5 },
    obstacles: [
      [1, 1],
      [4, 1],
      [1, 3],
      [4, 3],
      [2, 1],
      [2, 3],
      [5, 1],
      [5, 3],
      [3, 2],
    ],
    items: [
      { type: ItemType.MUG_RED, pos: [0, 0], layer: 3 },
      { type: ItemType.PLANT_GREEN, pos: [0, 0], layer: 2 },
      { type: ItemType.BOOK_BLUE, pos: [0, 0], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [0, 2], layer: 2 },
      { type: ItemType.ALARM_PINK, pos: [3, 0], layer: 2 },
      { type: ItemType.ALARM_PINK, pos: [0, 2], layer: 1 },
      { type: ItemType.PLANT_GREEN, pos: [6, 2], layer: 1 },
      { type: ItemType.MUG_RED, pos: [2, 2], layer: 1 },
      { type: ItemType.BOOK_BLUE, pos: [3, 0], layer: 1 },
    ],
    targets: [
      { type: ItemType.PLANT_GREEN, pos: [0, 4] },
      { type: ItemType.BOOK_BLUE, pos: [6, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [6, 2] },
      { type: ItemType.MUG_RED, pos: [6, 4] },
      { type: ItemType.ALARM_PINK, pos: [3, 4] },
    ],
    maxSteps: 30,
  },

  // 第 6 关
  {
    level: 6,
    grid: { rows: 7, cols: 5 },
    obstacles: [
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [6, 2],
      [5, 4],
      [4, 4],
      [3, 4],
    ],
    items: [
      { type: ItemType.ALARM_PINK, pos: [0, 4], layer: 2 },
      { type: ItemType.LAMP_ORANGE, pos: [0, 4], layer: 1 },
      { type: ItemType.ALARM_PINK, pos: [1, 2], layer: 3 },
      { type: ItemType.HEADPHONE_BLACK, pos: [1, 2], layer: 2 },
      { type: ItemType.HAT_PURPLE, pos: [1, 2], layer: 1 },
      { type: ItemType.LAMP_ORANGE, pos: [5, 3], layer: 1 },
      { type: ItemType.HEADPHONE_BLACK, pos: [5, 1], layer: 1 },
    ],
    targets: [
      { type: ItemType.ALARM_PINK, pos: [6, 0] },
      { type: ItemType.LAMP_ORANGE, pos: [0, 0] },
      { type: ItemType.HEADPHONE_BLACK, pos: [6, 4] },
      { type: ItemType.HAT_PURPLE, pos: [5, 2] },
    ],
    maxSteps: 30,
  },

  // 第 7 关
  {
    level: 7,
    grid: { rows: 7, cols: 5 },
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
    maxSteps: 30,
  },

  // 第 8 关
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
  },

  // 第 9 关
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
  },

  // 第 10 关
  {
    level: 10,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [2, 2],
    ],
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
  },

  // 第 11 关
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
  },

  // 第 12 关
  {
    level: 12,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [2, 2],
    ],
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
  },

  // 第 13 关
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
  },

  // 第 14 关
  {
    level: 14,
    grid: { rows: 6, cols: 5 },
    obstacles: [
      [2, 2],
    ],
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
  },

  // 第 15 关
  {
    level: 15,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
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

  // 第 16 关
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
  },

  // 第 17 关
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
  },

  // 第 18 关
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
  },

  // 第 19 关
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
  },

  // 第 20 关
  {
    level: 20,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    waters: [
      { pos: [2, 3], freezeIn: 6 },
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

  // 第 21 关
  {
    level: 21,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
      { pos: [3, 4], freezeIn: 5 },
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

  // 第 22 关
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
  },

  // 第 23 关
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
  },

  // 第 24 关
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
  },

  // 第 25 关
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
  },

  // 第 26 关
  {
    level: 26,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [4, 5], uses: 2 },
    ],
    oneways: [
      { pos: [2, 3], dir: 'right' },
      { pos: [3, 1], dir: 'down' },
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
  },

  // 第 27 关
  {
    level: 27,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
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
  },

  // 第 28 关
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
  },

  // 第 29 关
  {
    level: 29,
    grid: { rows: 5, cols: 5 },
    obstacles: [
      [2, 0],
      [2, 4],
    ],
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
  },

  // 第 30 关
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
  },

  // 第 31 关
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
  },

  // 第 32 关
  {
    level: 32,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    waters: [
      { pos: [3, 1], freezeIn: 6 },
    ],
    oneways: [
      { pos: [2, 4], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 3], kind: 'wall' },
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
  },

  // 第 33 关
  {
    level: 33,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
    portals: [
      { id: 1, pos: [0, 5], uses: 2 },
      { id: 1, pos: [5, 0], uses: 2 },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [4, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 1], kind: 'wall' },
      { id: 2, pos: [3, 4], kind: 'bridge' },
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
  },

  // 第 34 关
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
  },

  // 第 35 关
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
  },

  // 第 36 关
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
  },

  // 第 37 关
  {
    level: 37,
    grid: { rows: 6, cols: 5 },
    obstacles: [
      [2, 2],
    ],
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
  },

  // 第 38 关
  {
    level: 38,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
    ],
    oneways: [
      { pos: [2, 3], dir: 'right' },
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
  },

  // 第 39 关
  {
    level: 39,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
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
  },

  // 第 40 关
  {
    level: 40,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
    portals: [
      { id: 1, pos: [0, 1], uses: 2 },
      { id: 1, pos: [5, 5], uses: 2 },
    ],
    waters: [
      { pos: [2, 3], freezeIn: 5 },
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

  // 第 41 关
  {
    level: 41,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
    ],
    portals: [
      { id: 1, pos: [2, 0], uses: 3 },
      { id: 1, pos: [5, 5], uses: 3 },
    ],
    waters: [
      { pos: [0, 1], freezeIn: 6 },
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

  // 第 42 关
  {
    level: 42,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    waters: [
      { pos: [3, 1], freezeIn: 4 },
      { pos: [3, 4], freezeIn: 6 },
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
  },

  // 第 43 关
  {
    level: 43,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
    portals: [
      { id: 1, pos: [2, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    waters: [
      { pos: [3, 1], freezeIn: 5 },
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

  // 第 44 关
  {
    level: 44,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [6, 5], uses: 2 },
    ],
    waters: [
      { pos: [3, 3], freezeIn: 6 },
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

  // 第 45 关
  {
    level: 45,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 2 },
      { id: 1, pos: [5, 6], uses: 2 },
      { id: 2, pos: [1, 6], uses: 2 },
      { id: 2, pos: [5, 0], uses: 2 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 5 },
      { pos: [3, 4], freezeIn: 6 },
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

  // 第 46 关
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
  },

  // 第 47 关
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
  },

  // 第 48 关
  {
    level: 48,
    grid: { rows: 6, cols: 6 },
    obstacles: [],
    oneways: [
      { pos: [3, 2], dir: 'down' },
    ],
    buttons: [
      { id: 1, pos: [0, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [2, 2], kind: 'wall' },
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
  },

  // 第 49 关
  {
    level: 49,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
    oneways: [
      { pos: [2, 1], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [6, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 4], kind: 'bridge' },
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
  },

  // 第 50 关
  {
    level: 50,
    grid: { rows: 7, cols: 6 },
    obstacles: [],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 3], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [6, 5] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 4], kind: 'bridge' },
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

  // 第 51 关
  {
    level: 51,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
    oneways: [
      { pos: [4, 3], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 3], kind: 'wall' },
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
  },

  // 第 52 关
  {
    level: 52,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
      { pos: [3, 4], dir: 'up' },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [6, 3] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'bridge' },
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
  },

  // 第 53 关
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
  },

  // 第 54 关
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
  },

  // 第 55 关
  {
    level: 55,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
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
  },

  // 第 56 关
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
  },

  // 第 57 关
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
  },

  // 第 58 关
  {
    level: 58,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 59 关
  {
    level: 59,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 60 关
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
  },

  // 第 61 关
  {
    level: 61,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
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
  },

  // 第 62 关
  {
    level: 62,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
    ],
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
  },

  // 第 63 关
  {
    level: 63,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
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
  },

  // 第 64 关
  {
    level: 64,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 5], uses: 1 },
    ],
    waters: [
      { pos: [3, 3], freezeIn: 5 },
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
  },

  // 第 65 关
  {
    level: 65,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
    portals: [
      { id: 1, pos: [1, 0], uses: 1 },
      { id: 1, pos: [5, 6], uses: 1 },
      { id: 2, pos: [1, 6], uses: 1 },
      { id: 2, pos: [5, 0], uses: 1 },
    ],
    waters: [
      { pos: [3, 2], freezeIn: 6 },
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

  // 第 66 关
  {
    level: 66,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 67 关
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
  },

  // 第 68 关
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
  },

  // 第 69 关
  {
    level: 69,
    grid: { rows: 6, cols: 6 },
    obstacles: [
      [2, 2],
      [3, 3],
    ],
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
  },

  // 第 70 关
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
  },

  // 第 71 关
  {
    level: 71,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
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
    maxRefreshes: 2,
    winCondition: { mode: 'clearItem', targetType: ItemType.SHOE_YELLOW, targetCount: 2 },
  },

  // 第 72 关
  {
    level: 72,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 73 关
  {
    level: 73,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 74 关
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
    maxRefreshes: 4,
    winCondition: { mode: 'clearItem', targetType: ItemType.ALARM_PINK, targetCount: 1 },
  },

  // 第 75 关
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
  },

  // 第 76 关
  {
    level: 76,
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
  },

  // 第 77 关
  {
    level: 77,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
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
  },

  // 第 78 关
  {
    level: 78,
    grid: { rows: 7, cols: 6 },
    obstacles: [
      [3, 2],
    ],
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
  },

  // 第 79 关
  {
    level: 79,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 80 关
  {
    level: 80,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 81 关
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
  },

  // 第 82 关
  {
    level: 82,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 83 关
  {
    level: 83,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 84 关
  {
    level: 84,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
    waters: [
      { pos: [3, 4], freezeIn: 6 },
    ],
    oneways: [
      { pos: [2, 2], dir: 'right' },
      { pos: [4, 4], dir: 'left' },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [5, 4] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'bridge' },
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
  },

  // 第 85 关
  {
    level: 85,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 86 关
  {
    level: 86,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 87 关
  {
    level: 87,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
    maxRefreshes: 2,
    winCondition: { mode: 'clearItem', targetType: ItemType.APPLE_GREEN, targetCount: 3 },
  },

  // 第 88 关
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
  },

  // 第 89 关
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

  // 第 90 关
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
  },

  // 第 91 关
  {
    level: 91,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
    maxRefreshes: 3,
    winCondition: { mode: 'clearItem', targetType: ItemType.MUG_RED, targetCount: 3 },
  },

  // 第 92 关
  {
    level: 92,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
    oneways: [
      { pos: [3, 4], dir: 'right' },
    ],
    buttons: [
      { id: 1, pos: [1, 0] },
      { id: 2, pos: [5, 1] },
    ],
    activeBarriers: [
      { id: 1, pos: [3, 1], kind: 'wall' },
      { id: 2, pos: [3, 5], kind: 'wall' },
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

  // 第 93 关
  {
    level: 93,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 94 关
  {
    level: 94,
    grid: { rows: 7, cols: 7 },
    obstacles: [],
    portals: [
      { id: 1, pos: [1, 0], uses: 3 },
      { id: 1, pos: [5, 6], uses: 3 },
    ],
    waters: [
      { pos: [3, 3], freezeIn: 8 },
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

  // 第 95 关
  {
    level: 95,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 96 关
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
  },

  // 第 97 关
  {
    level: 97,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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

  // 第 98 关
  {
    level: 98,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  },

  // 第 99 关
  {
    level: 99,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
    maxRefreshes: 2,
    winCondition: { mode: 'clearItem', targetType: ItemType.APPLE_GREEN, targetCount: 4 },
  },

  // 第 100 关
  {
    level: 100,
    grid: { rows: 7, cols: 7 },
    obstacles: [
      [3, 3],
    ],
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
  }];

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
