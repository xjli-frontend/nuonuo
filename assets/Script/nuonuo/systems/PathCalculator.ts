/**
 * 路径计算器（PathCalculator）
 * 
 * 【通俗说明】当玩家拖拽一个物品时，需要计算"它可以放到哪些格子上"。
 * 
 * 规则（来自 GDD）：
 * - 物品只能沿同行或同列移动
 * - 只能穿过连续的纯空格和目标格
 * - 不能跨越物品或障碍物
 * - 可以从起点沿一条直线穿过多个空格直达终点
 * 
 * 这个类就是实现这个计算逻辑的。
 * 
 * 算法思路（通俗版）：
 * 想象你在十字路口，只能往上下左右四个方向走。
 * 从你的位置出发，往每个方向一路走下去，
 * 只要路过的格子是空的（纯空格或目标格），就可以停在那里。
 * 一旦碰到障碍物或物品，这个方向就不能再往前了。
 */

import { Board } from './Board';
import { ONEWAY_DIR_VECTORS, ReachableCell } from '../types/index';

export class PathCalculator {
  private board: Board;

  constructor(board: Board) {
    this.board = board;
  }

  /**
   * 计算物品从指定位置出发，所有可到达的格子
   * 
   * @param row 物品所在行
   * @param col 物品所在列
   * @returns 所有可到达的位置列表（按方向分组，方便渲染时高亮）
   */
  calculateReachable(row: number, col: number): ReachableCell[] {
    const result: ReachableCell[] = [];

    // 四个方向：上、下、左、右
    const directions: [number, number][] = [
      [-1, 0],  // 上
      [1, 0],   // 下
      [0, -1],  // 左
      [0, 1],   // 右
    ];

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;

      // 沿一个方向一直走，直到碰到障碍物或物品
      while (this.board.isValidCell(r, c)) {
        const cell = this.board.getCell(r, c);

        // 如果碰到障碍物或冰块，停
        if (!cell || cell.type === 'obstacle' || cell.type === 'ice') break;

        // 活动墙/桥：未激活（barrierActive !== true）视为障碍物，挡住路径
        if ((cell.type === 'active_wall' || cell.type === 'active_bridge')
          && cell.barrierActive !== true) {
          break;
        }

        // 如果碰到物品，不能走也不能停
        if (cell.type === 'item') break;

        // 单向门：只有移动方向与门箭头方向一致时才能进入/穿过
        // 反向（或垂直方向）移动时，单向门视为障碍物
        if (cell.type === 'oneway') {
          const dirVec = cell.onewayDir ? ONEWAY_DIR_VECTORS[cell.onewayDir] : null;
          const canPass = dirVec !== null && dirVec[0] === dr && dirVec[1] === dc;
          if (!canPass) break;
        }

        // 空格、目标格、传送门、按钮、激活的活动墙/桥：都可以停在这里
        // 但次数用完的传送门不可作为目的地
        const isPortalExhausted =
          cell.type === 'portal' &&
          cell.portalUses !== undefined &&
          cell.portalUses <= 0;
        if (isPortalExhausted) {
          // 传送门用完了，不能停但可以穿过吗？
          // 设计选择：用完的传送门变为不可穿越（像障碍物一样）
          break;
        }

        result.push({
          row: r,
          col: c,
          isTarget: cell.type === 'target',
          isPortal: cell.type === 'portal',
          isOneway: cell.type === 'oneway',
        });

        r += dr;
        c += dc;
      }
    }

    return result;
  }

  /**
   * 检查物品是否能移动到指定位置
   * 
   * @param fromRow 起始行
   * @param fromCol 起始列
   * @param toRow 目标行
   * @param toCol 目标列
   * @returns 是否能移动
   */
  canMoveTo(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean {
    const reachable = this.calculateReachable(fromRow, fromCol);
    return reachable.some(cell => cell.row === toRow && cell.col === toCol);
  }

  /**
   * 检查从起点到终点路径上是否有障碍
   * 用于验证移动路径的合法性
   */
  private isPathClear(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean {
    // 必须在同行或同列
    if (fromRow !== toRow && fromCol !== toCol) return false;

    // 同行：从左到右（或从右到左）检查
    if (fromRow === toRow) {
      const minCol = Math.min(fromCol, toCol);
      const maxCol = Math.max(fromCol, toCol);
      for (let c = minCol; c <= maxCol; c++) {
        // 跳过起点
        if (c === fromCol) continue;
        // 路径上的格子必须是纯空格或目标格
        if (!this.board.isEmpty(fromRow, c)) return false;
      }
      return true;
    }

    // 同列：从上到下检查
    if (fromCol === toCol) {
      const minRow = Math.min(fromRow, toRow);
      const maxRow = Math.max(fromRow, toRow);
      for (let r = minRow; r <= maxRow; r++) {
        // 跳过起点
        if (r === fromRow) continue;
        if (!this.board.isEmpty(r, fromCol)) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * 死局检测（简单版）：
   * 检查每个未归位的物品是否至少有一条路径能到达任意对应类型的目标格
   * 
   * @returns true 表示存在死局（某个物品无法到达任何目标格）
   */
  detectDeadlock(items: { row: number; col: number; itemType: string; targetType?: string }[]): boolean {
    for (const item of items) {
      // 已归位的物品跳过
      if (item.itemType === item.targetType) continue;

      const reachable = this.calculateReachable(item.row, item.col);
      
      // 检查可达格中是否有匹配的目标格
      let hasTarget = false;
      for (const cell of reachable) {
        if (cell.isTarget) {
          const boardCell = this.board.getCell(cell.row, cell.col);
          if (boardCell && boardCell.targetType === item.itemType) {
            hasTarget = true;
            break;
          }
        }
      }

      // 如果没有可达的匹配目标格，判定为死局
      if (!hasTarget) return true;
    }

    return false;
  }
}
