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
import { CellData, ONEWAY_DIR_VECTORS, ReachableCell } from '../types/index';

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

    // 【v0.8.10】严格单向通道：起点若在单向门格上（物品压在门格上时 onewayDir 保留），
    // 只允许沿箭头方向离开；反向/垂直方向视为不可达（物品一旦进入门格就被"通道"约束）。
    const startCell = this.board.getCell(row, col);
    const startOnewayDir = startCell?.onewayDir;

    // 【v0.10.6】起点格正压着按钮（cell.buttonId 保留）：物品一旦被拖离，这只按钮立刻弹起、
    // 同组的活动门随之关闭。所以本步的可达性计算必须把它对应的门视为"关门"，
    // 否则会出现漏洞：拖走压按钮的物品时，它穿过自己刚关闭的门、甚至停到门格上
    // （35 关实测：按钮上物品移走后门已关，物品却留在门里，按钮处空无一物）。
    // 【v0.10.8 多对多】一个组可能有多个按钮：只有**组内没有其它按钮仍被压住**时，本步才关门。
    const releasedGroupId = startCell?.buttonId;

    /**
     * 【v0.10.6】该格是否阻挡通行：
     * - 活动门未激活 → 关门，等同障碍
     * - 活动门激活，但本步释放的按钮所在机关组已无人压住（多对多下需组内全弹起）→ 本步视为关门
     */
    const isBarrierBlocking = (cell: CellData): boolean => {
      if (cell.type !== 'active_wall' && cell.type !== 'active_bridge') return false;
      if (cell.barrierActive !== true) return true;
      if (releasedGroupId === undefined || cell.barrierId !== releasedGroupId) return false;
      return !this.board.isButtonGroupPressed(releasedGroupId, { row, col });
    };

    for (const [dr, dc] of directions) {
      // 起点是单向门格：仅箭头同向可通行（方案 B：严格单向通道）
      if (startOnewayDir) {
        const startDirVec = ONEWAY_DIR_VECTORS[startOnewayDir];
        if (startDirVec[0] !== dr || startDirVec[1] !== dc) continue;
      }

      let r = row + dr;
      let c = col + dc;

      // 沿一个方向一直走，直到碰到障碍物或物品
      while (this.board.isValidCell(r, c)) {
        const cell = this.board.getCell(r, c);

        // 如果碰到障碍物或冰块，停
        if (!cell || cell.type === 'obstacle' || cell.type === 'ice') break;

        // 活动门：关门（含"本步被释放的按钮所连的门"，见 isBarrierBlocking）挡住路径
        if (isBarrierBlocking(cell)) break;

        // 如果碰到物品，不能走也不能停
        if (cell.type === 'item') break;

        // 单向门：只有移动方向与门箭头方向一致时才能进入/穿过
        // 反向（或垂直方向）移动时，单向门视为障碍物
        if (cell.type === 'oneway') {
          const dirVec = cell.onewayDir ? ONEWAY_DIR_VECTORS[cell.onewayDir] : null;
          const canPass = dirVec !== null && dirVec[0] === dr && dirVec[1] === dc;
          if (!canPass) break;
        }

        // 空格、目标格、传送门、按钮：都可以停在这里
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

        // 【v0.10.6】开着的活动门是"通道"不是"停车位"：物品可以穿过，但不能停在门格上。
        // 否则按钮一释放、门重新关闭，就会留下"物品压在关着的门上"的非法状态
        // （35 关实测：物品停在门格上后按钮弹起，门关着而物品仍在门里）。
        // 门格上若已有物品（老存档 / 编辑器手工摆放）时 type === 'item'，上面已 break，不会走到这里。
        if (cell.type === 'active_wall' || cell.type === 'active_bridge') {
          r += dr;
          c += dc;
          continue;
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
