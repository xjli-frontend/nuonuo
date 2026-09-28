/**
 * 全局游戏状态管理
 * 
 * 【通俗说明】这是游戏的"记事本"。
 * 
 * 记录当前游戏运行时的所有关键数据：
 * - 当前在第几关
 * - 解锁到第几关
 * - 音效开还是关
 * - 这关走了多少步
 * - 等等...
 * 
 * 和 EventCenter 配合：状态变化时可以发事件通知其他模块。
 */

import { GameStateData, MoveRecord, GameEvent } from '../types/index';
import { eventCenter } from './EventCenter';
import { GameConfig } from '../config/GameConfig';
import { getStorageAdapter } from './Storage';

export class GameState {
  private static instance: GameState;

  /** 游戏状态数据 */
  private data: GameStateData;

  private constructor() {
    // 初始化默认状态
    this.data = {
      currentLevel: 1,
      maxUnlockedLevel: 1,  // 第一关默认解锁
      musicEnabled: true,   // 背景音乐开关
      sfxEnabled: true,     // 音效开关
      vibrationEnabled: true, // 震动开关
      tapMode: false,       // 【v0.13.3】操作模式：false=长按拖动（默认）/ true=点击选择
      soundEnabled: true,   // 旧版统一开关（仅存档兼容）
      moveCount: 0,
      itemsPlaced: 0,
      totalItems: 0,
      isPaused: false,
      moveHistory: [],
      refreshesUsed: 0,
      maxRefreshes: 3,
      stepsUsed: 0,
      maxSteps: null,
      undoItems: GameConfig.INITIAL_ITEMS.undo,
      refreshItems: GameConfig.INITIAL_ITEMS.refresh,
      hammerItems: GameConfig.INITIAL_ITEMS.hammer,
      // 【已停用·提示道具 2026-09-20】提示功能整体下线
      // hintItems: GameConfig.INITIAL_ITEMS.hint,
      levelRefreshSpent: 0,
      coins: GameConfig.INITIAL_COINS,
      coinRewardedLevels: [],
      coinInitGranted: true,   // 新玩家：初始金币已随上面一行发放完毕
      stepRescueUsed: 0,
      maxStepRescue: GameConfig.STEP_RESCUE_COSTS.length,
      adUndoUsed: 0,
      adUndoMax: GameConfig.AD_LIMITS.undo,
      adRefreshUsed: 0,
      adRefreshMax: GameConfig.AD_LIMITS.refresh,
      adHammerUsed: 0,
      adHammerMax: GameConfig.AD_LIMITS.hammer,
      // 【已停用·提示道具 2026-09-20】
      // adHintUsed: 0,
      // adHintMax: GameConfig.AD_LIMITS.hint,
    };
    // 从本地存储加载数据（如果有的话）
    this.loadFromStorage();
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  // ========== 读取方法 ==========

  /** 获取当前关卡编号 */
  get currentLevel(): number { return this.data.currentLevel; }

  /** 获取已解锁最高关卡 */
  get maxUnlockedLevel(): number { return this.data.maxUnlockedLevel; }

  /** 背景音乐是否开启 */
  get musicEnabled(): boolean { return this.data.musicEnabled; }

  /** 音效是否开启 */
  get sfxEnabled(): boolean { return this.data.sfxEnabled; }

  /** 震动是否开启 */
  get vibrationEnabled(): boolean { return this.data.vibrationEnabled; }

  /**
   * 【v0.13.3】操作模式：false = 长按拖动（默认）/ true = 点击选择
   * 点击模式：点一下物品拿起 → 再点目标格放下
   */
  get tapMode(): boolean { return this.data.tapMode; }

  /** 【兼容】旧版统一开关：音乐与音效同时开启才为 true */
  get soundEnabled(): boolean { return this.data.musicEnabled && this.data.sfxEnabled; }

  /** 当前关卡移动次数 */
  get moveCount(): number { return this.data.moveCount; }

  /** 当前关卡已归位物品数 */
  get itemsPlaced(): number { return this.data.itemsPlaced; }

  /** 当前关卡物品总数 */
  get totalItems(): number { return this.data.totalItems; }

  /** 是否暂停 */
  get isPaused(): boolean { return this.data.isPaused; }

  /** 移动历史（用于撤销） */
  get moveHistory(): MoveRecord[] { return this.data.moveHistory; }

  /** 已用刷新次数 */
  get refreshesUsed(): number { return this.data.refreshesUsed; }

  /** 刷新次数上限 */
  get maxRefreshes(): number { return this.data.maxRefreshes; }

  /** 剩余刷新次数 */
  get refreshesLeft(): number { return this.data.maxRefreshes - this.data.refreshesUsed; }

  /** 【步数限制】已用步数 */
  get stepsUsed(): number { return this.data.stepsUsed; }

  /** 【步数限制】步数上限（null=无限制） */
  get maxSteps(): number | null { return this.data.maxSteps; }

  /** 【步数限制】剩余步数（无限制时返回 Infinity） */
  get stepsLeft(): number {
    if (this.data.maxSteps === null) return Infinity;
    return Math.max(0, this.data.maxSteps - this.data.stepsUsed);
  }

  /** 【每日奖励】全局撤回道具数量 */
  get undoItems(): number { return this.data.undoItems; }

  /** 【每日奖励】全局刷新道具数量 */
  get refreshItems(): number { return this.data.refreshItems; }

  /** 【破冰锤】全局破冰锤道具数量 */
  get hammerItems(): number { return this.data.hammerItems; }

  // 【已停用·提示道具 2026-09-20】提示功能整体下线，以下读数一并注释
  // /** 【提示】全局提示道具数量（跨关卡） */
  // get hintItems(): number { return this.data.hintItems; }

  /** 【每日奖励】本关消耗的刷新道具数（结算统计用） */
  get levelRefreshSpent(): number { return this.data.levelRefreshSpent; }

  /** 【货币·金币】当前持有金币 */
  get coins(): number { return this.data.coins; }

  /** 【步数续命】本关已用金币买步数的次数 */
  get stepRescueUsed(): number { return this.data.stepRescueUsed; }

  /** 【步数续命】本关可买步数的次数上限（= GameConfig.STEP_RESCUE_COSTS.length） */
  get maxStepRescue(): number { return this.data.maxStepRescue; }

  /** 【步数续命】本关剩余可买步数次数 */
  get stepRescueLeft(): number {
    return Math.max(0, this.data.maxStepRescue - this.data.stepRescueUsed);
  }

  /** 【步数续命】本关是否还能用金币买步数（无步数限制的关卡恒为 false） */
  get canRescueSteps(): boolean {
    return this.data.maxSteps !== null && this.stepRescueLeft > 0;
  }

  /**
   * 【步数续命】下一次购买步数需要的金币。
   * 次数用尽时返回最后一次的价格（仅用于文案展示，能否购买请判断 canRescueSteps）。
   */
  get nextStepRescueCost(): number {
    const costs = GameConfig.STEP_RESCUE_COSTS;
    return costs[Math.min(this.data.stepRescueUsed, costs.length - 1)] ?? 0;
  }

  /** 【广告续命】本关已看广告换撤销道具次数 */
  get adUndoUsed(): number { return this.data.adUndoUsed; }

  /** 【广告续命】本关可看广告换撤销道具上限 */
  get adUndoMax(): number { return this.data.adUndoMax; }

  /** 【广告续命】本关剩余可看广告换撤销道具次数 */
  get adUndoLeft(): number {
    return Math.max(0, this.data.adUndoMax - this.data.adUndoUsed);
  }

  /** 【广告续命】本关是否还能看广告换撤销道具 */
  get hasAdUndoLeft(): boolean {
    return this.adUndoLeft > 0;
  }

  /** 【广告续命】本关已看广告换刷新道具次数 */
  get adRefreshUsed(): number { return this.data.adRefreshUsed; }

  /** 【广告续命】本关可看广告换刷新道具上限 */
  get adRefreshMax(): number { return this.data.adRefreshMax; }

  /** 【广告续命】本关剩余可看广告换刷新道具次数 */
  get adRefreshLeft(): number {
    return Math.max(0, this.data.adRefreshMax - this.data.adRefreshUsed);
  }

  /** 【广告续命】本关是否还能看广告换刷新道具 */
  get hasAdRefreshLeft(): boolean {
    return this.adRefreshLeft > 0;
  }

  /** 【广告续命】本关已看广告换破冰锤次数 */
  get adHammerUsed(): number { return this.data.adHammerUsed; }

  /** 【广告续命】本关可看广告换破冰锤上限 */
  get adHammerMax(): number { return this.data.adHammerMax; }

  /** 【广告续命】本关剩余可看广告换破冰锤次数 */
  get adHammerLeft(): number {
    return Math.max(0, this.data.adHammerMax - this.data.adHammerUsed);
  }

  /** 【广告续命】本关是否还能看广告换破冰锤 */
  get hasAdHammerLeft(): boolean {
    return this.adHammerLeft > 0;
  }

  // 【已停用·提示道具 2026-09-20】提示广告换取次数相关读数一并注释
  // /** 【广告续命】本关已看广告换提示道具次数 */
  // get adHintUsed(): number { return this.data.adHintUsed; }
  //
  // /** 【广告续命】本关可看广告换提示道具上限 */
  // get adHintMax(): number { return this.data.adHintMax; }
  //
  // /** 【广告续命】本关剩余可看广告换提示道具次数 */
  // get adHintLeft(): number {
  //   return Math.max(0, this.data.adHintMax - this.data.adHintUsed);
  // }
  //
  // /** 【广告续命】本关是否还能看广告换提示道具 */
  // get hasAdHintLeft(): boolean {
  //   return this.adHintLeft > 0;
  // }

  // ========== 写入方法 ==========

  /**
   * 设置当前关卡
   * @param level 关卡编号
   */
  setLevel(level: number): void {
    this.data.currentLevel = level;
    this.resetLevelState();
  }

  /**
   * 解锁新关卡（通关后调用）
   * @param level 新解锁的关卡编号
   */
  unlockLevel(level: number): void {
    if (level > this.data.maxUnlockedLevel) {
      this.data.maxUnlockedLevel = level;
      this.saveToStorage();
    }
  }

  /** 切换背景音乐开关 */
  toggleMusic(): void {
    this.data.musicEnabled = !this.data.musicEnabled;
    this.data.soundEnabled = this.data.musicEnabled && this.data.sfxEnabled;
    this.saveToStorage();
    // 音频状态同步由宿主层负责（核心包无 AudioManager）
  }

  /** 切换音效开关 */
  toggleSfx(): void {
    this.data.sfxEnabled = !this.data.sfxEnabled;
    this.data.soundEnabled = this.data.musicEnabled && this.data.sfxEnabled;
    this.saveToStorage();
    // 音频状态同步由宿主层负责（核心包无 AudioManager）
  }

  /** 切换震动开关 */
  toggleVibration(): void {
    this.data.vibrationEnabled = !this.data.vibrationEnabled;
    this.saveToStorage();
  }

  /**
   * 【v0.13.3】切换操作模式（长按拖动 ⇄ 点击选择）
   * 立即落盘：这是玩家偏好，下次进入游戏要记住
   */
  toggleTapMode(): void {
    this.data.tapMode = !this.data.tapMode;
    this.saveToStorage();
  }

  /** 【兼容】旧版统一开关：同时切换音乐与音效 */
  toggleSound(): void {
    const next = !(this.data.musicEnabled && this.data.sfxEnabled);
    this.data.musicEnabled = next;
    this.data.sfxEnabled = next;
    this.data.soundEnabled = next;
    this.saveToStorage();
    // 音频状态同步由宿主层负责（核心包无 AudioManager）
  }

  /** 记录一次移动 */
  useMove(): void {
    this.data.moveCount++;
    this.data.stepsUsed++;
  }

  /** 【步数限制】检查步数是否耗尽（在通关检查之后调用，避免最后一步通关误判失败） */
  isStepLimitReached(): boolean {
    return this.data.maxSteps !== null && this.data.stepsUsed >= this.data.maxSteps;
  }

  /** 【步数限制】增加步数（加步道具/续命用） */
  addSteps(n: number): void {
    if (this.data.maxSteps !== null) {
      this.data.maxSteps += n;
    }
  }

  /** 【步数限制】设置步数上限（从关卡配置读取） */
  setMaxSteps(max: number | null): void {
    this.data.maxSteps = max;
  }

  /** 物品归位 */
  placeItem(): void {
    this.data.itemsPlaced++;
  }

  /** 物品取消归位（撤销用） */
  unplaceItem(): void {
    this.data.itemsPlaced--;
  }

  /** 设置物品总数 */
  setTotalItems(total: number): void {
    this.data.totalItems = total;
  }

  /** 设置刷新次数上限 */
  setMaxRefreshes(max: number): void {
    this.data.maxRefreshes = max;
  }

  /** 使用一次刷新 */
  useRefresh(): void {
    this.data.refreshesUsed++;
  }

  /** 是否还能刷新 */
  canRefresh(): boolean {
    return this.data.refreshesUsed < this.data.maxRefreshes;
  }

  // ========== 全局道具（每日奖励等来源） ==========

  /** 增加全局撤回道具 */
  addUndoItems(n: number): void {
    this.data.undoItems += n;
    this.saveToStorage();
  }

  /** 增加全局刷新道具 */
  addRefreshItems(n: number): void {
    this.data.refreshItems += n;
    this.saveToStorage();
  }

  /** 消耗一个全局撤回道具（成功返回 true） */
  useUndoItem(): boolean {
    if (this.data.undoItems <= 0) return false;
    this.data.undoItems--;
    this.saveToStorage();
    return true;
  }

  /** 消耗一个全局刷新道具（成功返回 true） */
  useRefreshItem(): boolean {
    if (this.data.refreshItems <= 0) return false;
    this.data.refreshItems--;
    this.data.levelRefreshSpent++; // 统计本关消耗（结算页展示）
    this.saveToStorage();
    return true;
  }

  // 【已停用·提示道具 2026-09-20】提示道具的增减入口一并注释
  // /** 增加全局提示道具（v0.12.0 提示替换刷新入口） */
  // addHintItems(n: number): void {
  //   this.data.hintItems += n;
  //   this.saveToStorage();
  // }
  //
  // /** 消耗一个全局提示道具（成功返回 true） */
  // useHintItem(): boolean {
  //   if (this.data.hintItems <= 0) return false;
  //   this.data.hintItems--;
  //   this.saveToStorage();
  //   return true;
  // }

  /** 增加全局破冰锤道具 */
  addHammerItems(n: number): void {
    this.data.hammerItems += n;
    this.saveToStorage();
  }

  /** 消耗一个全局破冰锤道具（成功返回 true） */
  useHammerItem(): boolean {
    if (this.data.hammerItems <= 0) return false;
    this.data.hammerItems--;
    this.saveToStorage();
    return true;
  }

  /** 【货币·金币】增加金币（通关奖励/广告翻倍等），立即写入存档 */
  addCoins(n: number): void {
    if (n <= 0) return;
    this.data.coins += n;
    this.saveToStorage();
  }

  /** 【货币·金币】金币是否足够支付 amount */
  canAfford(amount: number): boolean {
    return this.data.coins >= amount;
  }

  /**
   * 【货币·金币】扣除金币。
   * @returns true=扣费成功；false=金币不足（不扣除任何金币，调用方应先判断）
   */
  spendCoins(amount: number): boolean {
    if (amount <= 0) return true;
    if (!this.canAfford(amount)) return false;
    this.data.coins -= amount;
    this.saveToStorage();
    return true;
  }

  /** 【货币·金币】该关是否已发放过通关金币（首次通关才发，防重复刷） */
  hasCoinRewardFor(level: number): boolean {
    return this.data.coinRewardedLevels.includes(level);
  }

  /** 【货币·金币】登记"该关通关金币已发放" */
  markCoinReward(level: number): void {
    if (!this.hasCoinRewardFor(level)) {
      this.data.coinRewardedLevels.push(level);
      this.saveToStorage();
    }
  }

  /** 【步数续命】记录一次金币买步数（调用前应先判断 canRescueSteps 且已扣费） */
  recordStepRescue(): void {
    if (this.data.stepRescueUsed < this.data.maxStepRescue) {
      this.data.stepRescueUsed++;
    }
  }

  /** 【步数续命】设置本关可买步数次数上限（默认见 GameConfig.STEP_RESCUE_COSTS） */
  setMaxStepRescue(max: number): void {
    this.data.maxStepRescue = Math.max(0, max);
  }

  /** 【广告续命】记录一次看广告换撤销道具（调用前应先判断 hasAdUndoLeft） */
  recordAdUndo(): void {
    if (this.data.adUndoUsed < this.data.adUndoMax) {
      this.data.adUndoUsed++;
    }
  }

  /** 【广告续命】记录一次看广告换刷新道具（调用前应先判断 hasAdRefreshLeft） */
  recordAdRefresh(): void {
    if (this.data.adRefreshUsed < this.data.adRefreshMax) {
      this.data.adRefreshUsed++;
    }
  }

  /** 【广告续命】记录一次看广告换破冰锤（调用前应先判断 hasAdHammerLeft） */
  recordAdHammer(): void {
    if (this.data.adHammerUsed < this.data.adHammerMax) {
      this.data.adHammerUsed++;
    }
  }

  // 【已停用·提示道具 2026-09-20】提示广告次数记录一并注释
  // /** 【广告续命】记录一次看广告换提示道具（调用前应先判断 hasAdHintLeft） */
  // recordAdHint(): void {
  //   if (this.data.adHintUsed < this.data.adHintMax) {
  //     this.data.adHintUsed++;
  //   }
  // }

  /** 暂停 */
  pause(): void {
    this.data.isPaused = true;
  }

  /** 继续 */
  resume(): void {
    this.data.isPaused = false;
  }

  /** 记录一次移动（用于撤销），超过上限丢弃最旧快照，避免内存无限累积 */
  pushMove(record: MoveRecord): void {
    this.data.moveHistory.push(record);
    const max = GameConfig.MAX_UNDO_HISTORY;
    if (this.data.moveHistory.length > max) {
      this.data.moveHistory.splice(0, this.data.moveHistory.length - max);
    }
  }

  /** 清空移动历史（刷新/换关等场景，释放快照内存） */
  clearMoveHistory(): void {
    this.data.moveHistory = [];
  }

  /** 恢复本关移动相关计数（撤销用） */
  restoreMoveState(moveCount: number, stepsUsed: number, itemsPlaced: number): void {
    this.data.moveCount = moveCount;
    this.data.stepsUsed = stepsUsed;
    this.data.itemsPlaced = itemsPlaced;
  }

  /** 弹出最后一次移动记录 */
  popMove(): MoveRecord | undefined {
    return this.data.moveHistory.pop();
  }

  /** 是否有可撤销的移动历史 */
  get hasMoveHistory(): boolean {
    return this.data.moveHistory.length > 0;
  }

  /**
   * 重置关卡相关状态（新关卡开始时调用）
   */
  resetLevelState(): void {
    this.data.moveCount = 0;
    this.data.itemsPlaced = 0;
    this.data.totalItems = 0;
    this.data.isPaused = false;
    this.data.moveHistory = [];
    this.data.refreshesUsed = 0;
    this.data.levelRefreshSpent = 0;
    this.data.maxRefreshes = 3;
    this.data.stepsUsed = 0;
    this.data.maxSteps = null;
    this.data.stepRescueUsed = 0;
    this.data.maxStepRescue = GameConfig.STEP_RESCUE_COSTS.length;
    this.data.adUndoUsed = 0;
    this.data.adUndoMax = GameConfig.AD_LIMITS.undo;
    this.data.adRefreshUsed = 0;
    this.data.adRefreshMax = GameConfig.AD_LIMITS.refresh;
    this.data.adHammerUsed = 0;
    this.data.adHammerMax = GameConfig.AD_LIMITS.hammer;
    // 【已停用·提示道具 2026-09-20】
    // this.data.adHintUsed = 0;
    // this.data.adHintMax = GameConfig.AD_LIMITS.hint;
  }

  /** 【选关流程】把解锁进度设为指定关卡；只增不减（重玩低关卡不拉低进度；重进游戏从最高解锁关续玩） */
  setUnlockedLevel(level: number): void {
    if (level > this.data.maxUnlockedLevel) {
      this.data.maxUnlockedLevel = level;
      this.saveToStorage();
    }
  }

  /**
   * 重新读取存档。
   * 构造器里已读一次，但宿主环境的模块求值顺序不保证存储适配器已注入
   * （GameState 可能早于宿主的存储注入模块被求值，读到内存空存档）；
   * 宿主 boot 时再显式调用一次即可兜底（见 NuonuoApp.boot）。
   */
  reload(): void {
    this.loadFromStorage();
  }
  // ========== 本地存储 ==========

  /**
   * 从存储适配器加载存档（浏览器=localStorage，微信/Cocos=sys.localStorage，由宿主注入）
   * 只存不随关卡变化的数据（解锁进度、设置等）
   */
  private loadFromStorage(): void {
    try {
      const saved = getStorageAdapter().getItem('nuonuo_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data.maxUnlockedLevel = parsed.maxUnlockedLevel ?? 1;
        // 【v0.9.0 存档兼容】老存档只有统一的 soundEnabled，
        // 迁移规则：优先读新的 musicEnabled/sfxEnabled，缺失则用老字段，都缺失则默认开启
        this.data.musicEnabled = parsed.musicEnabled ?? parsed.soundEnabled ?? true;
        this.data.sfxEnabled = parsed.sfxEnabled ?? parsed.soundEnabled ?? true;
        this.data.vibrationEnabled = parsed.vibrationEnabled ?? true;
        // 【v0.13.3】操作模式：老存档无该字段 → 默认长按拖动（false）
        this.data.tapMode = parsed.tapMode ?? false;
        this.data.soundEnabled = this.data.musicEnabled && this.data.sfxEnabled;
        // 存档中无道具字段（新玩家/老版本存档）时，发放初始道具；已有值则尊重存档
        this.data.undoItems = parsed.undoItems ?? GameConfig.INITIAL_ITEMS.undo;
        this.data.refreshItems = parsed.refreshItems ?? GameConfig.INITIAL_ITEMS.refresh;
        this.data.hammerItems = parsed.hammerItems ?? GameConfig.INITIAL_ITEMS.hammer;
        // 【已停用·提示道具 2026-09-20】不再从存档读取提示道具（旧存档该字段直接忽略）
        // this.data.hintItems = parsed.hintItems ?? GameConfig.INITIAL_ITEMS.hint;
        // 【v0.13.0 货币】已发奖关卡列表
        this.data.coinRewardedLevels = Array.isArray(parsed.coinRewardedLevels)
          ? parsed.coinRewardedLevels
          : [];
        // 【v0.13.1 货币】新手金币只发一次，用 coinInitGranted 标记：
        // - 标记存在 → 完全尊重存档余额（玩家花掉的金币不会被重新补上）
        // - 标记缺失（v0.13.1 之前的老存档，当时 INITIAL_COINS=0）→ 在原有余额上补发一次新手金币
        if (parsed.coinInitGranted) {
          this.data.coins = parsed.coins ?? 0;
        } else {
          this.data.coins = (parsed.coins ?? 0) + GameConfig.INITIAL_COINS;
          this.data.coinInitGranted = true;
          console.log(`[GameState] 老存档补发新手金币 +${GameConfig.INITIAL_COINS}（当前余额 ${this.data.coins}）`);
          // 立刻落盘：否则玩家若没触发任何存档就退出，下次进入会再补发一次
          this.saveToStorage();
        }
      }
    } catch (e) {
      // 存储不可用时静默失败（如宿主未注入适配器）
      console.warn('[GameState] 读取存档失败:', e);
    }
  }

  /** 保存存档到存储适配器 */
  private saveToStorage(): void {
    try {
      getStorageAdapter().setItem('nuonuo_save', JSON.stringify({
        maxUnlockedLevel: this.data.maxUnlockedLevel,
        musicEnabled: this.data.musicEnabled,
        sfxEnabled: this.data.sfxEnabled,
        vibrationEnabled: this.data.vibrationEnabled,
        tapMode: this.data.tapMode, // 【v0.13.3】操作模式偏好（长按拖动 / 点击选择）
        soundEnabled: this.data.soundEnabled, // 保留旧字段，便于回退到旧版本
        undoItems: this.data.undoItems,
        refreshItems: this.data.refreshItems,
        hammerItems: this.data.hammerItems,
        // 【已停用·提示道具 2026-09-20】不再写入提示道具
        // hintItems: this.data.hintItems,
        coins: this.data.coins,
        coinRewardedLevels: this.data.coinRewardedLevels,
        coinInitGranted: this.data.coinInitGranted,
      }));
    } catch (e) {
      console.warn('[GameState] 保存存档失败:', e);
    }
  }
}

export const gameState = GameState.getInstance();
