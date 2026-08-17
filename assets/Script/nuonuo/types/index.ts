/**
 * 全局类型定义文件
 * 
 * 【通俗说明】这个文件定义整个游戏里用到的"模板"。
 * 比如 "一个格子是什么类型"、"一个物品长什么样"，
 * 后面所有代码都按这些模板来写，保证统一不出错。
 */

// ========== 格子类型枚举 ==========
// 棋盘上每个格子属于以下十种之一
export enum CellType {
  EMPTY = 'empty',         // 纯空格：无任何物体，用于移动缓冲
  OBSTACLE = 'obstacle',   // 障碍物：固定不可交互的木块
  ITEM = 'item',           // 物品格：有物品占据的格子
  TARGET = 'target',       // 目标格：有虚线框，等待物品归位
  PORTAL = 'portal',       // 传送门：成对出现，物品进入后从配对传送门出来
  WATER = 'water',         // 水洼：倒计时归零后结冰变障碍物
  ICE = 'ice',             // 冰块：水洼结冰后的永久障碍物
  ONEWAY = 'oneway',       // 单向门：只能沿箭头方向进入/穿过，反向无法通过
  BUTTON = 'button',       // 按钮：物品压住即触发，连接的活动墙/桥随之切换状态
  ACTIVE_WALL = 'active_wall',   // 活动墙：默认实体阻挡，所连按钮按下时消失可通行
  ACTIVE_BRIDGE = 'active_bridge', // 活动桥：默认虚体缺口不可通行，所连按钮按下时铺设可通行
}

// ========== 活动屏障种类 ==========
// 墙与桥互为镜像：墙默认阻挡→触发后通行；桥默认缺口→触发后通行
export type ActiveBarrierKind = 'wall' | 'bridge';

// ========== 单向门方向 ==========
// 箭头指向即物品允许的通行方向
export type OnewayDirection = 'up' | 'down' | 'left' | 'right';

/** 方向 → 位移向量 [dr, dc] */
export const ONEWAY_DIR_VECTORS: Record<OnewayDirection, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

// ========== 物品类型枚举 ==========
// 每种物品有一个唯一类型名，用于匹配目标格
export enum ItemType {
  MUG_RED = 'mug_red',       // 梳子 → item_1
  BOOK_BLUE = 'book_blue',    // 鞋子 → item_2
  PLANT_GREEN = 'plant_green',// 蓝书 → item_3
  SHOE_YELLOW = 'shoe_yellow',// 红杯 → item_4
  HAT_PURPLE = 'hat_purple',  // 绿植 → item_5
  LAMP_ORANGE = 'lamp_orange',// 黄伞 → item_6
  HEADPHONE_BLACK = 'headphone_black', // 黑色头戴式耳机 → item_7
  ALARM_PINK = 'alarm_pink',  // 粉色闹钟 → item_8
  APPLE_GREEN = 'apple_green',// 青苹果 → item_9
}

// ========== 棋盘格子数据结构 ==========
// 二维数组中每个元素都是这个结构
export interface CellData {
  type: CellType;          // 格子类型（空格/障碍/物品/目标/传送门/水洼/冰块）
  itemType?: ItemType;     // 如果是物品或目标格，记录物品类型（顶层）
  layer?: number;          // 如果是物品格，记录顶层物品的层数
  targetType?: ItemType;   // 如果是目标格，记录期待归位的物品类型
  stack?: { type: ItemType; layer: number }[]; // 堆叠物品列表（layer 升序，[0]是顶层）
  portalId?: number;       // 传送门 ID：配对的传送门共享同一个 ID
  portalUses?: number;     // 传送门剩余使用次数
  freezeCounter?: number;  // 水洼结冰倒计时（归零后变冰块）
  placedCount?: number;    // 【v0.6.2】目标格已容纳的归位物品数（无限容量记账，0=未归位）
  onewayDir?: OnewayDirection; // 单向门方向：物品只能沿此方向进入/穿过该格
  buttonId?: number;       // 按钮 ID：与受控的活动墙/桥共享同一 ID
  buttonPressed?: boolean; // 按钮是否处于按下态（物品压住时为 true）
  barrierId?: number;      // 活动墙/桥 ID：与所连按钮共享同一 ID
  barrierKind?: ActiveBarrierKind; // 活动墙/桥种类
  barrierActive?: boolean; // 活动墙/桥是否处于激活态（墙激活=消失可通行；桥激活=铺设可通行）
}

// ========== 关卡配置数据结构 ==========
// 对应 GDD 里 JSON 格式的关卡定义
export interface LevelConfig {
  level: number;             // 关卡编号
  grid: { rows: number; cols: number }; // 棋盘行数×列数
  obstacles: [number, number][]; // 障碍物坐标 [row, col]
  portals?: {                 // 传送门配置（可选，成对出现）
    id: number;               // 传送门 ID（配对的两个传送门共享同一 ID）
    pos: [number, number];    // 传送门位置 [row, col]
    uses?: number;            // 可使用次数（可选，不填=无限）
  }[];
  waters?: {                  // 水洼配置（可选）
    pos: [number, number];    // 水洼位置 [row, col]
    freezeIn: number;         // 多少次移动后结冰（全局计数）
  }[];
  oneways?: {                 // 单向门配置（可选）
    pos: [number, number];    // 单向门位置 [row, col]
    dir: OnewayDirection;     // 通行方向：物品只能沿此方向进入/穿过
  }[];
  buttons?: {                 // 按钮配置（可选，与活动墙/桥通过共享 id 配对）
    id: number;               // 按钮 ID（与受控的活动墙/桥共享同一 ID）
    pos: [number, number];    // 按钮位置 [row, col]
  }[];
  activeBarriers?: {          // 活动墙/桥配置（可选，与按钮通过共享 id 配对）
    id: number;               // 屏障 ID（与所连按钮共享同一 ID）
    pos: [number, number];    // 屏障位置 [row, col]
    kind: ActiveBarrierKind;  // wall=活动墙(默认阻挡) / bridge=活动桥(默认缺口)
  }[];
  items: {                    // 物品列表
    type: ItemType;           // 物品类型
    pos: [number, number];    // 初始位置 [row, col]
    layer: number;            // 层数（1=顶层）
  }[];
  targets: {                  // 目标格列表
    type: ItemType;           // 期待物品类型
    pos: [number, number];    // 目标格位置 [row, col]
  }[];
  maxRefreshes?: number;       // 刷新次数上限（可选，不填=默认3次）
  maxSteps?: number;           // 【步数限制】移动步数上限（可选，不填=无步数限制）
  winCondition?: {             // 【v0.6.2】通关条件（可选，省略=模式A全部归位）
    mode: 'placeAll' | 'clearItem'; // placeAll=所有物品归位 / clearItem=指定道具消除X个
    targetType?: ItemType;     // 模式 clearItem 必填：要消除的目标物品类型
    targetCount?: number;      // 模式 clearItem 必填：需消除的个数
  };
}

// ========== 游戏场景枚举 ==========
// 游戏运行过程中所处的不同画面
export enum SceneType {
  BOOT = 'boot',         // 启动场景（显示 LOGO，初始化引擎）
  LOADING = 'loading',   // 加载场景（显示进度条）
  MENU = 'menu',         // 主菜单
  GAME = 'game',         // 游戏主场景
  RESULT = 'result',     // 结算场景
}

// ========== 事件名常量 ==========
// 事件总线用的事件名，统一在这里定义避免拼写错误
export enum GameEvent {
  // 场景相关
  SCENE_CHANGE = 'scene:change',         // 切换场景
  SCENE_READY = 'scene:ready',           // 场景就绪

  // 游戏逻辑相关
  ITEM_PICKED = 'item:picked',           // 物品被拿起
  ITEM_PLACED = 'item:placed',           // 物品被放下（归位）
  ITEM_MOVED = 'item:moved',             // 物品移动（普通移动）
  ITEM_RETURNED = 'item:returned',       // 物品回弹（非法放置）
  STEP_USED = 'step:used',               // 消耗一步
  LEVEL_COMPLETE = 'level:complete',     // 关卡完成
  LEVEL_FAILED = 'level:failed',         // 关卡失败（步数耗尽）
  DEADLOCK_DETECTED = 'deadlock:detected', // 检测到死局
  STEP_LIMIT_REACHED = 'step:limitReached', // 【步数限制】步数耗尽

  // UI 相关
  PAUSE = 'ui:pause',                    // 暂停
  RESUME = 'ui:resume',                  // 继续
  RESTART = 'ui:restart',                // 重新开始
  UNDO = 'ui:undo',                      // 撤销
  TOGGLE_SOUND = 'ui:toggleSound',       // 切换音效

  // 输入相关
  TOUCH_START = 'input:touchStart',      // 触摸开始
  TOUCH_MOVE = 'input:touchMove',        // 触摸移动
  TOUCH_END = 'input:touchEnd',          // 触摸结束
}

// ========== 游戏全局状态接口 ==========
export interface GameStateData {
  currentLevel: number;     // 当前关卡编号
  maxUnlockedLevel: number; // 已解锁的最高关卡
  soundEnabled: boolean;    // 音效开关
  moveCount: number;        // 当前关卡移动次数（替代原 stepsUsed）
  itemsPlaced: number;      // 当前关卡已归位物品数
  totalItems: number;       // 当前关卡物品总数
  isPaused: boolean;        // 是否暂停
  moveHistory: MoveRecord[]; // 移动历史（用于撤销）
  refreshesUsed: number;    // 当前关卡已用刷新次数
  maxRefreshes: number;     // 当前关卡刷新次数上限
  stepsUsed: number;        // 【步数限制】当前关卡已用步数
  maxSteps: number | null;  // 【步数限制】步数上限（null=无限制）
}

// ========== 移动记录 ==========
// 记录每一步操作，用于撤销功能
export interface MoveRecord {
  itemIndex: number;            // 被移动的物品索引
  fromPos: [number, number];    // 起始位置 [row, col]
  toPos: [number, number];      // 目标位置 [row, col]
  fromLayer: number;            // 移动前的层数
}

// ========== 可到达位置 ==========
// 物品拖拽时计算出的可落点
export interface ReachableCell {
  row: number;
  col: number;
  isTarget: boolean; // 是否是目标格
  isPortal: boolean; // 是否是传送门
  isOneway?: boolean; // 是否是单向门
}
