/**
 * 棋盘系统（Board）
 * 
 * 【通俗说明】棋盘是游戏的核心数据结构。
 * 它用一个二维数组来表示整个棋盘，每个格子存一个 CellData。
 * 
 * 物品的移动、堆叠、归位，本质上就是操作这个二维数组里的数据。
 * 比如"把物品从 (1,2) 移到 (4,1)"，就是把数组里 [1][2] 的数据
 * 搬到 [4][1]。
 * 
 * 所有对棋盘的操作（读取、写入、移动）都通过 Board 类来完成，
 * 这样能保证数据一致性，不会出现"某个模块偷偷改了数据导致 bug"。
 */

import { CellData, CellType, ItemType, LevelConfig } from '../types/index';
import { GameConfig } from '../config/GameConfig';

/** moveItem 的返回结果 */
export interface MoveResult {
  success: boolean;      // 是否移动成功
  teleported: boolean;    // 是否触发了传送门
  finalRow: number;      // 物品最终所在行（传送后可能和 toRow 不同）
  finalCol: number;      // 物品最终所在列（传送后可能和 toCol 不同）
}

export class Board {
  /** 棋盘行数 */
  rows: number;
  /** 棋盘列数 */
  cols: number;
  /** 棋盘数据：grid[row][col] 获取格子 */
  grid: CellData[][];

  /** 目标格坐标列表：方便快速查找目标格 */
  targetPositions: [number, number][] = [];

  /** 水洼格子坐标列表：方便快速查找 */
  waterPositions: [number, number][] = [];

  /** 按钮格子坐标列表：方便快速查找 */
  buttonPositions: [number, number][] = [];
  /** 活动墙/桥格子坐标列表：方便快速查找 */
  barrierPositions: [number, number][] = [];

  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.grid = [];
  }

  /**
   * 从关卡配置加载棋盘
   * @param config 关卡配置数据
   */
  loadLevel(config: LevelConfig): void {
    this.rows = config.grid.rows;
    this.cols = config.grid.cols;
    this.targetPositions = [];
    this.waterPositions = [];
    this.buttonPositions = [];
    this.barrierPositions = [];

    // 第一步：创建空棋盘
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = { type: CellType.EMPTY };
      }
    }

    // 第二步：放置障碍物
    for (const [row, col] of config.obstacles) {
      if (this.isValidCell(row, col)) {
        this.grid[row][col] = { type: CellType.OBSTACLE };
      }
    }

    // 第三步：放置目标格
    for (const target of config.targets) {
      const [row, col] = target.pos;
      if (this.isValidCell(row, col)) {
        this.grid[row][col] = {
          type: CellType.TARGET,
          targetType: target.type,
          placedCount: 0, // 【v0.6.2】目标格无限容量记账，初始 0
        };
        this.targetPositions.push([row, col]);
      }
    }

    // 第三步半：放置传送门（成对出现，共享同一 portalId）
    if (config.portals) {
      for (const portal of config.portals) {
        const [row, col] = portal.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.EMPTY) {
            this.grid[row][col] = {
              type: CellType.PORTAL,
              portalId: portal.id,
              portalUses: portal.uses,  // undefined = 无限
              targetType: cell.targetType,
            };
          } else if (cell.type === CellType.TARGET) {
            cell.portalId = portal.id;
            cell.portalUses = portal.uses;
          }
        }
      }
    }

    // 第三步五分之四：放置单向门
    // 单向门是独立地形格：只允许放在纯空格上（编辑器校验保证不与其他元素重叠）
    if (config.oneways) {
      for (const oneway of config.oneways) {
        const [row, col] = oneway.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.EMPTY) {
            this.grid[row][col] = {
              type: CellType.ONEWAY,
              onewayDir: oneway.dir,
            };
          }
        }
      }
    }

    // 第三步六分之五：放置按钮（可通行格，物品压住即触发）
    if (config.buttons) {
      for (const btn of config.buttons) {
        const [row, col] = btn.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.EMPTY) {
            this.grid[row][col] = {
              type: CellType.BUTTON,
              buttonId: btn.id,
              buttonPressed: false,
            };
            this.buttonPositions.push([row, col]);
          }
        }
      }
    }

    // 第三步七分之六：放置活动墙/桥
    // 默认未激活：墙=实体阻挡，桥=缺口阻挡；激活后均变为可通行
    if (config.activeBarriers) {
      for (const b of config.activeBarriers) {
        const [row, col] = b.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.EMPTY) {
            this.grid[row][col] = {
              type: b.kind === 'wall' ? CellType.ACTIVE_WALL : CellType.ACTIVE_BRIDGE,
              barrierId: b.id,
              barrierKind: b.kind,
              barrierActive: false,
            };
            this.barrierPositions.push([row, col]);
          }
        }
      }
    }

    // 第三步四分之三：放置水洼
    // 水洼可以放在空格、目标格上，甚至在物品下方
    // 水洼是一个"附加属性"，不改变格子的基本类型（空格/目标格/物品格）
    // 但如果格子当前是纯空格，则类型变为 WATER
    if (config.waters) {
      for (const water of config.waters) {
        const [row, col] = water.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.EMPTY) {
            // 空格变水洼
            cell.type = CellType.WATER;
            cell.freezeCounter = water.freezeIn;
          } else if (cell.type === CellType.TARGET) {
            // 目标格上的水洼：保持 TARGET 类型但附加 freezeCounter
            cell.freezeCounter = water.freezeIn;
          } else if (cell.type === CellType.PORTAL) {
            // 传送门上的水洼：保持 PORTAL 类型但附加 freezeCounter
            cell.freezeCounter = water.freezeIn;
          }
          // 物品下方的水洼在物品放置后处理
          this.waterPositions.push([row, col]);
        }
      }
    }

    // 第四步：放置物品（支持堆叠）
    // 同一格子可能有多个物品（堆叠），需要正确处理：
    // - cell.itemType 存顶层（layer 最小）物品
    // - cell.stack 存所有堆叠物品列表
    
    // 先按位置分组
    const itemsByPos = new Map<string, { type: ItemType; pos: [number, number]; layer: number }[]>();
    for (const item of config.items) {
      const key = `${item.pos[0]},${item.pos[1]}`;
      if (!itemsByPos.has(key)) itemsByPos.set(key, []);
      itemsByPos.get(key)!.push(item);
    }

    // 处理每个位置的物品
    for (const [key, posItems] of itemsByPos) {
      const [row, col] = key.split(',').map(Number);
      if (!this.isValidCell(row, col)) continue;

      // 按 layer 升序排序（layer=1 在最前，是顶层）
      posItems.sort((a, b) => a.layer - b.layer);

      const cell = this.grid[row][col];
      const targetType = cell.targetType; // 保留目标格类型
      const freezeCounter = cell.freezeCounter; // 保留水洼倒计时

      // 写入顶层物品信息 + 堆叠列表
      cell.type = CellType.ITEM;
      cell.itemType = posItems[0].type;
      cell.layer = posItems[0].layer;
      cell.targetType = targetType;
      cell.stack = posItems.map(it => ({ type: it.type, layer: it.layer }));
      cell.freezeCounter = freezeCounter; // 保留水洼信息
    }
  }

  /**
   * 判断坐标是否在棋盘范围内
   */
  isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * 获取某个格子的数据
   * @returns 格子数据，越界返回 null
   */
  getCell(row: number, col: number): CellData | null {
    if (!this.isValidCell(row, col)) return null;
    return this.grid[row][col];
  }

  /**
   * 判断一个格子是否是空格（纯空格/目标格/传送门/水洼/单向门）
   * 这些格子都可以作为移动的目的地
   * 冰块（ICE）不可到达，视为障碍物
   * 注意：单向门有进入方向限制，这里只表示"可停留"，
   *       方向判定在 PathCalculator 中按移动方向进行
   */
  isEmpty(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    // 按钮：恒可通行（物品可压住触发）
    if (cell.type === CellType.BUTTON) return true;
    // 活动墙/桥：仅激活态可通行
    if (cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE) {
      return cell.barrierActive === true;
    }
    return cell.type === CellType.EMPTY
      || cell.type === CellType.TARGET
      || cell.type === CellType.PORTAL
      || cell.type === CellType.WATER
      || cell.type === CellType.ONEWAY;
  }

  /**
   * 判断一个格子是否是单向门
   */
  isOneway(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ONEWAY;
  }

  /**
   * 判断一个格子是否是传送门
   */
  isPortal(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.PORTAL;
  }

  /**
   * 判断一个传送门是否还可以使用
   * 次数为 0 或负数时返回 false
   */
  isPortalAvailable(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell || cell.type !== CellType.PORTAL) return false;
    if (cell.portalUses === undefined) return true; // undefined = 无限
    return cell.portalUses > 0;
  }

  // ========== 按钮 / 活动墙/桥 ==========

  /** 判断一个格子是否是按钮 */
  isButton(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.BUTTON;
  }

  /** 判断一个格子是否是活动墙/桥 */
  isActiveBarrier(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE;
  }

  /** 判断活动墙/桥当前是否处于激活态（可通行） */
  isBarrierActive(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return (cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE)
      && cell.barrierActive === true;
  }

  /**
   * 重新结算所有按钮的按下状态，并同步刷新所连活动墙/桥的激活态。
   *
   * 规则：按钮所在格若有物品停留（cell.type === ITEM 且保留了 buttonId），
   *   即视为按下；否则弹起。按钮按下 → 同 id 的活动墙/桥激活（可通行）。
   *
   * 物品移到按钮上时 cell.type 变为 ITEM，但 buttonId 被保留（moveItem 中处理），
   * 因此这里通过 buttonId 字段判断"该格本质是按钮且当前压着物品"。
   * 同理按钮空置时 cell.type === BUTTON。
   */
  recalcButtons(): void {
    // 1. 收集每个按钮 id 当前是否被压住
    const pressedMap = new Map<number, boolean>();
    for (const [row, col] of this.buttonPositions) {
      const cell = this.getCell(row, col);
      if (!cell || cell.buttonId === undefined) continue;
      // 物品压住按钮：cell.type 变为 ITEM 但 buttonId 保留
      const pressed = cell.type === CellType.ITEM;
      cell.buttonPressed = pressed;
      pressedMap.set(cell.buttonId, pressed);
    }
    // 2. 按按钮态刷新所有活动墙/桥
    for (const [row, col] of this.barrierPositions) {
      const cell = this.getCell(row, col);
      if (!cell || cell.barrierId === undefined) continue;
      cell.barrierActive = pressedMap.get(cell.barrierId) === true;
    }
  }

  // ========== 水洼/冰块相关方法 ==========

  /**
   * 判断一个格子是否有水洼（freezeCounter 有值且 > 0）
   */
  hasWater(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.freezeCounter !== undefined && cell.freezeCounter > 0;
  }

  /**
   * 每次成功移动后调用：所有水洼的倒计数 -1
   * 返回是否触发了结冰
   */
  tickWaters(): boolean {
    let anyFroze = false;
    for (const [row, col] of this.waterPositions) {
      const cell = this.getCell(row, col);
      if (!cell || cell.freezeCounter === undefined || cell.freezeCounter <= 0) continue;

      cell.freezeCounter--;
      if (cell.freezeCounter <= 0) {
        // 结冰！
        this.freezeCell(row, col);
        anyFroze = true;
      }
    }
    return anyFroze;
  }

  /**
   * 将一个格子冻结为冰块
   * 
   * 规则：
   * - 已归位的物品（ITEM + 类型匹配的 targetType）不受影响
   * - 空目标格被冰封 → 变为 ICE，对应物品无法再归位
   * - 纯空格/水洼被冰封 → 变为 ICE（永久障碍物）
   * - 传送门被冰封 → 变为 ICE
   * - 物品下方的水洼结冰 → 物品保持，但格子底层变为冰（物品移走后是 ICE）
   */
  private freezeCell(row: number, col: number): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    // 【v0.6.2】已归位的目标格不受影响（placedCount>0 表示已容纳归位物品）
    if (cell.type === CellType.TARGET && (cell.placedCount ?? 0) > 0) {
      return;
    }
    // 兼容老逻辑：ITEM 格上类型匹配的归位态
    if (cell.type === CellType.ITEM && cell.targetType && cell.itemType === cell.targetType) {
      return;
    }

    // 如果格子上有未归位物品，物品保持但标记底层为冰
    // 物品移走后格子会恢复，此时应该恢复为 ICE 而非 EMPTY
    if (cell.type === CellType.ITEM) {
      // 标记：物品移走后恢复为 ICE
      // 用 targetType = undefined + 特殊标记来表示
      // 简化处理：直接把物品冻结（物品不能移动）
      // 实际上 GDD 说"物品下方的格子结冰"，物品还是在的
      // 物品移走后才暴露冰块
      // 我们用一个特殊值：freezeCounter = -1 表示已冻结
      cell.freezeCounter = -1;
      return;
    }

    // 其他情况直接变冰块
    cell.type = CellType.ICE;
    cell.freezeCounter = undefined;
  }

  /** 判断一个格子是否是冰块 */
  isIce(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ICE;
  }

  /**
   * 获取某个格子的水洼倒计时（用于渲染显示）
   */
  getFreezeCounter(row: number, col: number): number | undefined {
    const cell = this.getCell(row, col);
    if (!cell) return undefined;
    return cell.freezeCounter;
  }

  /**
   * 获取配对的传送门坐标
   * 传送门成对出现，共享同一个 portalId
   * 
   * @param row 当前传送门的行
   * @param col 当前传送门的列
   * @returns 配对传送门的 [row, col]，如果找不到返回 null
   */
  getPortalExit(row: number, col: number): [number, number] | null {
    const cell = this.getCell(row, col);
    if (!cell || cell.type !== CellType.PORTAL || cell.portalId === undefined) return null;

    // 遍历棋盘找到另一个相同 portalId 的传送门
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (r === row && c === col) continue; // 跳过自己
        const other = this.grid[r][c];
        if (other.type === CellType.PORTAL && other.portalId === cell.portalId) {
          return [r, c];
        }
      }
    }
    return null;
  }

  /**
   * 判断一个格子是否是纯空格（不是目标格）
   */
  isPureEmpty(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.EMPTY;
  }

  /**
   * 判断一个格子是否是目标格
   */
  isTarget(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.TARGET;
  }

  /**
   * 判断一个格子是否是障碍物
   * 活动墙/桥未激活时视为障碍物（激活后可通行）
   */
  isObstacle(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return true; // 越界视为障碍物
    if (cell.type === CellType.OBSTACLE) return true;
    if (cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE) {
      return cell.barrierActive !== true;
    }
    return false;
  }

  /**
   * 判断一个格子是否有物品
   */
  hasItem(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ITEM;
  }

  /**
   * 获取某个格子上最顶层的物品信息
   * 如果格子上有堆叠，返回最顶层（layer=1）的物品
   * @returns { itemType, layer, row, col } 或 null
   */
  getTopItem(row: number, col: number): { itemType: ItemType; layer: number; row: number; col: number } | null {
    const cell = this.getCell(row, col);
    if (!cell || cell.type !== CellType.ITEM || !cell.itemType) return null;
    return {
      itemType: cell.itemType,
      layer: cell.layer ?? 1,
      row,
      col,
    };
  }

  /**
   * 获取某个格子上物品的堆叠层数
   * @returns 层数（0 表示无物品）
   */
  getStackCount(row: number, col: number): number {
    const cell = this.getCell(row, col);
    if (!cell || cell.type !== CellType.ITEM) return 0;
    // 统计同格有多少层物品
    // 因为物品数据是扁平存储在 items 数组中的，
    // 所以这里只返回当前层的标识
    // 真正的堆叠数需要从外部管理（levelConfig.items）
    return 1; // Board 层只知道自己存了一个物品
  }

  /**
   * 检查某个物品是否可被拖拽
   * 条件：该物品必须是格子里的最顶层（layer=1）
   */
  canDrag(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell || cell.type !== CellType.ITEM) return false;
    return (cell.layer ?? 1) === 1;
  }

  /**
   * 移动物品：从 from 移动到 to
   * 
   * 这是游戏最核心的操作！
   * 现在自动处理堆叠：移走顶层后，下层自动暴露为新的顶层。
   * 支持传送门：如果目标是传送门，物品会传送到配对传送门。
   * 
   * @param fromRow 起始行
   * @param fromCol 起始列
   * @param toRow 目标行
   * @param toCol 目标列
   * @returns 移动结果对象，含是否传送、实际落点等信息
   */
  moveItem(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): MoveResult {
    const result: MoveResult = {
      success: false,
      teleported: false,
      finalRow: toRow,
      finalCol: toCol,
    };

    const fromCell = this.getCell(fromRow, fromCol);
    let toCell = this.getCell(toRow, toCol);

    // 验证：起始格必须有物品
    if (!fromCell || fromCell.type !== CellType.ITEM) return result;
    // 验证：目标格必须可达（空格/目标格/传送门/水洼/单向门/按钮/激活的活动墙·桥）
    // 注意：单向门的进入方向限制由 PathCalculator 在可达性计算时把关，这里只校验格子类型
    const isReachableDest = (t: CellType) =>
      t === CellType.EMPTY || t === CellType.TARGET || t === CellType.PORTAL
      || t === CellType.WATER || t === CellType.ONEWAY || t === CellType.BUTTON
      || ((t === CellType.ACTIVE_WALL || t === CellType.ACTIVE_BRIDGE));
    // 【v0.8.9/A】已有物品的格子：仅当堆叠未满 MAX_STACK_LAYERS 时可作为目的地
    // （撤销放回堆叠格；普通拖拽已被 PathCalculator 过滤，玩家不会直接落到物品格上）
    const isStackableDest =
      !!toCell && toCell.type === CellType.ITEM && (toCell.stack?.length ?? 1) < GameConfig.MAX_STACK_LAYERS;
    if (!toCell || (!isReachableDest(toCell.type) && !isStackableDest)) return result;

    // ========== 传送门处理 ==========
    // 如果目标是传送门，找到配对传送门作为实际目的地
    let actualToRow = toRow;
    let actualToCol = toCol;

    if (toCell.type === CellType.PORTAL) {
      const exit = this.getPortalExit(toRow, toCol);
      if (!exit) return result; // 没有配对传送门

      const exitCell = this.getCell(exit[0], exit[1]);
      // 配对出口必须可达（不能是物品或障碍物）
      if (!exitCell || exitCell.type === CellType.ITEM || this.isObstacle(exit[0], exit[1])) {
        return result; // 出口被堵，传送失败
      }

      // 检查使用次数（undefined = 无限）
      if (toCell.portalUses !== undefined && toCell.portalUses <= 0) {
        return result; // 传送门已用完
      }

      // 【v0.8.7】方向感知传送：物品沿行进方向从配对传送门"钻出"到出口外侧的空格。
      // 进入方向 = 起始格相对入口传送门的方向（物品直线滑动，方向即行进方向）。
      const dirRow = Math.sign(toRow - fromRow);
      const dirCol = Math.sign(toCol - fromCol);
      // 出口落点 = 配对传送门 B 沿行进方向再走一格（镜像反转：从 A 上边进 → 从 B 下边出）
      const landRow = exit[0] + dirRow;
      const landCol = exit[1] + dirCol;
      const landCell = this.getCell(landRow, landCol);
      // 【v0.8.8/B】落点 = 可合法放置物品的格子（EMPTY/TARGET/WATER/ONEWAY/BUTTON/激活的活动墙·桥），
      // 含目标格（传送后可直接归位消除）；但排除：障碍/未激活墙·桥、越界、以及任何传送门（避免无限传送）。
      // 【v0.8.9/A】出口落点若已有物品且堆叠未满 MAX_STACK_LAYERS，允许直接堆叠上去（方案 A：传送门出口堆叠特例）
      const isLandingStackable =
        landCell?.type === CellType.ITEM && (landCell.stack?.length ?? 1) < GameConfig.MAX_STACK_LAYERS;
      const isLandingValid =
        !!landCell &&
        !this.isObstacle(landRow, landCol) &&
        (isReachableDest(landCell.type) || isLandingStackable) &&
        landCell.type !== CellType.PORTAL;
      if (!landCell || !isLandingValid) {
        return result; // 出口方向落点不可用，传送失败（物品回弹入口原位）
      }

      // 扣减使用次数
      if (toCell.portalUses !== undefined) {
        toCell.portalUses--;
        // 出口传送门也同步扣减
        if (exitCell.portalUses !== undefined) {
          exitCell.portalUses--;
        }
      }

      // 实际目的地改为出口外侧的空格
      actualToRow = landRow;
      actualToCol = landCol;
      toCell = landCell;
      result.teleported = true;
      result.finalRow = actualToRow;
      result.finalCol = actualToCol;
    }

    // 保存要移动的物品信息
    const itemType = fromCell.itemType!;
    const fromTargetType = fromCell.targetType; // 起始格是否原本是目标格
    // 保存起始格的传送门信息（物品移走后需要恢复）
    const fromPortalId = fromCell.portalId;
    const fromPortalUses = fromCell.portalUses;
    // 保存起始格的冻结状态（-1 = 已冻结，物品移走后恢复为 ICE）
    const fromFreezeCounter = fromCell.freezeCounter;
    // 保存起始格的单向门方向（物品移走后需要恢复为单向门）
    const fromOnewayDir = fromCell.onewayDir;
    // 保存起始格的按钮信息（物品移走后需要恢复为按钮）
    const fromButtonId = fromCell.buttonId;
    // 保存起始格的活动墙/桥信息（物品移走后需要恢复为活动墙/桥）
    const fromBarrierId = fromCell.barrierId;
    const fromBarrierKind = fromCell.barrierKind;

    // ========== 处理目标格 ==========
    // 【v0.6.2】归位判定：目标格是 TARGET 且类型匹配 → 物品"消失"进目标格（无限容量）
    // 目标格保持 TARGET 状态，placedCount+1，不写入物品（这样下一个同类物品还能落入）
    const isPlacingMove = toCell.type === CellType.TARGET && toCell.targetType === itemType;

    // 保存目标格的传送门信息（物品放上去后需要保留）
    const toPortalId = toCell.portalId;
    const toPortalUses = toCell.portalUses;
    // 保存目标格的水洼倒计时（物品放上去后需要保留）
    const toFreezeCounter = toCell.freezeCounter;
    // 保存目标格的单向门方向（物品放上去后需要保留）
    const toOnewayDir = toCell.onewayDir;
    // 保存目标格的按钮信息（物品放上去后需要保留，便于 recalcButtons 判断"压住"）
    const toButtonId = toCell.buttonId;
    // 保存目标格的活动墙/桥信息（物品放上去后需要保留）
    const toBarrierId = toCell.barrierId;
    const toBarrierKind = toCell.barrierKind;

    if (isPlacingMove) {
      // 归位：物品消失进目标格，目标格保持 TARGET，容量 +1
      toCell.type = CellType.TARGET;
      toCell.placedCount = (toCell.placedCount ?? 0) + 1;
      // 不写入 itemType/stack（物品已"消除"）
      toCell.portalId = toPortalId;
      toCell.portalUses = toPortalUses;
      toCell.freezeCounter = toFreezeCounter;
      toCell.onewayDir = toOnewayDir;
      toCell.buttonId = toButtonId;
      toCell.barrierId = toBarrierId;
      toCell.barrierKind = toBarrierKind;
      // targetType 保持不变
    } else {
      // 非归位：物品留在目标格上（类型不匹配，或落到空格/传送门出口空格/按钮/活动墙·桥）
      // 【v0.8.9/A】传送门出口堆叠：若落点原本已是物品格，保留原堆叠，新物品作为顶层压入，原各层下移一层
      const existingStack =
        toCell.type === CellType.ITEM
          ? (toCell.stack ?? [{ type: toCell.itemType!, layer: toCell.layer ?? 1 }])
          : [];
      toCell.type = CellType.ITEM;
      toCell.itemType = itemType;
      toCell.layer = 1; // 移过去后变为顶层
      toCell.stack = [
        { type: itemType, layer: 1 },
        ...existingStack.map(s => ({ type: s.type, layer: s.layer + 1 })),
      ];
      toCell.portalId = toPortalId;
      toCell.portalUses = toPortalUses;
      toCell.freezeCounter = toFreezeCounter;
      toCell.onewayDir = toOnewayDir;
      toCell.buttonId = toButtonId;
      toCell.barrierId = toBarrierId;
      toCell.barrierKind = toBarrierKind;
      // targetType 保持现有值（用于判断归位）
    }

    // ========== 处理起始格 ==========
    // 从堆叠中移除顶层物品
    if (fromCell.stack && fromCell.stack.length > 0) {
      fromCell.stack.shift(); // 移除第一个（顶层）
    }

    if (fromCell.stack && fromCell.stack.length > 0) {
      // 还有下层物品，暴露最上层
      fromCell.type = CellType.ITEM;
      fromCell.itemType = fromCell.stack[0].type;
      fromCell.layer = 1; // 新的顶层，layer 重置为 1
      // targetType 和 portalId 保持现有值
    } else {
      // 没有剩余物品，清空格子
      fromCell.stack = undefined;
      fromCell.itemType = undefined;
      fromCell.layer = undefined;

      if (fromFreezeCounter === -1) {
        // 已冻结，恢复为冰块
        fromCell.type = CellType.ICE;
        fromCell.freezeCounter = undefined;
        fromCell.portalId = undefined;
        fromCell.portalUses = undefined;
        fromCell.targetType = undefined;
        fromCell.onewayDir = undefined;
        fromCell.buttonId = undefined;
        fromCell.buttonPressed = undefined;
        fromCell.barrierId = undefined;
        fromCell.barrierKind = undefined;
        fromCell.barrierActive = undefined;
      } else if (fromPortalId !== undefined) {
        // 原本是传送门，恢复为传送门
        fromCell.type = CellType.PORTAL;
        fromCell.portalId = fromPortalId;
        fromCell.portalUses = fromPortalUses;
        // targetType 保持现有值
      } else if (fromOnewayDir !== undefined) {
        // 原本是单向门，恢复为单向门
        fromCell.type = CellType.ONEWAY;
        fromCell.onewayDir = fromOnewayDir;
      } else if (fromButtonId !== undefined) {
        // 原本是按钮，恢复为按钮（按下态稍后由 recalcButtons 统一结算）
        fromCell.type = CellType.BUTTON;
        fromCell.buttonId = fromButtonId;
        fromCell.buttonPressed = false;
      } else if (fromBarrierId !== undefined) {
        // 原本是活动墙/桥，恢复为对应类型（激活态稍后由 recalcButtons 统一结算）
        fromCell.type = fromBarrierKind === 'wall' ? CellType.ACTIVE_WALL : CellType.ACTIVE_BRIDGE;
        fromCell.barrierId = fromBarrierId;
        fromCell.barrierKind = fromBarrierKind;
        fromCell.barrierActive = false;
      } else if (fromTargetType) {
        // 原本是目标格，恢复为目标格
        fromCell.type = CellType.TARGET;
        // targetType 保持不变
      } else {
        fromCell.type = CellType.EMPTY;
        fromCell.targetType = undefined;
      }
    }

    result.success = true;
    return result;
  }

  /**
   * 检查物品是否在目标格上且类型匹配（即已归位）
   * 【v0.6.2】归位后 cell.type 保持 TARGET，用 placedCount>0 判断已归位
   */
  isItemOnTarget(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    // 已归位态：TARGET 格且 placedCount > 0
    if (cell.type === CellType.TARGET && (cell.placedCount ?? 0) > 0) return true;
    // 兼容老逻辑：ITEM 格上有匹配 targetType
    return cell.type === CellType.ITEM && !!cell.targetType && cell.itemType === cell.targetType;
  }

  /**
   * 物品归位：物品放入目标格后，标记为已归位（不可再移动）
   * 【v0.6.2】归位已在 moveItem 内完成（placedCount+1，cell 保持 TARGET）。
   * 此方法保留供 SceneGame 调用，但实际为空操作 —— 归位计数已在 moveItem 完成。
   */
  lockItem(row: number, col: number): void {
    const cell = this.getCell(row, col);
    if (!cell) return;
    // 归位已在 moveItem 处理：cell.type 已是 TARGET，placedCount 已 +1
    // 这里只做兜底：若 cell 还是 ITEM（老路径），转成 TARGET
    if (cell.type === CellType.ITEM && cell.targetType && cell.itemType === cell.targetType) {
      cell.type = CellType.TARGET;
      cell.placedCount = (cell.placedCount ?? 0) + 1;
    }
  }

  /**
   * 解锁归位物品（撤销用）
   * 【v0.6.2】目标格无限容量：撤销时 placedCount-1，只有归零才把格子恢复为可再拖态。
   * 若 placedCount 仍 >0，目标格保持 TARGET（其他已归位物品还在里面）。
   */
  unlockItem(row: number, col: number, itemType: ItemType): void {
    const cell = this.getCell(row, col);
    if (!cell) return;
    if (cell.type === CellType.TARGET && (cell.placedCount ?? 0) > 0) {
      cell.placedCount = (cell.placedCount ?? 0) - 1;
      if ((cell.placedCount ?? 0) <= 0) {
        // 容量归零：目标格恢复为纯目标格（无物品）
        cell.placedCount = 0;
        cell.itemType = undefined;
        cell.layer = undefined;
        cell.stack = undefined;
        // 保持 cell.type = TARGET，targetType 不变
      }
      // 若 placedCount 仍 >0，目标格保持原样（其他物品还在）
    } else {
      // 兼容老逻辑：cell 是 ITEM 态
      cell.type = CellType.ITEM;
      cell.itemType = itemType;
      cell.layer = 1;
    }
  }

  /**
   * 【v0.6.2】复活物品到指定格子（归位撤销用）
   * 归位时物品"消失"进目标格，撤销时需要把物品放回原位。
   * 此方法把指定格子设为 ITEM 态并放入物品。
   * 若该格原本是目标格/传送门等，保留其 targetType/portalId 等附加属性。
   */
  reviveItem(row: number, col: number, itemType: ItemType, layer: number): void {
    const cell = this.getCell(row, col);
    if (!cell) return;
    cell.type = CellType.ITEM;
    cell.itemType = itemType;
    cell.layer = layer;
    cell.stack = [{ type: itemType, layer }];
    // 保留 targetType / portalId / portalUses / freezeCounter 等附加属性
  }

  /**
   * 暴露下层物品：当顶层物品被移走/归位后
   * 检查同格是否有下层物品，将其 layer 更新
   * 
   * @param row 格子行
   * @param col 格子列
   * @param itemsOnCell 该格子上所有物品的列表（含 layer 信息）
   */
  exposeLowerItem(row: number, col: number, remainingItems: { type: ItemType; layer: number }[]): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    if (remainingItems.length === 0) {
      // 没有剩余物品，恢复原状
      if (cell.targetType) {
        cell.type = CellType.TARGET;
        cell.itemType = undefined;
        cell.layer = undefined;
      } else {
        cell.type = CellType.EMPTY;
        cell.itemType = undefined;
        cell.layer = undefined;
      }
    } else {
      // 还有剩余物品，显示最上层
      cell.type = CellType.ITEM;
      cell.itemType = remainingItems[0].type;
      cell.layer = remainingItems[0].layer;
    }
  }

  /**
   * 克隆当前棋盘状态（用于撤销等场景）
   */
  clone(): Board {
    const board = new Board();
    board.rows = this.rows;
    board.cols = this.cols;
    board.targetPositions = [...this.targetPositions];
    board.grid = this.grid.map(row =>
      row.map(cell => ({ ...cell }))
    );
    return board;
  }
}
