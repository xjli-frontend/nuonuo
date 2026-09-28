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

import { CellData, CellType, ItemType, LevelConfig, ONEWAY_DIR_VECTORS } from '../types/index';
import { GameConfig } from '../config/GameConfig';

/** moveItem 的返回结果 */
export interface MoveResult {
  success: boolean;      // 是否移动成功
  teleported: boolean;    // 是否触发了传送门
  finalRow: number;      // 物品最终所在行（传送后可能和 toRow 不同）
  finalCol: number;      // 物品最终所在列（传送后可能和 toCol 不同）
  /**
   * 【v0.10.9】本次移动是否把物品归位（消进类型匹配的目标格）。
   *
   * 归位后物品已从棋盘上"消失"（不写入 itemType，只 placedCount+1），
   * 因此调用方**必须**用本字段判断归位，不能事后回读格子 type：
   * 同一步内若该目标格上的水洼倒计时归零，tickWaters() 会把整格改成 ICE。
   */
  placed: boolean;
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
  /** 活动门格子坐标列表：方便快速查找 */
  barrierPositions: [number, number][] = [];

  /**
   * 【v0.10.6】"拿起即释放"的临时排除格：玩家按住某格物品拖拽期间，该格在机关结算里
   * 视为**已空**（物品被视作已离开），于是按钮立刻弹起、所连活动门立刻切换为关闭显示。
   * 这样门的表现与逻辑同步，不必等落地才 recalcButtons。
   * 拖拽结束（落地/回弹/撤销/刷新/换关）必须 clearDragPreview()，否则机关态会卡住。
   */
  private dragPreviewCell: { row: number; col: number } | null = null;

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
    // 【v0.10.6】换关兜底：清空上一次残留的拖拽预览格
    this.dragPreviewCell = null;
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

    // 第三步七分之六：放置活动门
    // 默认未激活（关门）= 阻挡通行；被按钮压住时激活（开门）= 可通行
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
    // 水洼是"附加覆盖层"，可叠加在 空格/目标格/传送门/单向门/按钮/活动门上，
    // 也可在物品下方（物品放置时保留 freezeCounter）。
    // - 纯空格 → 变为 WATER 类型
    // - 其他机制格 → 保持原类型，仅附加 freezeCounter（结冰时 freezeCell 会把整格变 ICE，原机制字段保留供破冰锤恢复）
    // - 障碍/冰块上不放水洼（防御性跳过）
    if (config.waters) {
      for (const water of config.waters) {
        const [row, col] = water.pos;
        if (this.isValidCell(row, col)) {
          const cell = this.grid[row][col];
          if (cell.type === CellType.OBSTACLE || cell.type === CellType.ICE) {
            continue;
          }
          if (cell.type === CellType.EMPTY) {
            // 空格变水洼
            cell.type = CellType.WATER;
            cell.freezeCounter = water.freezeIn;
          } else {
            // 目标格/传送门/单向门/按钮/活动门：保留原类型，附加 freezeCounter
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
    // 活动门：仅激活态可通行
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

  // ========== 按钮 / 活动门 ==========

  /** 判断一个格子是否是按钮 */
  isButton(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.BUTTON;
  }

  /** 判断一个格子是否是活动门 */
  isActiveBarrier(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE;
  }

  /** 判断活动门当前是否处于激活态（可通行） */
  isBarrierActive(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return (cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE)
      && cell.barrierActive === true;
  }

  /**
   * 重新结算所有按钮的按下状态，并同步刷新同组活动门的激活态。
   *
   * 【v0.10.8 多对多】按钮与活动门通过共享的 id 组成一个「机关组」：
   *   一组内可以有 x 个按钮 + y 个门（x ≥ 1、y ≥ 1），不再要求一一对应。
   *   组内**任意**一个按钮被物品压住 → 组内**所有**门一起打开（OR 逻辑）。
   *   x=y=1 的老关卡与旧行为完全一致，无需迁移数据。
   *
   * 规则：按钮所在格若有物品停留（cell.type === ITEM 且保留了 buttonId），
   *   即视为按下；否则弹起。按钮按下 → 同组活动门激活（可通行）。
   *
   * 物品移到按钮上时 cell.type 变为 ITEM，但 buttonId 被保留（moveItem 中处理），
   * 因此这里通过 buttonId 字段判断"该格本质是按钮且当前压着物品"。
   * 同理按钮空置时 cell.type === BUTTON。
   */
  recalcButtons(): void {
    // 1. 收集每个机关组当前是否"至少有一个按钮被压住"（组内 OR）
    const pressedByGroup = new Map<number, boolean>();
    for (const [row, col] of this.buttonPositions) {
      const cell = this.getCell(row, col);
      if (!cell || cell.buttonId === undefined) continue;
      // 物品压住按钮：cell.type 变为 ITEM 但 buttonId 保留
      // 【v0.10.6】正被玩家"拿起"（拖拽中）的物品视为已离开本格 → 按钮立即弹起、活动门立即关闭
      const pressed = cell.type === CellType.ITEM && !this.isDragPreviewCell(row, col);
      cell.buttonPressed = pressed;
      // 【v0.10.8】组内只要有一个按钮按下，整组就算已触发（其余按钮弹起也不影响）
      pressedByGroup.set(cell.buttonId, (pressedByGroup.get(cell.buttonId) ?? false) || pressed);
    }
    // 2. 按机关组状态刷新所有活动门（同组的门开/关始终一致）
    for (const [row, col] of this.barrierPositions) {
      const cell = this.getCell(row, col);
      if (!cell || cell.barrierId === undefined) continue;
      cell.barrierActive = pressedByGroup.get(cell.barrierId) === true;
    }
  }

  /**
   * 【v0.10.8】查询某机关组当前是否有按钮处于"被压住"状态（组内 OR）。
   *
   * 供 PathCalculator「拖走压按钮的物品时，该门本步视为关门」的兜底判定使用：
   * 多对多下一个门由多个按钮控制，只要**组内还有别的按钮**被压住，门就应该保持开启。
   *
   * @param groupId 机关组 id（即 buttonId / barrierId）
   * @param ignoreCell 可选：把这格视为"已空"（通常传本次拖拽的起点格）
   */
  isButtonGroupPressed(groupId: number, ignoreCell?: { row: number; col: number }): boolean {
    for (const [row, col] of this.buttonPositions) {
      if (ignoreCell && ignoreCell.row === row && ignoreCell.col === col) continue;
      if (this.isDragPreviewCell(row, col)) continue;
      const cell = this.getCell(row, col);
      if (!cell || cell.buttonId !== groupId) continue;
      if (cell.type === CellType.ITEM) return true;
    }
    return false;
  }

  /**
   * 【v0.10.6】拿起物品（开始拖拽）时调用：把该格标记为"已释放"，
   * 随后 recalcButtons() 会立刻让按钮弹起、所连活动门关闭。
   * 仅影响机关结算，不改动棋盘数据本身（物品仍在原格，落地时才真正移动）。
   */
  setDragPreview(row: number, col: number): void {
    this.dragPreviewCell = { row, col };
  }

  /** 【v0.10.6】拖拽结束/中断时调用（调用后记得 recalcButtons 结算真实状态） */
  clearDragPreview(): void {
    this.dragPreviewCell = null;
  }

  /** 该格是否正处于"拿起即释放"的拖拽预览中 */
  private isDragPreviewCell(row: number, col: number): boolean {
    return this.dragPreviewCell !== null
      && this.dragPreviewCell.row === row
      && this.dragPreviewCell.col === col;
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
      // freezeCounter === undefined 表示该水洼已结算（已结冰 / 已随物品冻结 / 已归位格失效）
      if (!cell || cell.freezeCounter === undefined) continue;

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
   * 水洼倒计时归零：结算该格
   *
   * 【v0.10.2】格子上有未归位物品时，**物品当场被冰封**（不再延迟到物品移开时）：
   * - 格子保持 ITEM，置 `frozen = true`，清空 freezeCounter（倒计时结束）
   * - 被冰封物品不可拖动、不可作为堆叠目标，需破冰锤解冻（或撤销回到冻结前）
   * - 底层机制字段（portalId/onewayDir/buttonId/barrierId/targetType）原样保留，
   *   解冻后物品移走时机制照常重现
   *
   * 【v0.10.3 行为变更】目标格**一律**参与结冰，不再因"已归位过物品"而豁免：
   * - 已归位的进度（cell.placedCount / item.placed / gameState.itemsPlaced）原样保留，通关判定不受影响
   * - 但格子变 ICE 被封死 → 该目标格无法再接收后续归位物品，需破冰锤敲开（或撤销）才能继续使用
   * - 修正前的问题：玩家抢先把物品归位（如 34 关 [4,2] 苹果就在隔壁）→ 水洼当场失效、
   *   倒计时无声消失，水洼对该目标格完全形同虚设
   *
   * 其他规则：
   * - 无物品的格（空格/目标格/水洼/传送门/单向门/按钮/活动门）→ 整格变 ICE（永久障碍物）
   */
  private freezeCell(row: number, col: number): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    // 【v0.10.2】格子上有未归位物品 → 物品当场被冰封
    if (cell.type === CellType.ITEM) {
      cell.frozen = true;
      cell.freezeCounter = undefined;
      return;
    }

    // 其他情况（含已归位的目标格）直接变冰块：
    // targetType / placedCount 等字段原样保留，破冰锤敲开即可恢复目标格与已有归位进度
    cell.type = CellType.ICE;
    cell.freezeCounter = undefined;
  }

  /** 判断一个格子是否是冰块 */
  isIce(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ICE;
  }

  /** 【v0.10.2】判断某个格子上的物品是否被冰封（水洼倒计时归零时当场冻结） */
  isFrozen(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ITEM && cell.frozen === true;
  }

  /** 【v0.10.2】破冰锤可敲的目标：整格冰块(ICE) 或 被冰封的物品格 */
  canBreakIce(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;
    return cell.type === CellType.ICE || (cell.type === CellType.ITEM && cell.frozen === true);
  }

  /** 本关当前是否存在可被破冰锤敲碎的目标（可见冰块 或 被冰封物品） */
  hasAnyIce(): boolean {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.canBreakIce(r, c)) return true;
      }
    }
    return false;
  }

  /**
   * 破冰锤：敲碎冰块 / 解冻被冰封的物品。
   *
   * - 被冰封的物品格（ITEM + frozen）：解冻，物品留在原格恢复可拖动，底层机制字段原样保留
   * - 整格冰块（ICE）：恢复其结冰前的原机制。结冰时（freezeCell）只把 type 改为 ICE，
   *   原机制字段（portalId/onewayDir/buttonId/barrierId/barrierKind/targetType）都被保留，
   *   这里按优先级恢复：传送门 > 单向门 > 按钮 > 活动门 > 目标格 > 空格
   *
   * @returns 是否成功（目标既不是冰块也不是冰封物品时返回 false，不消耗道具）
   */
  breakIce(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return false;

    // 【v0.10.2】被冰封的物品：解冻（物品保留在格子上，机制字段不动）
    if (cell.type === CellType.ITEM && cell.frozen === true) {
      cell.frozen = undefined;
      return true;
    }

    if (cell.type !== CellType.ICE) return false;

    if (cell.portalId !== undefined) {
      cell.type = CellType.PORTAL;
    } else if (cell.onewayDir !== undefined) {
      cell.type = CellType.ONEWAY;
    } else if (cell.buttonId !== undefined) {
      cell.type = CellType.BUTTON;
      cell.buttonPressed = false;
    } else if (cell.barrierId !== undefined) {
      cell.type = cell.barrierKind === 'wall' ? CellType.ACTIVE_WALL : CellType.ACTIVE_BRIDGE;
      cell.barrierActive = false;
    } else if (cell.targetType !== undefined) {
      // 【v0.10.3】恢复目标格：保留已有归位进度（已归位过的目标格被冰封时 placedCount>0）
      cell.type = CellType.TARGET;
      if (cell.placedCount === undefined) cell.placedCount = 0;
    } else {
      cell.type = CellType.EMPTY;
    }
    cell.freezeCounter = undefined;
    return true;
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
   * 活动门未激活时视为障碍物（激活后可通行）
   * 冰块（ICE）是永久障碍物，也视为障碍物
   */
  isObstacle(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell) return true; // 越界视为障碍物
    if (cell.type === CellType.OBSTACLE) return true;
    if (cell.type === CellType.ICE) return true;
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
    if (cell.frozen) return false; // 【v0.10.2】被冰封的物品不可拖动（需破冰锤解冻）
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
      placed: false,
    };

    const fromCell = this.getCell(fromRow, fromCol);
    let toCell = this.getCell(toRow, toCol);

    // 验证：起始格必须有物品
    if (!fromCell || fromCell.type !== CellType.ITEM) return result;
    // 【v0.10.2】被冰封的物品不可移动（需先用破冰锤解冻）
    if (fromCell.frozen) return result;
    // 验证：目标格必须可达（空格/目标格/传送门/水洼/单向门/按钮）
    // 注意：单向门的进入方向限制由 PathCalculator 在可达性计算时把关，这里只校验格子类型
    // 【v0.10.6】活动门不再作为落点：门是"通道"不是"停车位"，
    // 一旦允许停留，按钮释放后就会出现"物品压在关着的门上"的非法状态
    // （可达性侧同步见 PathCalculator.calculateReachable）
    const isReachableDest = (t: CellType) =>
      t === CellType.EMPTY || t === CellType.TARGET || t === CellType.PORTAL
      || t === CellType.WATER || t === CellType.ONEWAY || t === CellType.BUTTON;
    // 【v0.8.9/A】已有物品的格子：仅当堆叠未满 MAX_STACK_LAYERS 时可作为目的地
    // （撤销放回堆叠格；普通拖拽已被 PathCalculator 过滤，玩家不会直接落到物品格上）
    // 【v0.10.2】被冰封的物品格不可作为堆叠目的地（冰面封死）
    const isStackableDest =
      !!toCell && toCell.type === CellType.ITEM && !toCell.frozen
      && (toCell.stack?.length ?? 1) < GameConfig.MAX_STACK_LAYERS;
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
      // 【v0.8.8/B】落点 = 可合法放置物品的格子（EMPTY/TARGET/WATER/ONEWAY/BUTTON），
      // 含目标格（传送后可直接归位消除）；但排除：障碍/活动门（【v0.10.6】门是通道，不可停留）、越界、以及任何传送门（避免无限传送）。
      // 【v0.8.9/A】出口落点若已有物品且堆叠未满 MAX_STACK_LAYERS，允许直接堆叠上去（方案 A：传送门出口堆叠特例）
      // 【bug 修复】落点若是单向门（含被物品压住、onewayDir 仍保留的单向门底格），
      // 必须校验"钻出方向 == 门箭头方向"，否则视为不可达、阻止传送。
      // 旧实现把 ONEWAY 直接纳入 isReachableDest，导致传送门绕过单向门的方向限制。
      const isLandingOnewayOk =
        landCell?.onewayDir === undefined ||
        (ONEWAY_DIR_VECTORS[landCell.onewayDir][0] === dirRow &&
          ONEWAY_DIR_VECTORS[landCell.onewayDir][1] === dirCol);
      // 【v0.10.2】被冰封的物品格不能作为传送落点堆叠目标
      const isLandingStackable =
        landCell?.type === CellType.ITEM && !landCell.frozen
        && (landCell.stack?.length ?? 1) < GameConfig.MAX_STACK_LAYERS;
      const isLandingValid =
        !!landCell &&
        !this.isObstacle(landRow, landCol) &&
        (isReachableDest(landCell.type) || isLandingStackable) &&
        landCell.type !== CellType.PORTAL &&
        isLandingOnewayOk;
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
    // 保存起始格的水洼倒计时（>0 = 未结冰，物品移走后保留；被冰封的物品已被上面拦截，不会走到这里）
    const fromFreezeCounter = fromCell.freezeCounter;
    // 保存起始格的单向门方向（物品移走后需要恢复为单向门）
    const fromOnewayDir = fromCell.onewayDir;
    // 保存起始格的按钮信息（物品移走后需要恢复为按钮）
    const fromButtonId = fromCell.buttonId;
    // 保存起始格的活动门信息（物品移走后需要恢复为活动门）
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
    // 保存目标格的活动门信息（物品放上去后需要保留）
    const toBarrierId = toCell.barrierId;
    const toBarrierKind = toCell.barrierKind;

    if (isPlacingMove) {
      // 归位：物品消失进目标格，目标格保持 TARGET，容量 +1
      toCell.type = CellType.TARGET;
      toCell.placedCount = (toCell.placedCount ?? 0) + 1;
      // 【v0.10.9】把"已归位"作为结果返回：调用方据此记账并播放归位反馈，
      // 不再事后回读格子 type（同一步内水洼结冰会把该格改成 ICE → 漏记归位）
      result.placed = true;
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
      // 非归位：物品留在目标格上（类型不匹配，或落到空格/传送门出口空格/按钮/活动门）
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
      // 【v0.10.2】解除冰封标记兜底（被冰封物品已在 moveItem 入口拦截，正常不会走到这里）
      fromCell.frozen = undefined;

      if (fromPortalId !== undefined) {
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
        // 原本是活动门，恢复为对应类型（激活态稍后由 recalcButtons 统一结算）
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

      // 恢复水洼倒计时：未结算（>0）的倒计时保留；undefined = 无水洼 / 已结算（结冰或已随物品冻结）
      if (fromFreezeCounter !== undefined && fromFreezeCounter > 0) {
        fromCell.freezeCounter = fromFreezeCounter;
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

  /**
   * 深拷贝当前棋盘网格（快照式撤销用）。
   * 注意：必须深拷贝 stack 数组，否则撤销恢复时会和后续操作共享引用导致数据错乱。
   */
  snapshot(): CellData[][] {
    return this.grid.map(row => row.map(cell => this.cloneCell(cell)));
  }

  /**
   * 用快照恢复棋盘网格（快照式撤销用）。
   * 恢复后所有格子的状态（传送门次数 portalUses、水洼倒计时/冰块 freezeCounter、
   * 按钮/活动门态、堆叠 stack 等）都会回到快照时刻。
   */
  restore(grid: CellData[][]): void {
    // 【v0.10.6】撤销兜底：快照不含拖拽预览态，恢复时一并清空
    this.dragPreviewCell = null;
    this.grid = grid.map(row => row.map(cell => this.cloneCell(cell)));
  }

  /** 深拷贝单个格子（含 stack 数组） */
  private cloneCell(cell: CellData): CellData {
    const copy: CellData = { ...cell };
    if (cell.stack) {
      copy.stack = cell.stack.map(s => ({ ...s }));
    }
    return copy;
  }
}
