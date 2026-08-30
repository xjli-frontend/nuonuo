/**
 * 「挪挪」滑块归位 —— Cocos 渲染适配层
 *
 * 【通俗说明】把引擎无关的 nuonuo 核心包（纯 TypeScript 棋盘逻辑）接到 Cocos 上：
 *  - 优先用挪挪收纳屋的美术贴图（resources/nuonuo/）渲染棋盘，贴图未就绪时回退 Graphics 程序化绘制
 *  - 用 Label 显示物品/目标/倒计时等文字
 *  - 把「拖拽」简化成「点选起点 → 点选落点」两步操作
 *  - 自己维护步数/撤销快照，通关进度交给 nuonuo 的 GameState 持久化
 *
 * 交互：点一个物品（高亮所有可落点）→ 再点一个高亮格，物品沿直线滑过去。
 */
import {
    _decorator, Component, Node, Label, Graphics, Color, UITransform, EventTouch, v3,
    Sprite, SpriteFrame, Texture2D, resources, log, UIOpacity, tween,
} from 'cc';
const { ccclass } = _decorator;

import { Board } from '../nuonuo/systems/Board';
import { PathCalculator } from '../nuonuo/systems/PathCalculator';
import { gameState } from '../nuonuo/core/GameState';
import { getLevelConfig } from '../nuonuo/config/LevelConfig';
import { CellType, CellData, ItemType, LevelConfig } from '../nuonuo/types/index';

type RGB = [number, number, number];

// ========== 物品配色与名称 ==========
const ITEM_COLORS: Record<ItemType, RGB> = {
    [ItemType.MUG_RED]: [233, 69, 96],
    [ItemType.BOOK_BLUE]: [59, 130, 246],
    [ItemType.PLANT_GREEN]: [34, 197, 94],
    [ItemType.SHOE_YELLOW]: [234, 179, 8],
    [ItemType.HAT_PURPLE]: [168, 85, 247],
    [ItemType.LAMP_ORANGE]: [249, 115, 22],
    [ItemType.HEADPHONE_BLACK]: [55, 65, 81],
    [ItemType.ALARM_PINK]: [236, 72, 153],
    [ItemType.APPLE_GREEN]: [132, 204, 22],
};
const ITEM_NAMES: Record<ItemType, string> = {
    [ItemType.MUG_RED]: '杯',
    [ItemType.BOOK_BLUE]: '书',
    [ItemType.PLANT_GREEN]: '植',
    [ItemType.SHOE_YELLOW]: '鞋',
    [ItemType.HAT_PURPLE]: '帽',
    [ItemType.LAMP_ORANGE]: '灯',
    [ItemType.HEADPHONE_BLACK]: '机',
    [ItemType.ALARM_PINK]: '钟',
    [ItemType.APPLE_GREEN]: '果',
};

// ========== ItemType → 美术资源编号（挪挪收纳屋 item_1~item_9.png） ==========
const ITEM_ID: Record<ItemType, number> = {
    [ItemType.MUG_RED]: 1,
    [ItemType.BOOK_BLUE]: 2,
    [ItemType.PLANT_GREEN]: 3,
    [ItemType.SHOE_YELLOW]: 4,
    [ItemType.HAT_PURPLE]: 5,
    [ItemType.LAMP_ORANGE]: 6,
    [ItemType.HEADPHONE_BLACK]: 7,
    [ItemType.ALARM_PINK]: 8,
    [ItemType.APPLE_GREEN]: 9,
};

// ========== 地形配色 ==========
const C_EMPTY: RGB = [232, 212, 176];
const C_OBSTACLE: RGB = [156, 122, 82];
const C_TARGET_BORDER: RGB = [139, 111, 71];
const C_ICE: RGB = [186, 208, 224];
const C_ONEWAY: RGB = [148, 163, 184];
const C_BUTTON: RGB = [245, 197, 24];
const C_WALL: RGB = [120, 93, 58];
const C_BRIDGE: RGB = [203, 213, 225];
const C_BOARD_BG: RGB = [212, 184, 150]; // #d4b896 原版棋盘木色
const C_HIGHLIGHT: RGB = [255, 215, 0];
const C_BROWN: RGB = [135, 94, 45];      // #875E2D 关卡界面文本/数字统一色
const C_RED: RGB = [255, 59, 48];        // 水洼倒计时红字

const ONEWAY_ARROW: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' };

// 堆叠每层偏移（px）：对齐原版挪挪收纳屋 GameConfig.STACK_OFFSET_Y
const STACK_OFFSET_Y = 9;

// 棋盘九宫格底板（level/boad_bg.png.meta 的 border）：
//  - FRAME_INSET_* 是九宫格四边（贴图不拉伸区，含大量透明留白，仅用于贴图拉伸）
//  - FRAME_PAD_* 是格子与边框内缘的间距（不透明边框实际约 30px，另留 8px 空隙）
const FRAME_INSET_LR = 121;
const FRAME_INSET_TB = 190;
const FRAME_PAD_LR = 30;
const FRAME_PAD_TB = 28;
const BOARD_MAX_W = 720;  // 棋盘（含边框）最大宽
const BOARD_MAX_H = 820;  // 棋盘（含边框）最大高（顶/底栏之间留白）

/** HUD 数据（每次重绘后回传给宿主，用于顶栏显示） */
export interface HudData {
    level: number;
    steps: number;
    maxSteps: number | null;
    placed: number;
    total: number;
}

/** 结果数据（胜负判定后回传给宿主，宿主弹结果界面） */
export interface ResultData {
    win: boolean;
    level: number;
    steps: number;
    hasNext: boolean;
}

@ccclass('NuonuoGame')
export default class NuonuoGame extends Component {

    private board: Board = null;
    private pathCalc: PathCalculator = null;
    private levelCfg: LevelConfig = null;
    private level: number = 1;

    // 本地 HUD 计数（步数/撤销由本层自管，通关进度交给 gameState 持久化）
    private stepsUsed: number = 0;
    private totalItems: number = 0;

    private boardRoot: Node = null;
    private cellSize: number = 0;
    private cols: number = 0;
    private rows: number = 0;

    // 最近一次 render 生成的格子节点（供碰撞抖动按坐标取节点；getChildByName 会拿到 destroyAllChildren 后尚未销毁的旧节点）
    private cellNodes: Map<string, Node> = new Map();

    // 拖拽状态（点选起点 + 跟随手指的浮动预览）
    private dragFrom: [number, number] = null;
    private dragPreview: Node = null;
    private reachable: Set<string> = new Set();

    // 撤销快照：JSON 深拷贝棋盘 + 本地计数（Board.clone 是浅拷贝，不能用）
    private history: string[] = [];

    // 宿主注入的回调（默认空；不注入则静默，保持本类框架无关）
    public onHud: ((h: HudData) => void) | null = null;
    public onResult: ((r: ResultData) => void) | null = null;
    public onTip: ((text: string) => void) | null = null;

    protected onLoad(): void {
        // 预加载美术贴图，就绪后重绘（未就绪前走 Graphics 程序化回退）
        this.preloadAssets().then(() => {
            if (this.node && this.node.isValid) this.render();
        });
    }

    /** 由宿主调用：进入指定关卡（替代原 onLoad 自动开局） */
    public play(level: number): void {
        this.initLevel(level);
    }

    // ========== 美术资源（挪挪收纳屋原图，resources/nuonuo/） ==========

    private static _sfCache: Map<string, SpriteFrame> = new Map();
    private static _preloadPromise: Promise<void> | null = null;

    /** 预加载全部美术贴图（进程内一次性，重复调用复用同一 Promise） */
    private preloadAssets(): Promise<void> {
        if (NuonuoGame._preloadPromise) return NuonuoGame._preloadPromise;

        // [缓存键, resources/nuonuo/ 下的文件名]
        const entries: Array<[string, string]> = [
            ['dizuo', 'dizuo'],
            ['gezi', 'gezi'],
            ['zhangai', 'zhangai'],
            ['xuanzhogn', 'xuanzhogn'],
            ['water', 'water'],
            ['freeon', 'freeon'],
            ['snow', 'snow'],
            ...Array.from({ length: 5 }, (_, i) => [`portal_${i + 1}`, `portal${i + 1}`] as [string, string]),
            ...Array.from({ length: 9 }, (_, i) => [`item_${i + 1}`, `item_${i + 1}`] as [string, string]),
            ...Array.from({ length: 9 }, (_, i) => [`item_${i + 1}_1`, `item_${i + 1}_1`] as [string, string]),
            ['boad_bg', 'level/boad_bg'],   // 棋盘九宫格底板
            ['num_bg', 'level/num_bg'],     // 数字圆底（传送门次数 / 水洼倒计时）
        ];

        NuonuoGame._preloadPromise = Promise.all(entries.map(([key, file]) =>
            new Promise<void>(resolve => {
                // 图片默认被导入成 texture（无 spriteFrame 子资源），故直接加载 texture 再包一层 SpriteFrame；
                // texture 子资源在 texture / sprite-frame 两种导入方式下都存在，两者都兼容。
                resources.load(`nuonuo/${file}/texture`, Texture2D, (err, tex) => {
                    if (!err && tex) {
                        const sf = new SpriteFrame();
                        sf.texture = tex;
                        NuonuoGame._sfCache.set(key, sf);
                    }
                    resolve();
                });
            })
        )).then(() => {
            log(`[NuonuoGame] 美术贴图预加载完成 ${NuonuoGame._sfCache.size}/${entries.length}`);
        });
        return NuonuoGame._preloadPromise;
    }

    /** 用指定 SpriteFrame 铺一个正方形子节点（按 inset 内缩，可选中心偏移与透明度），返回该节点 */
    private addSprite(parent: Node, sf: SpriteFrame, cs: number, inset: number = 0, offset: [number, number] = [0, 0], alpha: number = 1): Node {
        const n = new Node("spr");
        n.layer = parent.layer;
        parent.addChild(n);
        const s = cs - inset * 2;
        n.setPosition(offset[0], offset[1], 0);
        n.addComponent(UITransform).setContentSize(s, s);
        const spr = n.addComponent(Sprite);
        spr.sizeMode = Sprite.SizeMode.CUSTOM;
        spr.spriteFrame = sf;
        if (alpha < 1) {
            n.addComponent(UIOpacity).opacity = Math.round(alpha * 255);
        }
        return n;
    }

    /** 按缓存键取贴图铺格子；贴图未就绪返回 false，调用方走程序化回退 */
    private trySprite(parent: Node, key: string, cs: number, inset: number = 0, offset: [number, number] = [0, 0]): boolean {
        const sf = NuonuoGame._sfCache.get(key);
        if (!sf) return false;
        this.addSprite(parent, sf, cs, inset, offset);
        return true;
    }

    // ========== 关卡初始化 ==========

    private initLevel(level: number): void {
        const cfg = getLevelConfig(level);
        if (!cfg) {
            // 超出关卡范围（全通或非法），回到第 1 关
            this.initLevel(1);
            return;
        }
        this.levelCfg = cfg;
        this.level = level;
        this.board = new Board();
        this.board.loadLevel(cfg);
        this.pathCalc = new PathCalculator(this.board);

        // 让 gameState 的 currentLevel 与展示保持一致（并重置其内部计数）
        gameState.setLevel(level);

        this.stepsUsed = 0;
        this.totalItems = cfg.items.length;
        this.history = [];
        this.dragFrom = null;
        this.reachable.clear();
        this.clearDragPreview();

        this.ensureUI();
        this.render();
    }

    /** 只创建一次的棋盘容器，每关复用（HUD/按钮由宿主 NuonuoApp 提供） */
    private ensureUI(): void {
        if (this.boardRoot) {
            this.updateCellSize();
            return;
        }
        const root = this.node;
        this.boardRoot = new Node("board");
        this.boardRoot.layer = root.layer;
        root.addChild(this.boardRoot);
        this.boardRoot.setPosition(0, 0, 0);
        this.boardRoot.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.boardRoot.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.boardRoot.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.boardRoot.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.updateCellSize();
    }

    private updateCellSize(): void {
        this.cols = this.levelCfg.grid.cols;
        this.rows = this.levelCfg.grid.rows;
        // 边框不参与格子布局：先扣掉左右/上下边框间距，再按行列均分；格子尺寸夹在 52~118 之间
        const availW = BOARD_MAX_W - FRAME_PAD_LR * 2;
        const availH = BOARD_MAX_H - FRAME_PAD_TB * 2;
        this.cellSize = Math.floor(Math.min(availW / this.cols, availH / this.rows));
        this.cellSize = Math.max(52, Math.min(118, this.cellSize));
    }

    // ========== 渲染 ==========

    private render(): void {
        if (!this.boardRoot) return;
        this.boardRoot.destroyAllChildren();

        const cs = this.cellSize;
        const bw = this.cols * cs;               // 格子区宽
        const bh = this.rows * cs;               // 格子区高
        const boardW = bw + FRAME_PAD_LR * 2;    // 含边框的棋盘总宽
        const boardH = bh + FRAME_PAD_TB * 2;    // 含边框的棋盘总高
        const uit = this.boardRoot.getComponent(UITransform) || this.boardRoot.addComponent(UITransform);
        uit.setContentSize(boardW, boardH);

        this.cellNodes.clear();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cellNode = this.renderCell(r, c, this.board.getCell(r, c), cs);
                this.cellNodes.set(`${r},${c}`, cellNode);
            }
        }

        // 棋盘底板：九宫格贴图 boad_bg（SLICED 拉伸，适配任意棋盘尺寸），未就绪回退纯色
        // 放在所有格子之后 → 层级最高，边框盖在格子元素之上
        const bgNode = new Node("bg");
        bgNode.layer = this.boardRoot.layer;
        this.boardRoot.addChild(bgNode);
        bgNode.addComponent(UITransform).setContentSize(boardW, boardH);
        const boadSf = NuonuoGame._sfCache.get('boad_bg');
        if (boadSf) {
            // 九宫格四边（来自 boad_bg.png.meta 的 border，贴图直接包 SpriteFrame 不携带，需手动补上）
            boadSf.insetLeft = FRAME_INSET_LR;
            boadSf.insetRight = FRAME_INSET_LR;
            boadSf.insetTop = FRAME_INSET_TB;
            boadSf.insetBottom = FRAME_INSET_TB;
            const spr = bgNode.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.type = Sprite.Type.SLICED;
            spr.spriteFrame = boadSf;
        } else {
            const bgG = bgNode.addComponent(Graphics);
            bgG.fillColor = new Color(...C_BOARD_BG, 255);
            bgG.roundRect(-boardW / 2, -boardH / 2, boardW, boardH, 8);
            bgG.fill();
        }

        this.updateHud();
    }

    private renderCell(r: number, c: number, cell: CellData, cs: number): Node {
        const node = new Node(`c_${r}_${c}`);
        node.layer = this.boardRoot.layer;
        node.setPosition((c - (this.cols - 1) / 2) * cs, ((this.rows - 1) / 2 - r) * cs, 0);
        node.addComponent(UITransform).setContentSize(cs, cs);
        const g = node.addComponent(Graphics);
        this.boardRoot.addChild(node);

        const inset = 2;
        const x = -cs / 2 + inset;
        const y = -cs / 2 + inset;
        const w = cs - inset * 2;
        const rad = Math.max(4, cs * 0.12);

        // 通用底：每个格子先铺 gezi（贴图或回退浅色），再叠各自元素
        this.drawBase(node, g, cs, x, y, w, rad);

        switch (cell.type) {
            case CellType.OBSTACLE:
                if (!this.trySprite(node, 'zhangai', cs)) this.fillCellRect(node, C_OBSTACLE, x, y, w, rad, cs);
                break;
            case CellType.WATER:
                // 水洼：gezi 底 + 左上角雪花 + 红字倒计时（倒计时结束结冰）
                if (cell.freezeCounter !== undefined && cell.freezeCounter > 0) {
                    this.addSnowCount(node, cell.freezeCounter, cs);
                }
                break;
            case CellType.ICE:
                this.renderIce(node, cs, x, y, w, rad);
                break;
            case CellType.PORTAL:
                this.renderPortal(node, g, cell, cs, x, y, w, rad);
                break;
            case CellType.ONEWAY:
                this.fillCellRect(node, C_ONEWAY, x, y, w, rad, cs);
                this.addCellText(node, ONEWAY_ARROW[cell.onewayDir] ?? '→', cs, C_BROWN);
                break;
            case CellType.BUTTON:
                this.drawButtonCell(node, x, y, w, cs);
                this.addCellText(node, cell.buttonPressed ? '●' : '○', cs, C_BROWN);
                break;
            case CellType.ACTIVE_WALL:
                this.fillCellRect(node, cell.barrierActive ? C_EMPTY : C_WALL, x, y, w, rad, cs);
                break;
            case CellType.ACTIVE_BRIDGE:
                this.fillCellRect(node, cell.barrierActive ? C_BRIDGE : C_BOARD_BG, x, y, w, rad, cs);
                break;
            case CellType.TARGET:
                this.renderTarget(node, g, cell, cs, x, y, w, rad);
                break;
            case CellType.ITEM:
                this.renderItem(node, g, cell, r, c, cs, x, y, w, rad);
                break;
            default: // EMPTY
                break;
        }

        // 水洼覆盖层：目标格 / 传送门上的水（雪花 + 红字倒计时）
        if ((cell.type === CellType.TARGET || cell.type === CellType.PORTAL)
            && cell.freezeCounter !== undefined && cell.freezeCounter > 0) {
            this.addSnowCount(node, cell.freezeCounter, cs);
        }

        // 可落点高亮（独立子节点盖在最上层，否则会被 gezi/物品贴图挡住）
        if (this.reachable.has(`${r},${c}`)) {
            this.addHighlight(node, cs);
        }

        return node;
    }

    /** 传送门：portal_N 贴图铺满 + 编号/剩余次数文字 */
    private renderPortal(node: Node, g: Graphics, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const id = cell.portalId ?? 1;
        const key = `portal_${((id - 1) % 5) + 1}`;
        if (!this.trySprite(node, key, cs)) {
            this.fillRect(g, [72, 49, 148], x, y, w, rad);
            this.drawPortalRing(g, cs);
            this.addCellText(node, `门${cell.portalId ?? ''}`, cs, C_BROWN);
        }
        // 可使用次数 → 右下角 num_bg 圆底 + 数字（仅有限次数）
        if (cell.portalUses !== undefined) {
            this.addNumBadge(node, cell.portalUses, cs, 'br', C_BROWN);
        }
    }

    /** 目标格：item_N_1 剪影贴图（自带虚线框+剪影）或程序化回退；归位与否都不叠加计数角标 */
    private renderTarget(node: Node, g: Graphics, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const id = ITEM_ID[cell.targetType];
        const key = id ? `item_${id}_1` : null;
        if (key && this.trySprite(node, key, cs)) {
            return;
        }
        this.fillRect(g, C_EMPTY, x, y, w, rad);
        this.drawTargetBorder(g, x, y, w, rad);
        this.drawGhost(g, cell.targetType, x, y, w);
        this.addCellText(node, ITEM_NAMES[cell.targetType] ?? '?', cs, C_BROWN);
    }

    /** 目标剪影覆盖层（子节点）：被物品压住的目标格用，垫在物品层之下、gezi 之上 */
    private fillGhost(parent: Node, targetType: ItemType, x: number, y: number, w: number, rad: number, cs: number): void {
        const n = new Node("ghost");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g2 = n.addComponent(Graphics);
        this.fillRect(g2, C_EMPTY, x, y, w, rad);
        this.drawTargetBorder(g2, x, y, w, rad);
        this.drawGhost(g2, targetType, x, y, w);
    }

    /** 物品：gezi 底（renderCell 统一铺）+ 按 stack 从下到上绘制阶梯堆叠（dizuo 底座 + item_N 图标），或程序化色卡回退 */
    private renderItem(node: Node, g: Graphics, cell: CellData, r: number, c: number, cs: number, x: number, y: number, w: number, rad: number): void {
        const stack = (cell.stack && cell.stack.length) ? cell.stack : [{ type: cell.itemType!, layer: cell.layer ?? 1 }];
        const isDragSource = this.dragFrom && this.dragFrom[0] === r && this.dragFrom[1] === c;
        const stackOffset = STACK_OFFSET_Y;
        // 可见层数（拖拽中顶层由跟手预览承载，不算在堆叠内）
        const visibleCount = isDragSource ? stack.length - 1 : stack.length;
        // 整体垂直居中：阶梯向下的总高度 = (visibleCount-1)*stackOffset，居中使其关于格心对称
        const centering = (visibleCount - 1) * stackOffset / 2;

        // 【v0.8.9/B】被物品压住的目标格（未归位）：先画目标剪影铺满整格（垫在物品层之下），
        // 物品底座留边（max(4px, cs*8%)），四周露出剪影虚线框边缘，提示玩家下方有目标格
        if (cell.targetType) {
            const gid = ITEM_ID[cell.targetType];
            const gkey = gid ? `item_${gid}_1` : null;
            if (!(gkey && this.trySprite(node, gkey, cs))) {
                this.fillGhost(node, cell.targetType, x, y, w, rad, cs);
            }
        }

        // 从最下层画到最上层：下层向下偏移 + 降透明度，形成向下阶梯堆叠（整体居中于格子，下层往下露）
        for (let i = stack.length - 1; i >= 0; i--) {
            // 拖拽中：顶层由跟手预览承载，源格只画下层，让玩家看到堆叠结构
            if (isDragSource && i === 0) continue;
            const layerIndex = isDragSource ? i - 1 : i; // 0 = 当前可见顶层
            this.drawItemLayer(node, g, stack[i].type, cs, x, y, w, rad, layerIndex, stackOffset, centering);
        }

        if (cell.freezeCounter === -1) {
            // 物品下方已结冰：冰蓝描边 + 左上角雪花标记（贴图就绪时）
            g.lineWidth = 3;
            g.strokeColor = new Color(148, 197, 233, 255);
            g.roundRect(x, y, w, w, rad);
            g.stroke();
            this.trySprite(node, 'snow', cs, cs * 0.34, [-cs * 0.3, cs * 0.3]);
        }
    }

    /** 画单个物品层（含堆叠偏移、整体居中与透明度），layerIndex=0 为可见顶层 */
    private drawItemLayer(node: Node, g: Graphics, itemType: ItemType, cs: number, x: number, y: number, w: number, rad: number, layerIndex: number, stackOffset: number, centering: number = 0): void {
        // offsetY 正数 = 向下；centering 让整体居中，下层往下露（layerIndex 越大越靠下）
        const offsetY = layerIndex * stackOffset - centering;
        const alpha = layerIndex === 0 ? 1 : 1 - layerIndex * 0.15;
        const id = ITEM_ID[itemType];
        const dizuo = id ? NuonuoGame._sfCache.get('dizuo') : null;
        const itemSf = id ? NuonuoGame._sfCache.get(`item_${id}`) : null;

        if (dizuo && itemSf) {
            const pad = Math.max(4, cs * 0.08);
            this.addSprite(node, dizuo, cs, pad, [0, -offsetY], alpha);
            const iconInset = pad + (cs - pad * 2) * 0.15;
            this.addSprite(node, itemSf, cs, iconInset, [0, -offsetY], alpha);
        } else {
            const rgb = ITEM_COLORS[itemType] || [200, 200, 200];
            const a = Math.round(255 * alpha);
            const oy = -offsetY;
            const pad = w * 0.14;
            g.fillColor = new Color(245, 232, 208, a);
            g.roundRect(x, y + oy, w, w, rad);
            g.fill();
            g.fillColor = new Color(rgb[0], rgb[1], rgb[2], a);
            g.roundRect(x + pad, y + pad + oy, w - pad * 2, w - pad * 2, rad * 0.8);
            g.fill();
        }
    }

    /** 冰块：freeon 贴图铺满（未就绪回退纯色） */
    private renderIce(node: Node, cs: number, x: number, y: number, w: number, rad: number): void {
        if (!this.trySprite(node, 'freeon', cs)) this.fillCellRect(node, C_ICE, x, y, w, rad, cs);
    }

    private updateHud(): void {
        if (!this.onHud) return;
        const wc = this.levelCfg.winCondition;
        const isClear = wc && wc.mode === 'clearItem';
        this.onHud({
            level: this.level,
            steps: this.stepsUsed,
            maxSteps: this.levelCfg.maxSteps ?? null,
            placed: isClear ? this.clearCount(wc.targetType) : this.placedCount,
            total: isClear ? wc.targetCount : this.totalItems,
        });
    }

    // ========== 计数（由棋盘实时扫描，撤销天然一致） ==========

    private get placedCount(): number {
        let n = 0;
        for (const [r, c] of this.board.targetPositions) {
            n += this.board.getCell(r, c)?.placedCount ?? 0;
        }
        return n;
    }

    private clearCount(type?: ItemType): number {
        let n = 0;
        for (const [r, c] of this.board.targetPositions) {
            const cell = this.board.getCell(r, c);
            if (cell && cell.targetType === type) n += cell.placedCount ?? 0;
        }
        return n;
    }

    // ========== 交互（两步式点选移动） ==========

    /** 触摸点 → 棋盘局部坐标（AR 中心原点，单位像素） */
    private touchToBoardPos(e: EventTouch): [number, number] | null {
        const ui = e.getUILocation();
        const uit = this.boardRoot.getComponent(UITransform);
        if (!uit) return null;
        const local = uit.convertToNodeSpaceAR(v3(ui.x, ui.y, 0));
        return [local.x, local.y];
    }

    private touchToGrid(e: EventTouch): [number, number] | null {
        const pos = this.touchToBoardPos(e);
        if (!pos) return null;
        const bw = this.cols * this.cellSize;
        const bh = this.rows * this.cellSize;
        const px = pos[0] + bw / 2;   // 换算成左上角原点
        const py = bh / 2 - pos[1];
        if (px < 0 || py < 0 || px >= bw || py >= bh) return null;
        const c = Math.floor(px / this.cellSize);
        const r = Math.floor(py / this.cellSize);
        if (!this.board.isValidCell(r, c)) return null;
        return [r, c];
    }

    private onTouchStart(e: EventTouch): void {
        this.dragFrom = null;
        this.reachable.clear();
        this.clearDragPreview();
        const rc = this.touchToGrid(e);
        if (rc) {
            const [r, c] = rc;
            const cell = this.board.getCell(r, c);
            if (cell && cell.type === CellType.ITEM && this.board.canDrag(r, c)) {
                this.dragFrom = [r, c];
                const reach = this.pathCalc.calculateReachable(r, c);
                reach.forEach(x => this.reachable.add(`${x.row},${x.col}`));
            }
        }
        // 无论是否选中，都重绘一遍，确保旧的落点高亮被清除
        this.render();
        // 选中后立即生成跟随手指的浮动预览（源格物品已由 render 抽离）
        if (this.dragFrom) this.createDragPreview(e);
    }

    private onTouchMove(e: EventTouch): void {
        if (!this.dragPreview || !this.dragFrom) return;
        const pos = this.touchToBoardPos(e);
        if (!pos) return;
        this.dragPreview.setPosition(pos[0], pos[1], 0);
    }

    private onTouchEnd(e: EventTouch): void {
        if (!this.dragFrom) {
            this.clearDragPreview();
            return;
        }
        const from = this.dragFrom;
        const rc = this.touchToGrid(e);
        const canMove = rc && this.pathCalc.canMoveTo(from[0], from[1], rc[0], rc[1]);

        // 先清拖拽状态与预览；成功移动时 doMove 会重绘源格，否则 render 让物品弹回原位
        this.dragFrom = null;
        this.reachable.clear();
        this.clearDragPreview();

        if (canMove) {
            this.doMove(from[0], from[1], rc[0], rc[1]);
        } else {
            this.render(); // 未落到可落点，物品弹回原位
            // 被挡住：源格 + 目标格轻微抖动，表现「反弹」
            this.shakeCell(from[0], from[1]);
            if (rc) this.shakeCell(rc[0], rc[1]);
        }
    }

    // ========== 拖拽预览（物品跟手） ==========

    private clearDragPreview(): void {
        if (this.dragPreview) {
            this.dragPreview.destroy();
            this.dragPreview = null;
        }
    }

    private createDragPreview(e: EventTouch): void {
        this.clearDragPreview();
        const pos = this.touchToBoardPos(e);
        if (!pos) return;
        const n = this.buildItemPreview(this.cellSize);
        this.node.addChild(n);
        n.setPosition(pos[0], pos[1], 0);
        this.dragPreview = n;
    }

    /** 按源格物品构建浮动预览节点（复用美术贴图，未就绪回退色卡） */
    private buildItemPreview(cs: number): Node {
        const cell = this.board.getCell(this.dragFrom[0], this.dragFrom[1]);
        const n = this.buildItemVisual(cell.itemType, cs);
        n.name = "dragPreview";
        return n;
    }

    /** 构建物品视觉节点（dizuo 底座 + item_N 图标，未就绪回退色卡），原点在格心，供拖拽预览 / 特效复用 */
    private buildItemVisual(itemType: ItemType, cs: number): Node {
        const n = new Node("itemVisual");
        n.layer = this.node.layer;
        n.addComponent(UITransform).setContentSize(cs, cs);

        const id = ITEM_ID[itemType];
        const dizuo = id ? NuonuoGame._sfCache.get('dizuo') : null;
        const itemSf = id ? NuonuoGame._sfCache.get(`item_${id}`) : null;
        if (dizuo && itemSf) {
            const pad = Math.max(4, cs * 0.08);
            this.addSprite(n, dizuo, cs, pad);
            const iconInset = pad + (cs - pad * 2) * 0.15;
            this.addSprite(n, itemSf, cs, iconInset);
        } else {
            const g = n.addComponent(Graphics);
            const rgb = ITEM_COLORS[itemType] || [200, 200, 200];
            const rad = Math.max(4, cs * 0.12);
            g.fillColor = new Color(245, 232, 208, 255);
            g.roundRect(-cs / 2 + 2, -cs / 2 + 2, cs - 4, cs - 4, rad);
            g.fill();
            const pad = cs * 0.14;
            g.fillColor = new Color(rgb[0], rgb[1], rgb[2], 255);
            g.roundRect(-cs / 2 + pad, -cs / 2 + pad, cs - pad * 2, cs - pad * 2, rad * 0.8);
            g.fill();
        }
        return n;
    }

    private doMove(fr: number, fc: number, tr: number, tc: number): boolean {
        const itemType = this.board.getCell(fr, fc)?.itemType;
        this.history.push(this.snapshot());

        const res = this.board.moveItem(fr, fc, tr, tc);
        if (!res.success) {
            this.history.pop();
            // 传送失败（出口被堵/次数耗尽等）：物品弹回原位 + 源格/目标格抖动，与非法移动表现一致
            this.render();
            this.shakeCell(fr, fc);
            this.shakeCell(tr, tc);
            if (this.board.getCell(tr, tc)?.type === CellType.PORTAL) {
                this.onTip?.('传送出口被堵住了');
            }
            return false;
        }

        this.stepsUsed++;
        this.board.tickWaters();
        this.board.recalcButtons();

        // 传送门特效：入口吸入（大变小）→ 出口沿行进方向滑出（小变大），动画结束后再重绘与结算
        if (res.teleported && itemType !== undefined) {
            this.playTeleportEffect(tr, tc, res.finalRow, res.finalCol, itemType);
            return true;
        }

        // 归位（消除）：落点格子变为 TARGET → 播放旋转缩小消失特效
        const placed = this.board.getCell(res.finalRow, res.finalCol)?.type === CellType.TARGET;
        if (placed && itemType !== undefined) {
            this.playEliminateEffect(res.finalRow, res.finalCol, itemType);
        }

        this.render();
        this.checkEnd();
        return true;
    }

    // ========== 表现特效（消除 / 碰撞抖动） ==========

    /** 格子坐标 → 棋盘局部坐标（像素，与 renderCell 一致） */
    private gridToBoardPos(r: number, c: number): [number, number] {
        const cs = this.cellSize;
        return [
            (c - (this.cols - 1) / 2) * cs,
            ((this.rows - 1) / 2 - r) * cs,
        ];
    }

    /** 消除特效：在归位格画一个物品图标，旋转 1 圈并缩小到 0 消失（漩涡式） */
    private playEliminateEffect(row: number, col: number, itemType: ItemType): void {
        const cs = this.cellSize;
        const [x, y] = this.gridToBoardPos(row, col);
        const n = this.buildItemVisual(itemType, cs);
        n.name = "fx_eliminate";
        this.node.addChild(n);
        n.setPosition(x, y, 0);

        tween(n)
            .to(0.35, { angle: 360, scale: v3(0, 0, 1) }, { easing: 'quadIn' })
            .call(() => n.destroy())
            .start();
    }

    /**
     * 传送特效：入口吸入（大变小）→ 出口沿行进方向滑出（小变大）→ 动画结束重绘 + 结算。
     * 期间不重绘棋盘，物品在源格/落点都不可见，避免与特效节点重叠穿帮。
     */
    private playTeleportEffect(entranceRow: number, entranceCol: number, landRow: number, landCol: number, itemType: ItemType): void {
        const cs = this.cellSize;
        const [ix, iy] = this.gridToBoardPos(entranceRow, entranceCol);
        const [lx, ly] = this.gridToBoardPos(landRow, landCol);
        // 出口 = 配对传送门；落点是出口沿行进方向再走一格，从出口中心滑到落点中心
        const exit = this.board.getPortalExit(entranceRow, entranceCol);
        const [ex, ey] = exit ? this.gridToBoardPos(exit[0], exit[1]) : [lx, ly];

        // 第一阶段：入口吸入——物品在入口传送门缩到 0
        const suck = this.buildItemVisual(itemType, cs);
        this.node.addChild(suck);
        suck.setPosition(ix, iy, 0);

        // 第二阶段：出口传出——物品从出口滑到落点，同时由小变大
        const pop = this.buildItemVisual(itemType, cs);
        this.node.addChild(pop);
        pop.setPosition(ex, ey, 0);
        pop.setScale(v3(0.05, 0.05, 1));

        tween(suck)
            .to(0.12, { scale: v3(0.05, 0.05, 1) }, { easing: 'quadIn' })
            .call(() => {
                suck.destroy();
                tween(pop)
                    .to(0.18, { position: v3(lx, ly, 0), scale: v3(1, 1, 1) }, { easing: 'quadOut' })
                    .call(() => {
                        pop.destroy();
                        // 动画结束：重绘最终状态；若落点是归位格，接消除特效
                        this.render();
                        if (this.board.getCell(landRow, landCol)?.type === CellType.TARGET) {
                            this.playEliminateEffect(landRow, landCol, itemType);
                        }
                        this.checkEnd();
                    })
                    .start();
            })
            .start();
    }

    /** 碰撞抖动：让指定格子左右轻微抖动，表现「被挡住反弹」 */
    private shakeCell(r: number, c: number): void {
        const node = this.cellNodes.get(`${r},${c}`);
        if (!node || !node.isValid) return;
        const bx = node.position.x;
        const by = node.position.y;
        const amp = 10;
        tween(node)
            .to(0.05, { position: v3(bx + amp, by, 0) })
            .to(0.05, { position: v3(bx - amp, by, 0) })
            .to(0.05, { position: v3(bx + amp * 0.6, by, 0) })
            .to(0.05, { position: v3(bx - amp * 0.3, by, 0) })
            .to(0.05, { position: v3(bx, by, 0) })
            .start();
    }

    // ========== 撤销 ==========

    private snapshot(): string {
        return JSON.stringify({
            grid: this.board.grid,
            stepsUsed: this.stepsUsed,
        });
    }

    /** 撤销一步；成功返回 true（无历史时返回 false 并提示，供宿主判断是否消耗道具） */
    public undo(): boolean {
        const s = this.history.pop();
        if (!s) {
            this.onTip?.("没有可撤销的步骤");
            return false;
        }
        const o = JSON.parse(s);
        this.board.grid = o.grid;
        this.stepsUsed = o.stepsUsed;
        this.board.recalcButtons();
        this.render();
        return true;
    }

    /** 重开本关：整关重置回初始状态（区别于 refresh 的原地重洗） */
    public restart(): void {
        this.initLevel(this.level);
    }

    /**
     * 刷新：把所有未归位物品重新随机排列（对齐挪挪收纳屋 SceneGame.refresh）。
     * 规则：同格堆叠不拆散、目标格不动、已归位物品不动、随机分配到可用落点。
     * 纯机制：道具消耗（全局 refreshItems）由宿主 NuonuoApp 处理。
     */
    public refresh(): void {
        // 第一步：收集所有未归位物品（按堆叠分组，同格物品保持在一起）。
        // 归位物品的格子 cell.type 已是 TARGET（placedCount>0），不会出现在 ITEM 格里。
        const groups: { row: number; col: number; stack: { type: ItemType; layer: number }[] }[] = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board.getCell(r, c);
                if (!cell || cell.type !== CellType.ITEM) continue;
                const stack = (cell.stack && cell.stack.length)
                    ? cell.stack
                    : [{ type: cell.itemType!, layer: cell.layer ?? 1 }];
                groups.push({ row: r, col: c, stack });
            }
        }

        // 第二步：收集可用落点（空格/水洼/传送门/未归位物品原位；排除障碍/目标格/机关格/冰块）
        const available: [number, number][] = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board.getCell(r, c);
                if (!cell) continue;
                if (cell.type === CellType.OBSTACLE) continue;
                if (cell.type === CellType.TARGET) continue;      // 目标格不参与随机放置
                if (cell.type === CellType.ONEWAY) continue;      // 单向门是通道地形
                if (cell.type === CellType.BUTTON) continue;      // 按钮是机关格
                if (cell.type === CellType.ACTIVE_WALL || cell.type === CellType.ACTIVE_BRIDGE) continue;
                if (cell.type === CellType.ICE) continue;         // 冰块是永久障碍
                available.push([r, c]);
            }
        }

        // 第三步：打乱可用落点
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        // 清空未归位物品原来的格子（恢复底层地形）
        for (const g of groups) {
            const cell = this.board.getCell(g.row, g.col);
            if (cell) this.restoreUnderlyingTerrain(cell);
        }

        // 重新分配新位置（组内物品分到同一格）
        let idx = 0;
        for (const g of groups) {
            if (idx >= available.length) break;
            const [nr, nc] = available[idx++];
            const cell = this.board.getCell(nr, nc);
            if (cell) {
                cell.type = CellType.ITEM;
                cell.itemType = g.stack[0].type;
                cell.layer = g.stack[0].layer;
                cell.stack = g.stack.map(it => ({ type: it.type, layer: it.layer }));
                // 保留 portalId / freezeCounter / targetType 等附加属性（落点若在传送门/水洼/目标格上）
            }
        }

        // 刷新后不能撤销之前的操作；物品位置变化，重新结算按钮与活动墙/桥态
        this.history = [];
        this.board.recalcButtons();
        this.render();
    }

    /** 恢复格子为底层地形（镜像 Board.moveItem 的「处理起始格」逻辑） */
    private restoreUnderlyingTerrain(cell: CellData): void {
        cell.itemType = undefined;
        cell.layer = undefined;
        cell.stack = undefined;

        if (cell.freezeCounter === -1) {
            // 物品下方已结冰 → 恢复为冰块
            cell.type = CellType.ICE;
            cell.freezeCounter = undefined;
            cell.portalId = undefined;
            cell.portalUses = undefined;
            cell.targetType = undefined;
            cell.onewayDir = undefined;
            cell.buttonId = undefined;
            cell.buttonPressed = undefined;
            cell.barrierId = undefined;
            cell.barrierKind = undefined;
            cell.barrierActive = undefined;
        } else if (cell.portalId !== undefined) {
            cell.type = CellType.PORTAL;
        } else if (cell.onewayDir !== undefined) {
            cell.type = CellType.ONEWAY;
        } else if (cell.buttonId !== undefined) {
            cell.type = CellType.BUTTON;
            cell.buttonPressed = false;
        } else if (cell.barrierId !== undefined) {
            cell.type = cell.barrierKind === 'wall' ? CellType.ACTIVE_WALL : CellType.ACTIVE_BRIDGE;
            cell.barrierActive = false;
        } else if (cell.targetType) {
            cell.type = CellType.TARGET;
        } else {
            cell.type = CellType.EMPTY;
            cell.targetType = undefined;
        }
    }

    // ========== 胜负判定 ==========

    private checkEnd(): void {
        const wc = this.levelCfg.winCondition;
        if (wc && wc.mode === 'clearItem') {
            if (this.clearCount(wc.targetType) >= wc.targetCount) { this.onWin(); return; }
        } else {
            if (this.placedCount >= this.totalItems) { this.onWin(); return; }
        }

        const maxSteps = this.levelCfg.maxSteps ?? null;
        if (maxSteps !== null && this.stepsUsed >= maxSteps) {
            this.onFail();
        }
    }

    private onWin(): void {
        gameState.unlockLevel(this.level + 1);
        this.onResult?.({
            win: true,
            level: this.level,
            steps: this.stepsUsed,
            hasNext: getLevelConfig(this.level + 1) !== null,
        });
    }

    private onFail(): void {
        this.onResult?.({
            win: false,
            level: this.level,
            steps: this.stepsUsed,
            hasNext: false,
        });
    }

    // ========== 绘制辅助 ==========

    private fillRect(g: Graphics, rgb: RGB, x: number, y: number, w: number, rad: number): void {
        g.fillColor = new Color(rgb[0], rgb[1], rgb[2], 255);
        g.roundRect(x, y, w, w, rad);
        g.fill();
    }

    /** 通用格子底：gezi 贴图铺满（未就绪回退浅色），每个格子都先铺这层 */
    private drawBase(node: Node, g: Graphics, cs: number, x: number, y: number, w: number, rad: number): void {
        if (!this.trySprite(node, 'gezi', cs)) this.fillRect(g, C_EMPTY, x, y, w, rad);
    }

    /** 在格子底之上叠一层纯色圆角矩形（子节点）。Graphics 直接画在格子节点上会被子贴图挡住，故单独挂子节点 */
    private fillCellRect(parent: Node, rgb: RGB, x: number, y: number, w: number, rad: number, cs: number): void {
        const n = new Node("cellRect");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(rgb[0], rgb[1], rgb[2], 255);
        g.roundRect(x, y, w, w, rad);
        g.fill();
    }

    /** 可落点高亮：半透明金填充 + 描边，作为最后子节点盖在贴图之上 */
    private addHighlight(parent: Node, cs: number): void {
        const n = new Node("hl");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g = n.addComponent(Graphics);
        const inset = 2;
        const rad = Math.max(4, cs * 0.12);
        g.fillColor = new Color(...C_HIGHLIGHT, 140);
        g.roundRect(-cs / 2 + inset, -cs / 2 + inset, cs - inset * 2, cs - inset * 2, rad);
        g.fill();
        g.lineWidth = 3;
        g.strokeColor = new Color(...C_HIGHLIGHT, 255);
        g.roundRect(-cs / 2 + inset, -cs / 2 + inset, cs - inset * 2, cs - inset * 2, rad);
        g.stroke();
    }

    private drawTargetBorder(g: Graphics, x: number, y: number, w: number, rad: number): void {
        g.lineWidth = 3;
        g.strokeColor = new Color(...C_TARGET_BORDER, 255);
        g.roundRect(x, y, w, w, rad);
        g.stroke();
    }

    private drawGhost(g: Graphics, itemType: ItemType, x: number, y: number, w: number): void {
        if (!itemType) return;
        const rgb = ITEM_COLORS[itemType] || [200, 200, 200];
        const pad = w * 0.3;
        g.fillColor = new Color(rgb[0], rgb[1], rgb[2], 70);
        g.roundRect(x + pad, y + pad, w - pad * 2, w - pad * 2, 8);
        g.fill();
    }

    private drawButtonCell(parent: Node, x: number, y: number, w: number, cs: number): void {
        const n = new Node("btn");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(...C_BUTTON, 255);
        g.circle(x + w / 2, y + w / 2, w * 0.3);
        g.fill();
    }

    private drawPortalRing(g: Graphics, cs: number): void {
        g.lineWidth = 3;
        g.strokeColor = new Color(216, 180, 254, 255);
        g.circle(0, 0, cs * 0.26);
        g.stroke();
    }

    private addCellText(parent: Node, text: string, cs: number, rgb: RGB): void {
        const n = new Node("lab");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const lab = n.addComponent(Label);
        lab.string = text;
        lab.fontSize = Math.max(16, Math.floor(cs * 0.34));
        lab.lineHeight = lab.fontSize + 4;
        lab.isBold = true;
        lab.color = new Color(rgb[0], rgb[1], rgb[2], 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
    }

    /** 数字圆底（num_bg 贴图 + 数字，未就绪回退深色圆） */
    private makeNumBadge(parent: Node, num: number, size: number, px: number, py: number, rgb: RGB): void {
        const badge = new Node("num");
        badge.layer = parent.layer;
        parent.addChild(badge);
        badge.setPosition(px, py, 0);
        badge.addComponent(UITransform).setContentSize(size, size);
        const numSf = NuonuoGame._sfCache.get('num_bg');
        if (numSf) {
            const spr = badge.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = numSf;
        } else {
            const g = badge.addComponent(Graphics);
            g.fillColor = new Color(0, 0, 0, 140);
            g.circle(0, 0, size / 2);
            g.fill();
        }
        const labNode = new Node("lab");
        labNode.layer = badge.layer;
        badge.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(size, size);
        const lab = labNode.addComponent(Label);
        lab.string = `${num}`;
        lab.fontSize = Math.max(14, Math.floor(size * 0.62));
        lab.lineHeight = lab.fontSize + 2;
        lab.isBold = true;
        lab.color = new Color(rgb[0], rgb[1], rgb[2], 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
    }

    /** 在格子角落挂一个 num_bg 数字角标（corner: 'tl' 左上 / 'br' 右下） */
    private addNumBadge(parent: Node, num: number, cs: number, corner: 'tl' | 'br', rgb: RGB): void {
        const size = Math.max(18, cs * 0.34);
        const inset = size / 2 + 2;
        const px = corner === 'br' ? cs / 2 - inset : -cs / 2 + inset;
        const py = corner === 'br' ? -cs / 2 + inset : cs / 2 - inset;
        this.makeNumBadge(parent, num, size, px, py, rgb);
    }

    /** 水洼倒计时：左上角雪花 + 叠在上面的 num_bg 红字计数 */
    private addSnowCount(parent: Node, count: number, cs: number): void {
        const snowSize = Math.max(20, cs * 0.5);
        const px = -cs / 2 + snowSize / 2 + 2;
        const py = cs / 2 - snowSize / 2 - 2;
        const snowSf = NuonuoGame._sfCache.get('snow');
        if (snowSf) {
            const n = new Node("snow");
            n.layer = parent.layer;
            parent.addChild(n);
            n.setPosition(px, py, 0);
            n.addComponent(UITransform).setContentSize(snowSize, snowSize);
            const spr = n.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = snowSf;
        }
        const numSize = Math.max(18, cs * 0.34);
        this.makeNumBadge(parent, count, numSize, px, py, C_RED);
    }

}
