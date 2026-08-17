/**
 * 游戏全局配置
 * 
 * 【通俗说明】这个文件只存数值常量，不写任何逻辑。
 * 你想改画布大小、颜色、速度等，只改这里就行，不用翻代码。
 */

export const GameConfig = {
  // ========== 画布设置 ==========
  // 设计分辨率（竖版 9:16 比例）
  DESIGN_WIDTH: 375,   // 设计宽度（逻辑像素）
  DESIGN_HEIGHT: 667,  // 设计高度（逻辑像素）

  // ========== 棋盘渲染设置 ==========
  BOARD_PADDING: 16,         // 棋盘四周留白（px）
  CELL_BORDER: 1,            // 格子边框宽度（px）

  // ========== 木质 3D 风格色板 ==========
  // 背景与地板
  COLOR_BG_BOARD: '#d4b896',     // 棋盘背景：温暖木质米色
  COLOR_BG_BOARD_DARK: '#a8895f', // 阴影/缝隙深色

  // 格子 3D（顶面 + 侧面，模拟浮起的方块）
  CELL_TOP_COLOR: '#e8d4b0',     // 格子顶面（比背景略亮的浅米色）
  CELL_SIDE_COLOR: '#a8895f',    // 格子侧面（深米色）
  CELL_DEPTH: 3,                  // 格子立体厚度（px）
  CELL_RADIUS: 6,                 // 格子圆角半径

  // 物品 3D 底座（与格子同色系但更突出）
  PEDESTAL_TOP_COLOR: '#f5e8d0',  // 底座顶面（最浅）
  PEDESTAL_SIDE_COLOR: '#a88060', // 底座侧面
  PEDESTAL_RIM_COLOR: '#c8a878',  // 底座顶面边缘高光
  PEDESTAL_DEPTH: 6,              // 底座厚度（px）
  PEDESTAL_RADIUS: 8,             // 底座圆角

  // 物品白色卡片（放在底座上，承载图标）
  ITEM_CARD_COLOR: '#fafafa',     // 卡片底色（近白）
  ITEM_CARD_BORDER: 'rgba(0,0,0,0.08)', // 卡片细边框
  ITEM_CARD_RADIUS: 10,           // 卡片圆角
  ITEM_CARD_SHADOW: 'rgba(0,0,0,0.15)', // 卡片阴影

  // 障碍物（扁平木板 + 木纹）
  OBSTACLE_WOOD_COLOR: '#9c7a52', // 障碍物主色（暖棕木）
  OBSTACLE_WOOD_DARK: '#7a5d3a',  // 障碍物阴影
  OBSTACLE_GRAIN_COLOR: 'rgba(60,40,20,0.22)', // 木纹线色

  // 目标格（虚线框 + 剪影）
  TARGET_DASH_COLOR: '#8b6f47',   // 目标格虚线框颜色
  TARGET_GHOST_ALPHA: 0.25,       // 目标格内剪影透明度

  // 堆叠
  STACK_OFFSET_Y: 10,             // 堆叠时每层向下偏移的像素（阶梯效果）

  // 老字段保留兼容
  CELL_BORDER_COLOR: 'rgba(0,0,0,0.06)', // 格子边框（极淡）
  CELL_EMPTY_COLOR: '#e8d4b0',    // 空格色 = 格子顶面
  CELL_OBSTACLE_COLOR: '#9c7a52', // 障碍色
  CELL_TARGET_COLOR: '#e8d4b0',   // 目标格 = 空格同色（用虚线框区分）
  CELL_TARGET_BORDER_COLOR: '#8b6f47', // 目标格虚线框
  CELL_HIGHLIGHT_COLOR: 'rgba(255, 215, 0, 0.35)', // 可到达格高亮色

  // ========== 物品渲染设置 ==========
  ITEM_SHADOW_OFFSET_X: 3,   // 下层物品 X 偏移（px）
  ITEM_SHADOW_OFFSET_Y: 3,   // 下层物品 Y 偏移（px）
  ITEM_SHADOW_ALPHA: 0.3,    // 下层物品透明度（0~1，越小越透明）
  ITEM_RADIUS: 6,            // 物品圆角半径（px）
  ITEM_PADDING: 4,           // 物品与格子边缘间距（px）

  // ========== 目标格设置 ==========
  TARGET_DASH_LENGTH: 4,     // 虚线每段长度（px）
  TARGET_DASH_GAP: 3,        // 虚线间隔长度（px）

  // ========== 拖拽设置 ==========
  DRAG_LIFT_SCALE: 1.12,     // 拖拽时物品放大比例
  DRAG_LIFT_OFFSET_Y: -8,    // 拖拽时物品上移（px），模拟"提起"效果
  DRAG_ANIM_DURATION: 180,   // 回弹/归位动画时长（毫秒）

  // ========== 游戏机制设置 ==========
  GUIDE_LEVELS: 3,           // 引导关卡数（前 N 关显示路径高亮）
  MAX_STACK_LAYERS: 3,       // 一个格子最多堆叠层数

  // ========== 字体设置 ==========
  FONT_FAMILY: 'Arial, "Microsoft YaHei", sans-serif',
  FONT_SIZE_SMALL: 12,       // 小字（说明文字）
  FONT_SIZE_NORMAL: 14,      // 正常（按钮文字）
  FONT_SIZE_LARGE: 20,       // 大字（标题）
  FONT_SIZE_HUGE: 32,        // 超大字（分数）

  // ========== 颜色设置 ==========
  COLOR_BG: '#16213e',       // 游戏背景色（深蓝）
  COLOR_BG_MENU: '#0f3460',  // 菜单背景色
  COLOR_PRIMARY: '#e94560',  // 主色调（红，用于按钮）
  COLOR_SECONDARY: '#f5c518', // 辅色调（金，用于星级）
  COLOR_TEXT: '#ffffff',     // 白色文字
  COLOR_TEXT_DARK: '#333333', // 深色文字
  COLOR_BUTTON_BG: '#e94560', // 按钮底色
  COLOR_BUTTON_TEXT: '#ffffff', // 按钮文字色

  // ========== 关卡 HUD 设置 ==========
  HUD_HEIGHT: 44,            // 顶部信息栏高度（px）
  HUD_PADDING: 10,           // HUD 内边距
  BOTTOM_BAR_HEIGHT: 56,     // 底部操作栏高度（道具、撤销等按钮）
};
