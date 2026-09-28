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
    Sprite, SpriteFrame, resources, log, UIOpacity, tween,
} from 'cc';
const { ccclass } = _decorator;

import { Board } from '../nuonuo/systems/Board';
import { PathCalculator } from '../nuonuo/systems/PathCalculator';
import { gameState } from '../nuonuo/core/GameState';
import { GameConfig } from '../nuonuo/config/GameConfig';
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
    /** 步数耗尽但本关还有金币续命次数 → 宿主弹「花金币加步数」续命弹窗（非最终失败结算） */
    stepLimit?: boolean;
}

@ccclass('NuonuoGame')
export default class NuonuoGame extends Component {

    private board: Board = null;
    private pathCalc: PathCalculator = null;
    private levelCfg: LevelConfig = null;
    private level: number = 1;

    // 本地 HUD 计数（步数/撤销由本层自管，通关进度交给 gameState 持久化）
    private stepsUsed: number = 0;
    private maxSteps: number | null = null;   // 步数上限（金币续命会动态 +STEP_RESCUE_STEPS，不能直接读 levelCfg）
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
    // 按下位置（棋盘局部坐标）：松手位移小于阈值时判定为「点击拿起」（仅点击模式生效）
    private tapStart: [number, number] = null;
    // 点击模式：已「点击拿起」某物品，浮动预览停在原格上方，等待下一次点击放置
    private _selected: boolean = false;

    // 撤销快照：JSON 深拷贝棋盘 + 本地计数（Board.clone 是浅拷贝，不能用）
    private history: string[] = [];

    // 破冰锤选择模式：true=等待玩家点击一块冰块敲碎（对齐源工程 hammerMode）
    private _hammerMode: boolean = false;

    /** 破冰模式开关（宿主点破冰锤按钮切换；切模式时重绘棋盘刷新冰块高亮） */
    public get hammerMode(): boolean { return this._hammerMode; }
    public set hammerMode(v: boolean) {
        this._hammerMode = v;
        // 进入/退出敲冰模式都会中断进行中的拖拽（对齐源工程）
        this.cancelDrag();
        this.render();
        this.onHammerModeChange?.(v);
    }

    /** 本关当前是否存在可见冰块（宿主点破冰锤按钮时先检测） */
    public hasIce(): boolean {
        return this.board ? this.board.hasAnyIce() : false;
    }

    /**
     * 放下正在「点击拿起」的物品（切回长按拖动 / 暂停 / 强干预前由宿主调用），
     * 否则会残留悬浮预览与「门被压开」的显示。非点击拿起状态时为空操作。
     */
    public dropHeld(): void {
        if (this._selected || this.dragFrom) this.dropHeldItem();
    }

    // 宿主注入的回调（默认空；不注入则静默，保持本类框架无关）
    public onHud: ((h: HudData) => void) | null = null;
    public onResult: ((r: ResultData) => void) | null = null;
    public onTip: ((text: string) => void) | null = null;
    public onSfx: ((name: string) => void) | null = null;                 // 音效（宿主接 SoundManager，名称对齐源工程 AudioManager）
    public onVibrate: ((kind: 'short' | 'long') => void) | null = null;  // 震动（宿主接 PlatHelper，内部尊重震动开关）
    public onHammerModeChange: ((active: boolean) => void) | null = null; // 破冰模式切换（宿主刷新破冰锤按钮的「敲冰中」标识）

    protected onLoad(): void {
        // 提前预加载美术贴图（进程内一次性）；渲染时机由 initLevel 控制（贴图就绪前不渲染）
        this.preloadAssets();
    }

    /** 由宿主调用：进入指定关卡（替代原 onLoad 自动开局） */
    public play(level: number): void {
        this.initLevel(level);
    }

    // ========== 美术资源（挪挪收纳屋原图，resources/nuonuo/） ==========

    private static _sfCache: Map<string, SpriteFrame> = new Map();
    private static _preloadPromise: Promise<void> | null = null;
    private static _preloadDone = false;   // 预加载是否已结束（成功/失败都会置 true，失败走程序化回退）

    /** 预加载全部美术贴图（进程内一次性，重复调用复用同一 Promise） */
    private preloadAssets(): Promise<void> {
        if (NuonuoGame._preloadPromise) return NuonuoGame._preloadPromise;

        // [缓存键, resources/nuonuo/ 下的文件名]
        const entries: Array<[string, string]> = [
            ['dizuo', 'dizuo'],
            ['gezi', 'gezi'],
            ['zhangai', 'zhangai'],
            ['arr', 'arr'],
            ['freeon', 'freeon'],
            ['snow', 'snow'],
            ...Array.from({ length: 5 }, (_, i) => [`portal_${i + 1}`, `portal${i + 1}`] as [string, string]),
            ...Array.from({ length: 9 }, (_, i) => [`item_${i + 1}`, `item_${i + 1}`] as [string, string]),
            ...Array.from({ length: 9 }, (_, i) => [`item_${i + 1}_1`, `item_${i + 1}_1`] as [string, string]),
            // 机关美术：按钮 4 套 + 活动门 4 套（开/关两态），按 id 取模 4 映射（对齐源工程 MAX_MECHANISM_ART）
            ...Array.from({ length: 4 }, (_, i) => [`button_${i + 1}`, `button_${i + 1}`] as [string, string]),
            ...Array.from({ length: 4 }, (_, i) => [
                [`door_${i + 1}_close`, `d${i + 1}_close`] as [string, string],
                [`door_${i + 1}_open`, `d${i + 1}_open`] as [string, string],
            ]).flat(),
            ['boad_bg', 'level/boad_bg'],   // 棋盘九宫格底板
            ['num_bg', 'level/num_bg'],     // 数字圆底（传送门次数 / 水洼倒计时）
        ];

        NuonuoGame._preloadPromise = Promise.all(entries.map(([key, file]) =>
            new Promise<void>(resolve => {
                // 注意按 spriteFrame 子资源加载：nuonuo/ 下有 auto-atlas 自动图集，
                // 打包后 PNG 不再输出独立 texture 子资源（只剩指向图集的 spriteFrame），
                // 按 texture 加载在微信包内会失败（编辑器 asset DB 兼容所以预览正常）。
                resources.load(`nuonuo/${file}/spriteFrame`, SpriteFrame, (err, sf) => {
                    if (!err && sf) NuonuoGame._sfCache.set(key, sf);
                    resolve();
                });
            })
        )).then(() => {
            NuonuoGame._preloadDone = true;
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

    /** 按原图宽高比铺一个非正方形子节点（活动门美术是竖版，不能按格子正方拉伸），返回该节点 */
    private addSpriteRatio(parent: Node, sf: SpriteFrame, height: number, offset: [number, number] = [0, 0], alpha: number = 1): Node {
        const r = sf.rect;
        const ratio = (r && r.height > 0) ? r.width / r.height : 1;
        const n = new Node("spr");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(offset[0], offset[1], 0);
        n.addComponent(UITransform).setContentSize(height * ratio, height);
        const spr = n.addComponent(Sprite);
        spr.sizeMode = Sprite.SizeMode.CUSTOM;
        spr.spriteFrame = sf;
        if (alpha < 1) {
            n.addComponent(UIOpacity).opacity = Math.round(alpha * 255);
        }
        return n;
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
        // 步数上限必须同步回核心包：gameState.canRescueSteps 读的是核心包自己的 data.maxSteps，
        // 而 setLevel → resetLevelState 会把 maxSteps 清成 null。不补这一句它永远是 null，
        // 「步数耗尽 → 花金币加步数」弹窗就永远不会出现（判定直接落到失败结算）。
        gameState.setMaxSteps(cfg.maxSteps ?? null);

        this.stepsUsed = 0;
        this.maxSteps = cfg.maxSteps ?? null;
        this.totalItems = cfg.items.length;
        this.history = [];
        this.dragFrom = null;
        this._selected = false;
        this.tapStart = null;
        this.reachable.clear();
        this.clearDragPreview();
        this.board.clearDragPreview();
        this._hammerMode = false;
        this.onHammerModeChange?.(false);   // 重开/换关退出破冰模式（宿主同步按钮标识；首次 play 时按钮尚未创建，回调是空操作）

        this.ensureUI();
        // 贴图就绪前不渲染棋盘：缓存半满时渲染会出现「gezi 已就绪、物品/地形回退被 gezi 盖住」
        // 的全默认格子中间态；等预加载结束（成功/失败都会 resolve）再渲染，已就绪则立即渲染。
        if (NuonuoGame._preloadDone) {
            this.render();
        } else {
            this.preloadAssets().then(() => {
                if (this.node && this.node.isValid) this.render();
            });
        }

        // 进入关卡音效（对齐源工程 SceneGame 初始化时 playSfx('level_start')）
        this.onSfx?.('level_start');
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
        // 注册触摸前必须先挂 UITransform：引擎触摸排序会读 node._uiProps.uiTransformComp.cameraPriority，
        // 贴图预加载完成前（render 延后执行）无 UITransform 的触摸节点会直接崩溃
        this.boardRoot.addComponent(UITransform);
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
                // 水洼：不铺水贴图，只保留左上角雪花 + 红字倒计时提示（倒计时结束结冰）
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
                this.renderOneway(node, cell, cs, x, y, w, rad);
                break;
            case CellType.BUTTON:
                this.drawButtonCell(node, cell, cs, x, y, w, rad);
                break;
            case CellType.ACTIVE_WALL:
            case CellType.ACTIVE_BRIDGE:
                // 活动墙 / 活动桥统一表现为一扇门（旧关卡数据里两种 type 都保留）
                this.renderDoor(node, cell, cs, x, y, w, rad);
                break;
            case CellType.TARGET:
                this.renderTarget(node, g, cell, cs, x, y, w, rad);
                break;
            case CellType.ITEM:
                // 被物品压住的机关格：cell.type 会变成 ITEM，但 buttonId / barrierId / onewayDir 字段还在。
                // 地形层必须照画（垫在物品之下），否则玩家完全看不到下面有按钮/门（对齐源工程 v0.10.5）。
                if (cell.onewayDir !== undefined) this.renderOneway(node, cell, cs, x, y, w, rad);
                if (cell.buttonId !== undefined) this.drawButtonCell(node, cell, cs, x, y, w, rad);
                if (cell.barrierId !== undefined) this.renderDoor(node, cell, cs, x, y, w, rad);
                this.renderItem(node, g, cell, r, c, cs, x, y, w, rad);
                // 物品压在水洼上：不铺水贴图，在物品层之上叠雪花 + 倒计时提示（角标不被底座盖住）
                if (cell.freezeCounter !== undefined && cell.freezeCounter > 0) {
                    this.addSnowCount(node, cell.freezeCounter, cs);
                }
                // 【v0.10.2】被水洼冻住的物品：物品之上盖一层半透明冰面（保留物品轮廓）
                if (cell.frozen === true) {
                    this.renderFrozenOverlay(node, cs);
                }
                // 【v0.10.5】物品底座几乎盖满整格，压在下面的单向门 / 按钮 / 活动门必须补角标，
                // 否则玩家辨认不出这格下面压着什么（按钮与活动门互斥，只会画一个）
                if (cell.onewayDir !== undefined) this.drawOnewayBadge(node, cell.onewayDir, cs);
                if (cell.buttonId !== undefined) {
                    this.drawMechanismBadge(node, cs, cell.buttonId, cell.buttonPressed === true);
                } else if (cell.barrierId !== undefined) {
                    this.drawMechanismBadge(node, cs, cell.barrierId, cell.barrierActive === true);
                }
                break;
            default: // EMPTY
                break;
        }

        // 水洼覆盖层：目标格 / 传送门上的水（不铺水贴图，只保留雪花 + 红字倒计时）
        if ((cell.type === CellType.TARGET || cell.type === CellType.PORTAL)
            && cell.freezeCounter !== undefined && cell.freezeCounter > 0) {
            this.addSnowCount(node, cell.freezeCounter, cs);
        }

        // 可落点高亮（独立子节点盖在最上层，否则会被 gezi/物品贴图挡住）
        if (this.reachable.has(`${r},${c}`)) {
            this.addHighlight(node, cs);
        }

        // 破冰模式：高亮所有可敲目标（冰块 + 被冰封物品），提示可敲碎（对齐源工程 renderIceHighlights）
        if (this._hammerMode && this.board.canBreakIce(r, c)) {
            this.addIceHighlight(node, cs);
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

    /** 单向门：zhangai 底图 + arr.png 方向箭头（默认指左，按方向旋转；素材缺失回退纯色+文字箭头，对齐源工程 drawOneway） */
    private renderOneway(node: Node, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        if (!this.trySprite(node, 'zhangai', cs)) {
            this.fillCellRect(node, C_ONEWAY, x, y, w, rad, cs);
        }
        // 方向 → 旋转角（Cocos 正角=逆时针；arr.png 默认指左：上=-90、下=+90，右=180）
        const angleMap: Record<string, number> = { left: 0, up: -90, right: 180, down: 90 };
        const angle = angleMap[cell.onewayDir ?? 'left'] ?? 0;
        const arrSf = NuonuoGame._sfCache.get('arr');
        if (arrSf) {
            // 箭头尺寸取格子的 62%，保证完全落在 zhangai 底图内部（对齐源工程）
            const arrowSize = cs * 0.62;
            const n = new Node("arrow");
            n.layer = node.layer;
            node.addChild(n);
            n.addComponent(UITransform).setContentSize(arrowSize, arrowSize);
            const spr = n.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = arrSf;
            n.angle = angle;
        } else {
            this.addCellText(node, ONEWAY_ARROW[cell.onewayDir] ?? '→', cs, C_BROWN);
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
            maxSteps: this.maxSteps,
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
        // 破冰模式：点击冰块敲碎 / 点其他格子提示（不消耗道具），不进入拖拽（对齐源工程）
        if (this._hammerMode) {
            this.cancelDrag();
            this.handleHammerTouch(e);
            return;
        }

        // 点击模式：已「点击拿起」某物品时，本次点击视为放置指令
        // （点回原格 / 点棋盘外 = 放下；点另一个物品 = 切换选中；点可达格 = 落下）
        if (this._selected) {
            this.handlePlacementTap(e);
            return;
        }

        this.dragFrom = null;
        this.reachable.clear();
        this.clearDragPreview();

        // 记录按下位置：松手时位移很小 → 视为「点击拿起」（仅点击模式走 SELECTED 分支）
        this.tapStart = this.touchToBoardPos(e);

        const rc = this.touchToGrid(e);
        if (rc) {
            const [r, c] = rc;
            const cell = this.board.getCell(r, c);
            if (cell && cell.type === CellType.ITEM && !this.board.canDrag(r, c)) {
                // 被冰封的物品：明确反馈（不消耗任何道具，需破冰锤解冻）
                if (this.board.isFrozen(r, c)) {
                    this.onSfx?.('invalid');
                    this.onTip?.('物品被冻住了，用破冰锤敲碎冰块');
                }
            } else if (cell && cell.type === CellType.ITEM && this.board.canDrag(r, c)) {
                this.dragFrom = [r, c];
                // 拿起即释放：拖拽中的物品在机关结算里视为已离开本格
                // → 所压按钮立刻弹起、所连活动门立刻转为「关闭」显示，不必等落地才结算
                this.board.setDragPreview(r, c);
                this.board.recalcButtons();
                // 计算可到达位置（此时门已是关闭态，射线自然穿不过去）
                const reach = this.pathCalc.calculateReachable(r, c);
                reach.forEach(x => this.reachable.add(`${x.row},${x.col}`));
                // 拿起物品音效（无震动，避免拿起/放下频繁打扰，对齐源工程）
                this.onSfx?.('pick');
            }
        }
        // 无论是否选中，都重绘一遍，确保旧的落点高亮被清除
        this.render();
        // 选中后立即生成跟随手指的浮动预览（源格物品已由 render 抽离）
        if (this.dragFrom) this.createDragPreview(e);
    }

    private onTouchMove(e: EventTouch): void {
        // 点击拿着期间预览停在原格上方，不跟随手指
        if (this._selected) return;
        if (!this.dragPreview || !this.dragFrom) return;
        const pos = this.touchToBoardPos(e);
        if (!pos) return;
        this.dragPreview.setPosition(pos[0], pos[1], 0);
    }

    private onTouchEnd(e: EventTouch): void {
        // 点击拿起期间松手不处理（放置靠下一次点击）
        if (this._selected) return;
        if (!this.dragFrom) {
            this.clearDragPreview();
            return;
        }

        // 点击模式：松手位移小于阈值 → 判定为「点击」而非拖动，物品保持拿起状态
        // （不落子、不回弹），可达格持续高亮，等玩家点目标格再放下
        const pos = this.touchToBoardPos(e);
        const threshold = this.cellSize * GameConfig.TAP_MOVE_RATIO;
        const dx = (pos && this.tapStart) ? pos[0] - this.tapStart[0] : Number.MAX_VALUE;
        const dy = (pos && this.tapStart) ? pos[1] - this.tapStart[1] : Number.MAX_VALUE;
        if (gameState.tapMode && dx * dx + dy * dy <= threshold * threshold) {
            this._selected = true;
            this.parkDragPreview(this.dragFrom[0], this.dragFrom[1]);
            this.onTip?.('已拿起物品，点击目标格放下');
            return;
        }

        const from = this.dragFrom;
        const rc = this.touchToGrid(e);
        const canMove = rc && this.pathCalc.canMoveTo(from[0], from[1], rc[0], rc[1]);

        // 先清拖拽状态与预览；成功移动时 doMove 会重绘源格，否则 render 让物品弹回原位
        this.dragFrom = null;
        this.tapStart = null;
        this.reachable.clear();
        this.clearDragPreview();
        // 拖拽结束：撤销「拿起即释放」的临时预览。此刻物品数据仍在原格（真正移动在 doMove 里），
        // 这样移动前的快照才记录真实状态
        this.board.clearDragPreview();

        if (canMove) {
            this.doMove(from[0], from[1], rc[0], rc[1]);
        } else {
            // 物品没动：预览期被「弹起」的按钮要恢复真实状态（物品仍压着 → 门重新打开）
            this.board.recalcButtons();
            this.render(); // 未落到可落点，物品弹回原位
            // 松手在棋盘外视为取消，不播提示音（对齐源工程）
            if (rc) {
                this.onSfx?.('invalid');
                this.onVibrate?.('short');
                // 被挡住：源格 + 目标格轻微抖动，表现「反弹」
                this.shakeCell(from[0], from[1]);
                this.shakeCell(rc[0], rc[1]);
            }
        }
    }

    /**
     * 点击模式下「已拿起物品」时的落点判定（对齐源工程 handlePlacementTap）：
     * - 点棋盘外 / 点回原格 → 放下（取消拿起，不消耗步数）
     * - 点另一个可拖拽物品 → 切换选中（放下当前、拿起新的，不消耗步数）
     * - 点可达格 → 移动落下（消耗 1 步），随后结束拿起状态
     * - 其他位置 → 无效提示（不消耗任何东西），保持拿起状态
     */
    private handlePlacementTap(e: EventTouch): void {
        const rc = this.touchToGrid(e);

        // 点棋盘外 = 放下（与拖动松手到棋盘外一致，视为取消，不播提示音）
        if (!rc) {
            this.dropHeldItem();
            return;
        }

        const [r, c] = rc;

        // 点回原格 = 放下（物品原地未动，不消耗步数）
        if (r === this.dragFrom[0] && c === this.dragFrom[1]) {
            this.dropHeldItem();
            this.onSfx?.('drop');
            return;
        }

        // 点另一个可拖拽物品 = 切换选中
        if (this.board.canDrag(r, c)) {
            this.dragFrom = [r, c];
            // 预览格换到新物品：机关按「新物品已离开原格」重新结算
            this.board.setDragPreview(r, c);
            this.board.recalcButtons();
            this.reachable.clear();
            this.pathCalc.calculateReachable(r, c).forEach(x => this.reachable.add(`${x.row},${x.col}`));
            this.parkDragPreview(r, c);
            this.render();
            this.onSfx?.('pick');
            return;
        }

        // 点可达格 = 移动落下
        if (this.reachable.has(`${r},${c}`)) {
            const from = this.dragFrom;
            this.dragFrom = null;
            this._selected = false;
            this.tapStart = null;
            this.reachable.clear();
            this.clearDragPreview();
            // 与拖动落子一致：先撤销「拿起即释放」预览，移动前的快照才记录真实状态
            this.board.clearDragPreview();
            this.doMove(from[0], from[1], r, c);
            return;
        }

        // 其他位置：无效提示，保持拿起状态（不消耗步数）
        this.onSfx?.('invalid');
        this.onVibrate?.('short');
        if (this.board.isFrozen(r, c)) {
            this.onTip?.('物品被冻住了，用破冰锤敲碎冰块');
        }
    }

    /** 放下已拿起的内容并恢复机关显示（点回原格 / 点棋盘外 / 暂停等强干预前调用） */
    private dropHeldItem(): void {
        this.cancelDrag();
        this.board.recalcButtons();
        this.render();
    }

    /**
     * 中断进行中的拖拽（撤销 / 刷新 / 重开 / 破冰 / 换关等强干预操作前调用）。
     * 除了复位拖拽状态，还必须清掉「拿起即释放」的预览格，
     * 否则活动门会一直停在「关闭」显示上。
     */
    private cancelDrag(): void {
        this.dragFrom = null;
        this._selected = false;
        this.tapStart = null;
        this.reachable.clear();
        this.clearDragPreview();
        if (this.board) this.board.clearDragPreview();
    }

    /**
     * 把浮动预览停在指定格上方（点击拿起时物品悬浮原格，不跟手指）。
     * 切换选中时会重建预览节点，保证显示的是新拿起物品的图标。
     * 调用前需先设好 this.dragFrom。
     */
    private parkDragPreview(r: number, c: number): void {
        this.clearDragPreview();
        const n = this.buildItemPreview(this.cellSize);
        this.node.addChild(n);
        const [x, y] = this.gridToBoardPos(r, c);
        n.setPosition(x, y, 0);
        this.dragPreview = n;
    }

    /** 破冰模式下的点击处理：命中冰块 / 被冰封物品则消耗破冰锤敲碎，否则提示不消耗（对齐源工程 handleHammerTouch） */
    private handleHammerTouch(e: EventTouch): void {
        const rc = this.touchToGrid(e);
        if (!rc) return;
        const [r, c] = rc;
        // 【v0.10.2】可敲目标：整格冰块 或 被冰封的物品（两者都源于水洼结冰）
        if (this.board.canBreakIce(r, c)) {
            const wasFrozenItem = this.board.isFrozen(r, c);
            // 命中：消耗道具 + 敲碎（冰块恢复原机制 / 冰封物品解冻复原）
            gameState.useHammerItem();
            this.board.breakIce(r, c);
            this.board.recalcButtons(); // 恢复的按钮/墙桥态重新结算
            this.onSfx?.('ice');
            this.onVibrate?.('short');
            this._hammerMode = false;
            this.render();
            this.onHammerModeChange?.(false);   // 通知宿主退出敲冰标识
            this.onTip?.(wasFrozenItem ? '已解冻物品' : '已敲碎冰块');
        } else {
            // 非冰块：不消耗道具，保持破冰模式
            this.onSfx?.('invalid');
            this.onTip?.('请点击冰块');
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

    /**
     * 构建物品视觉节点（dizuo 底座 + item_N 图标，未就绪回退色卡），原点在格心，供拖拽预览 / 特效复用。
     * 拖拽预览不垫 xuanzhogn 金底（用户指定去掉）。
     */
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
            this.onSfx?.('invalid');
            this.onVibrate?.('short');
            this.shakeCell(fr, fc);
            this.shakeCell(tr, tc);
            if (this.board.getCell(tr, tc)?.type === CellType.PORTAL) {
                this.onTip?.('传送出口被堵住了');
            }
            return false;
        }

        this.stepsUsed++;
        // 水洼倒计时：每次移动后扣减，归零触发结冰（结冰播 ice 音，对齐源工程）
        const frozen = this.board.tickWaters();
        if (frozen) this.onSfx?.('ice');
        // 机关状态变化播 switch 音（快照对比，变化时才播，对齐源工程 mechSnapshot）
        const mechBefore = this.mechSnapshot();
        this.board.recalcButtons();
        if (this.mechSnapshot() !== mechBefore) this.onSfx?.('switch');

        // 传送门特效：入口吸入（大变小）→ 出口沿行进方向滑出（小变大），动画结束后再重绘与结算
        if (res.teleported && itemType !== undefined) {
            this.onSfx?.('teleport');
            this.checkStepLow();
            this.playTeleportEffect(tr, tc, res.finalRow, res.finalCol, itemType, res.placed);
            return true;
        }

        // 归位（消除）：用 moveItem 返回的 placed 判定——tickWaters 可能已把刚归位的目标格冻成冰块，
        // 事后回读格子 type 会漏判归位，导致盘面清空却永不结算（对齐源工程 v0.10.9）
        const placed = res.placed;
        if (placed && itemType !== undefined) {
            this.onSfx?.('match');
            this.onVibrate?.('short');
            this.playEliminateEffect(res.finalRow, res.finalCol, itemType);
        } else {
            // 普通落位（传送场景已播放传送音，不叠加落位音；无震动，对齐源工程）
            this.onSfx?.('drop');
        }

        this.render();
        this.checkStepLow();
        this.checkEnd();
        return true;
    }

    /** 机关状态快照：所有按钮按下态 + 活动墙/桥激活态（判断一次移动是否改变机关状态，播 switch 音） */
    private mechSnapshot(): string {
        const barriers = this.board.barrierPositions
            .map(([r, c]) => (this.board.isBarrierActive(r, c) ? '1' : '0'))
            .join('');
        const buttons = this.board.buttonPositions
            .map(([r, c]) => (this.board.getCell(r, c)?.buttonPressed ? '1' : '0'))
            .join('');
        return `${barriers}|${buttons}`;
    }

    /** 步数告急提示（剩余 3 步时提示一次，对齐源工程 stepsLeft === 3） */
    private checkStepLow(): void {
        if (this.maxSteps !== null && this.maxSteps - this.stepsUsed === 3) {
            this.onSfx?.('step_low');
        }
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
    private playTeleportEffect(entranceRow: number, entranceCol: number, landRow: number, landCol: number, itemType: ItemType, placed: boolean): void {
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
                        // 动画结束：重绘最终状态；若落点是归位格，接消除特效（音/震对齐普通归位）
                        this.render();
                        if (placed) {
                            this.onSfx?.('match');
                            this.onVibrate?.('short');
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
            this.onSfx?.('invalid');
            this.onTip?.("没有可撤销的步骤");
            return false;
        }
        const o = JSON.parse(s);
        // 撤销会整体换掉 grid：先中断进行中的拖拽，清掉「拿起即释放」的预览格
        this.cancelDrag();
        this.board.grid = o.grid;
        this.stepsUsed = o.stepsUsed;
        this.board.recalcButtons();
        this.render();
        this.onSfx?.('undo');
        return true;
    }

    /** 重开本关：整关重置回初始状态（区别于 refresh 的原地重洗） */
    public restart(): void {
        this.initLevel(this.level);
    }

    /** 步数续命：步数上限 +n（宿主花金币买步数后调用；对齐源工程 buyExtraSteps） */
    public addSteps(n: number): void {
        if (this.maxSteps !== null) {
            this.maxSteps += n;
            // 同步核心包的上限：续命后本关还能再买一次，价格走核心包的 stepRescueUsed，
            // 上限不同步的话核心包读到的仍是旧上限（isStepLimitReached / stepsLeft 会失真）
            gameState.addSteps(n);
            this.updateHud();
        }
    }

    /**
     * 刷新：把所有未归位物品重新随机排列（对齐挪挪收纳屋 SceneGame.refresh）。
     * 规则：同格堆叠不拆散、目标格不动、已归位物品不动、随机分配到可用落点。
     * 纯机制：道具消耗（全局 refreshItems）由宿主 NuonuoApp 处理。
     */
    public refresh(): void {
        // 强干预：先中断进行中的拖拽（否则预览格残留会让机关态卡在「关闭」）
        this.cancelDrag();

        // 第一步：收集所有未归位物品（按堆叠分组，同格物品保持在一起）。
        // 归位物品的格子 cell.type 已是 TARGET（placedCount>0），不会出现在 ITEM 格里。
        const groups: { row: number; col: number; stack: { type: ItemType; layer: number }[] }[] = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board.getCell(r, c);
                if (!cell || cell.type !== CellType.ITEM) continue;
                // 【v0.10.2】被冰封的物品不参与刷新（保持原位，需破冰锤解冻）
                if (this.board.isFrozen(r, c)) continue;
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
                if (cell.type === CellType.ITEM && this.board.isFrozen(r, c)) continue; // 冰封物品的格子不作落点
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
                // 层号必须归一化：moveItem 移走顶层后 stack 里残留 2,3… 的旧层号，
                // 直接沿用会让 canDrag 判 cell.layer !== 1 → 刷新后该物品永久点不动
                cell.layer = 1;
                cell.stack = g.stack.map((it, i) => ({ type: it.type, layer: i + 1 }));
                // 保留 portalId / freezeCounter / targetType 等附加属性（落点若在传送门/水洼/目标格上）
            }
        }

        // 刷新后不能撤销之前的操作；物品位置变化，重新结算按钮与活动墙/桥态
        this.history = [];
        this.board.recalcButtons();
        this.render();
        this.onSfx?.('refresh');
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

        if (this.maxSteps !== null && this.stepsUsed >= this.maxSteps) {
            // 步数耗尽：本关还有金币续命次数 → 弹「消耗金币 +3步」续命弹窗（对齐源工程 checkStepLimit）；
            // 次数用完 → 直接进失败结算
            if (gameState.canRescueSteps) {
                this.onResult?.({
                    win: false,
                    stepLimit: true,
                    level: this.level,
                    steps: this.stepsUsed,
                    hasNext: false,
                });
            } else {
                this.onFail();
            }
        }
    }

    private onWin(): void {
        this.onSfx?.('win');
        this.onVibrate?.('long');
        // 最后一关通关：不再往前解锁，进度停留在最后一关（菜单「开始」永远进最后一关）
        if (getLevelConfig(this.level + 1)) {
            gameState.unlockLevel(this.level + 1);
        }
        this.onResult?.({
            win: true,
            level: this.level,
            steps: this.stepsUsed,
            hasNext: getLevelConfig(this.level + 1) !== null,
        });
    }

    private onFail(): void {
        this.onSfx?.('fail');
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

    /** 破冰模式冰块高亮：黄底 30% + 黄描边，盖在冰块贴图之上（对齐源工程 renderIceHighlights 配色） */
    private addIceHighlight(parent: Node, cs: number): void {
        const n = new Node("hl_ice");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g = n.addComponent(Graphics);
        const inset = 1;
        const rad = Math.max(4, cs * 0.12);
        g.fillColor = new Color(245, 197, 24, 77);
        g.roundRect(-cs / 2 + inset, -cs / 2 + inset, cs - inset * 2, cs - inset * 2, rad);
        g.fill();
        g.lineWidth = 2.5;
        g.strokeColor = new Color(245, 197, 24, 255);
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

    /** 按钮 / 活动门共用 id 的素材套数（button_1~4 ↔ d1~d4），对齐源工程 MAX_MECHANISM_ART */
    private static readonly MAX_MECHANISM_ART = 4;

    /** 配对 id → 素材序号（1 起始，超过 4 套取模循环复用） */
    private static mechArtIndex(id: number | undefined): number {
        if (!id || id < 1) return 0;
        return ((id - 1) % NuonuoGame.MAX_MECHANISM_ART) + 1;
    }

    /**
     * 按钮：优先 button_N 美术（N = buttonId，1~4 循环）。
     * 弹起态 = 整格铺满；按下态 = 整体缩小 + 下沉 + 中心轻压暗
     * （美术只有一张，用变换表达「被踩下去」）。
     * 无素材时回退几何圆钮：弹起圆钮略凸起，按下圆钮下沉变扁。
     */
    private drawButtonCell(parent: Node, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const idx = NuonuoGame.mechArtIndex(cell.buttonId);
        const sf = idx ? NuonuoGame._sfCache.get(`button_${idx}`) : null;
        const pressed = cell.buttonPressed === true;

        if (sf) {
            if (pressed) {
                const size = cs * 0.9;
                const sink = -cs * 0.05;   // Canvas 里是向下沉，Cocos y 轴向上取负
                this.addSprite(parent, sf, size, 0, [0, sink]);
                const n = new Node("dim");
                n.layer = parent.layer;
                parent.addChild(n);
                n.setPosition(0, sink, 0);
                n.addComponent(UITransform).setContentSize(size, size);
                const g = n.addComponent(Graphics);
                g.fillColor = new Color(0, 0, 0, 46);   // rgba(0,0,0,0.18)
                g.circle(0, 0, size * 0.36);
                g.fill();
            } else {
                this.addSprite(parent, sf, cs);
            }
            return;
        }

        // 回退：几何圆钮（按下半径略小、向下偏移，模拟下沉）
        const cx = x + w / 2;
        const cy = y + w / 2;
        const radius = w * (pressed ? 0.26 : 0.30);
        const offsetY = pressed ? -w * 0.04 : 0;
        const n = new Node("btn");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(0, 0, 0, 46);
        g.circle(cx, cy - w * 0.03, w * 0.34);
        g.fill();
        g.fillColor = pressed ? new Color(...C_BUTTON, 255) : new Color(223, 230, 233, 255);
        g.circle(cx, cy + offsetY, radius);
        g.fill();
        this.addCellText(parent, cell.buttonPressed ? '●' : '○', cs, C_BROWN);
    }

    /**
     * 活动门：未激活（按钮弹起）→ dN_close 关门（阻挡通行）；已激活 → dN_open 开门（可通行）。
     * 门美术是竖版（宽:高 ≈ 0.78），按原比例缩放到「格高」并水平居中，避免拉伸变形。
     * 无素材时回退色块：墙=实体/空格，桥=缺口/木板。
     */
    private renderDoor(parent: Node, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const idx = NuonuoGame.mechArtIndex(cell.barrierId);
        const active = cell.barrierActive === true;
        const sf = idx ? NuonuoGame._sfCache.get(`door_${idx}_${active ? 'open' : 'close'}`) : null;

        if (sf) {
            this.addSpriteRatio(parent, sf, cs);
            return;
        }

        if (cell.barrierKind === 'wall') {
            this.fillCellRect(parent, active ? C_EMPTY : C_WALL, x, y, w, rad, cs);
        } else {
            this.fillCellRect(parent, active ? C_BRIDGE : C_BOARD_BG, x, y, w, rad, cs);
        }
    }

    /** 机关配对配色（按钮 / 活动门共用，与源工程 palette 一致，按 id 取模 5） */
    private static readonly MECH_PALETTE: RGB[] = [
        [155, 89, 182], [231, 76, 60], [52, 152, 219], [46, 204, 113], [243, 156, 18],
    ];

    /**
     * 【v0.10.5】物品压住按钮 / 活动门时的配对 id 角标（左上角小圆牌，画在物品之上）：
     * 黑底 + 配对色描边 + 白字 id；激活态（按钮被压住 / 门已开）改用配对色实心 + 白描边，
     * 让玩家一眼看出「这格下面压着哪一对按钮/门，以及它现在是通的」。
     */
    private drawMechanismBadge(parent: Node, cs: number, id: number, active: boolean): void {
        const rgb = NuonuoGame.MECH_PALETTE[id % NuonuoGame.MECH_PALETTE.length];
        const r = cs * 0.17;
        const n = new Node("mechBadge");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(-cs / 2 + r + 2, cs / 2 - r - 2, 0);
        n.addComponent(UITransform).setContentSize(r * 2, r * 2);
        const g = n.addComponent(Graphics);
        g.fillColor = active ? new Color(rgb[0], rgb[1], rgb[2], 255) : new Color(0, 0, 0, 191);
        g.circle(0, 0, r);
        g.fill();
        g.lineWidth = 2;
        g.strokeColor = active ? new Color(255, 255, 255, 255) : new Color(rgb[0], rgb[1], rgb[2], 255);
        g.circle(0, 0, r);
        g.stroke();

        const labNode = new Node("id");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(r * 2, r * 2);
        const lab = labNode.addComponent(Label);
        lab.string = `${id}`;
        lab.fontSize = Math.max(12, Math.floor(r * 1.15));
        lab.lineHeight = lab.fontSize + 2;
        lab.isBold = true;
        lab.color = new Color(255, 255, 255, 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
    }

    /**
     * 单向门方向小角标（物品压住单向门时叠加在物品之上，半透明小箭头居中）。
     * 物品完全盖住底层的 zhangai + arr 组合，不补角标玩家看不出这格是单向门。
     */
    private drawOnewayBadge(parent: Node, dir: string, cs: number): void {
        const angleMap: Record<string, number> = { left: 0, up: -90, right: 180, down: 90 };
        const n = new Node("onewayBadge");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);

        const sf = NuonuoGame._sfCache.get('arr');
        if (sf) {
            const size = cs * 0.32;
            const sn = new Node("arrow");
            sn.layer = n.layer;
            n.addChild(sn);
            sn.addComponent(UITransform).setContentSize(size, size);
            const spr = sn.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = sf;
            sn.angle = angleMap[dir] ?? 0;
            n.addComponent(UIOpacity).opacity = 166;   // 0.65
        } else {
            this.addCellText(n, ONEWAY_ARROW[dir] ?? '→', cs, [230, 126, 34]);
        }
    }

    /**
     * 【v0.10.2】冰封覆盖层：物品被水洼冻住时，在物品之上盖一层半透明冰面。
     * 与冰块视觉呼应（冰面 + 裂纹 + 右上角❄），但保留物品轮廓，让玩家看清「冰里的物品」。
     */
    private renderFrozenOverlay(parent: Node, cs: number): void {
        const n = new Node("frozen");
        n.layer = parent.layer;
        parent.addChild(n);
        n.addComponent(UITransform).setContentSize(cs, cs);
        const half = cs / 2 - cs * 0.07;
        const g = n.addComponent(Graphics);

        // 冰面（半透明浅蓝）
        g.fillColor = new Color(174, 214, 241, 140);   // rgba(174,214,241,0.55)
        g.rect(-half, -half, half * 2, half * 2);
        g.fill();
        g.lineWidth = 2;
        g.strokeColor = new Color(255, 255, 255, 230);
        g.rect(-half, -half, half * 2, half * 2);
        g.stroke();

        // 冰裂纹（从中心向四周 4 条）
        g.lineWidth = 1;
        g.strokeColor = new Color(255, 255, 255, 191);
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4 + 0.3;
            g.moveTo(0, 0);
            g.lineTo(Math.cos(angle) * cs * 0.34, Math.sin(angle) * cs * 0.34);
        }
        g.stroke();

        // 右上角冰晶标记（不遮挡物品主体）
        const markSize = Math.max(18, cs * 0.3);
        const mark = new Node("frozenMark");
        mark.layer = parent.layer;
        parent.addChild(mark);
        mark.setPosition(half - markSize / 2, half - markSize / 2, 0);
        mark.addComponent(UITransform).setContentSize(markSize, markSize);
        const lab = mark.addComponent(Label);
        lab.string = '❄';
        lab.fontSize = Math.max(14, Math.floor(cs * 0.26));
        lab.lineHeight = lab.fontSize + 2;
        lab.isBold = true;
        lab.color = new Color(255, 255, 255, 242);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
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
