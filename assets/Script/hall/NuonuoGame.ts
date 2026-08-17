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
    Sprite, SpriteFrame, Texture2D, resources, log,
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
const C_WATER: RGB = [96, 165, 250];
const C_ICE: RGB = [186, 208, 224];
const C_ONEWAY: RGB = [148, 163, 184];
const C_BUTTON: RGB = [245, 197, 24];
const C_WALL: RGB = [120, 93, 58];
const C_BRIDGE: RGB = [203, 213, 225];
const C_BOARD_BG: RGB = [212, 184, 150]; // #d4b896 原版棋盘木色
const C_HIGHLIGHT: RGB = [255, 215, 0];

const ONEWAY_ARROW: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' };

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

    /** 用指定 SpriteFrame 铺一个正方形子节点（按 inset 内缩，可选中心偏移） */
    private addSprite(parent: Node, sf: SpriteFrame, cs: number, inset: number = 0, offset: [number, number] = [0, 0]): void {
        const n = new Node("spr");
        n.layer = parent.layer;
        parent.addChild(n);
        const s = cs - inset * 2;
        n.setPosition(offset[0], offset[1], 0);
        n.addComponent(UITransform).setContentSize(s, s);
        const spr = n.addComponent(Sprite);
        spr.sizeMode = Sprite.SizeMode.CUSTOM;
        spr.spriteFrame = sf;
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
        // 限制棋盘在 680×720 的可用区域内，格子尺寸夹在 52~118 之间
        this.cellSize = Math.floor(Math.min(680 / this.cols, 720 / this.rows));
        this.cellSize = Math.max(52, Math.min(118, this.cellSize));
    }

    // ========== 渲染 ==========

    private render(): void {
        if (!this.boardRoot) return;
        this.boardRoot.destroyAllChildren();

        const cs = this.cellSize;
        const bw = this.cols * cs;
        const bh = this.rows * cs;
        const uit = this.boardRoot.getComponent(UITransform) || this.boardRoot.addComponent(UITransform);
        uit.setContentSize(bw, bh);

        // 棋盘底板
        const bgNode = new Node("bg");
        bgNode.layer = this.boardRoot.layer;
        this.boardRoot.addChild(bgNode);
        bgNode.addComponent(UITransform).setContentSize(bw, bh);
        const bgG = bgNode.addComponent(Graphics);
        bgG.fillColor = new Color(...C_BOARD_BG, 255);
        bgG.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
        bgG.fill();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.renderCell(r, c, this.board.getCell(r, c), cs);
            }
        }
        this.updateHud();
    }

    private renderCell(r: number, c: number, cell: CellData, cs: number): void {
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

        switch (cell.type) {
            case CellType.OBSTACLE:
                if (!this.trySprite(node, 'zhangai', cs)) this.fillRect(g, C_OBSTACLE, x, y, w, rad);
                break;
            case CellType.WATER:
                this.renderWater(node, g, cs, x, y, w, rad);
                this.addCellText(node, `${cell.freezeCounter ?? ''}`, cs, [255, 255, 255]);
                break;
            case CellType.ICE:
                this.renderIce(node, g, cs, x, y, w, rad);
                break;
            case CellType.PORTAL:
                this.renderPortal(node, g, cell, cs, x, y, w, rad);
                break;
            case CellType.ONEWAY:
                this.fillRect(g, C_ONEWAY, x, y, w, rad);
                this.addCellText(node, ONEWAY_ARROW[cell.onewayDir] ?? '→', cs, [30, 41, 59]);
                break;
            case CellType.BUTTON:
                this.fillRect(g, C_EMPTY, x, y, w, rad);
                this.drawButtonCell(g, x, y, w);
                this.addCellText(node, cell.buttonPressed ? '●' : '○', cs, [133, 94, 12]);
                break;
            case CellType.ACTIVE_WALL:
                this.fillRect(g, cell.barrierActive ? C_EMPTY : C_WALL, x, y, w, rad);
                break;
            case CellType.ACTIVE_BRIDGE:
                this.fillRect(g, cell.barrierActive ? C_BRIDGE : C_BOARD_BG, x, y, w, rad);
                break;
            case CellType.TARGET:
                this.renderTarget(node, g, cell, cs, x, y, w, rad);
                break;
            case CellType.ITEM:
                this.renderItem(node, g, cell, r, c, cs, x, y, w, rad);
                break;
            default: // EMPTY
                if (!this.trySprite(node, 'gezi', cs)) this.fillRect(g, C_EMPTY, x, y, w, rad);
                break;
        }

        // 水洼覆盖层：目标格 / 传送门上的水（附加属性，不改变格子类型）
        if ((cell.type === CellType.TARGET || cell.type === CellType.PORTAL)
            && cell.freezeCounter !== undefined && cell.freezeCounter > 0) {
            this.renderWaterOverlay(node, g, cs, x, y, w);
            this.addCellBadge(node, `${cell.freezeCounter}`, cs, [255, 255, 255]);
        }

        // 可落点高亮（独立子节点盖在最上层，否则会被 gezi/物品贴图挡住）
        if (this.reachable.has(`${r},${c}`)) {
            this.addHighlight(node, cs);
        }
    }

    /** 传送门：portal_N 贴图铺满 + 编号/剩余次数文字 */
    private renderPortal(node: Node, g: Graphics, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const id = cell.portalId ?? 1;
        const key = `portal_${((id - 1) % 5) + 1}`;
        if (this.trySprite(node, key, cs)) {
            this.addCellText(node, `${cell.portalUses ?? ''}`, cs, [255, 255, 255]);
            return;
        }
        this.fillRect(g, [72, 49, 148], x, y, w, rad);
        this.drawPortalRing(g, cs);
        this.addCellText(node, `门${cell.portalId ?? ''}`, cs, [255, 255, 255]);
    }

    /** 目标格：item_N_1 剪影贴图（自带虚线框+剪影）或程序化回退，叠加归位计数 */
    private renderTarget(node: Node, g: Graphics, cell: CellData, cs: number, x: number, y: number, w: number, rad: number): void {
        const id = ITEM_ID[cell.targetType];
        const key = id ? `item_${id}_1` : null;
        if (key && this.trySprite(node, key, cs)) {
            if ((cell.placedCount ?? 0) > 0) {
                this.addCellBadge(node, `×${cell.placedCount}`, cs, [34, 197, 94]);
            }
            return;
        }
        this.fillRect(g, C_EMPTY, x, y, w, rad);
        this.drawTargetBorder(g, x, y, w, rad);
        this.drawGhost(g, cell.targetType, x, y, w);
        this.addCellText(node, ITEM_NAMES[cell.targetType] ?? '?', cs, [120, 90, 50]);
        if ((cell.placedCount ?? 0) > 0) {
            this.addCellBadge(node, `×${cell.placedCount}`, cs, [34, 197, 94]);
        }
    }

    /** 物品：gezi 底 + (选中垫 xuanzhogn) + dizuo 底座 + item_N 图标，或程序化色卡回退 */
    private renderItem(node: Node, g: Graphics, cell: CellData, r: number, c: number, cs: number, x: number, y: number, w: number, rad: number): void {
        // 底层格子
        if (!this.trySprite(node, 'gezi', cs)) this.fillRect(g, C_EMPTY, x, y, w, rad);

        // 拖拽中：源格只画底，物品本体交给跟随手指的浮动预览（避免双份显示）
        if (this.dragFrom && this.dragFrom[0] === r && this.dragFrom[1] === c) {
            return;
        }

        const id = ITEM_ID[cell.itemType];
        const dizuo = id ? NuonuoGame._sfCache.get('dizuo') : null;
        const itemSf = id ? NuonuoGame._sfCache.get(`item_${id}`) : null;

        if (dizuo && itemSf) {
            // 选中态：先垫金黄色高亮底座（xuanzhogn 需垫底）
            if (this.dragFrom && this.dragFrom[0] === r && this.dragFrom[1] === c) {
                this.trySprite(node, 'xuanzhogn', cs);
            }
            const pad = Math.max(4, cs * 0.08);
            this.addSprite(node, dizuo, cs, pad);
            const iconInset = pad + (cs - pad * 2) * 0.15;
            this.addSprite(node, itemSf, cs, iconInset);
        } else {
            this.drawItemCard(g, cell, x, y, w, rad);
            this.addCellText(node, ITEM_NAMES[cell.itemType] ?? '?', cs, [255, 255, 255]);
        }

        if (cell.stack && cell.stack.length > 1) {
            this.addCellBadge(node, `×${cell.stack.length}`, cs, [255, 255, 255]);
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

    /** 水洼：water 贴图铺满（未就绪回退纯色圆角） */
    private renderWater(node: Node, g: Graphics, cs: number, x: number, y: number, w: number, rad: number): void {
        if (!this.trySprite(node, 'water', cs)) this.fillRect(g, C_WATER, x, y, w, rad);
    }

    /** 冰块：freeon 贴图铺满（未就绪回退纯色） */
    private renderIce(node: Node, g: Graphics, cs: number, x: number, y: number, w: number, rad: number): void {
        if (!this.trySprite(node, 'freeon', cs)) this.fillRect(g, C_ICE, x, y, w, rad);
    }

    /** 目标格/传送门上的水洼覆盖层：water 贴图（未就绪回退半透明蓝块） */
    private renderWaterOverlay(node: Node, g: Graphics, cs: number, x: number, y: number, w: number): void {
        if (!this.trySprite(node, 'water', cs)) this.drawWaterOverlay(g, x, y, w);
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
        const n = new Node("dragPreview");
        n.layer = this.node.layer;
        n.addComponent(UITransform).setContentSize(cs, cs);

        const itemType = cell.itemType;
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
        this.history.push(this.snapshot());

        const res = this.board.moveItem(fr, fc, tr, tc);
        if (!res.success) {
            this.history.pop();
            return false;
        }

        this.stepsUsed++;
        this.board.tickWaters();
        this.board.recalcButtons();

        this.render();
        this.checkEnd();
        return true;
    }

    // ========== 撤销 ==========

    private snapshot(): string {
        return JSON.stringify({
            grid: this.board.grid,
            stepsUsed: this.stepsUsed,
        });
    }

    public undo(): void {
        const s = this.history.pop();
        if (!s) {
            this.onTip?.("没有可撤销的步骤");
            return;
        }
        const o = JSON.parse(s);
        this.board.grid = o.grid;
        this.stepsUsed = o.stepsUsed;
        this.board.recalcButtons();
        this.render();
    }

    /** 重开本关（「刷新」按钮也走这里，核心无重洗） */
    public restart(): void {
        this.initLevel(this.level);
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

    private drawItemCard(g: Graphics, cell: CellData, x: number, y: number, w: number, rad: number): void {
        // 底座（浅色）
        g.fillColor = new Color(245, 232, 208, 255);
        g.roundRect(x, y, w, w, rad);
        g.fill();
        // 物品卡片（按类型着色）
        const rgb = ITEM_COLORS[cell.itemType] || [200, 200, 200];
        const pad = w * 0.14;
        g.fillColor = new Color(rgb[0], rgb[1], rgb[2], 255);
        g.roundRect(x + pad, y + pad, w - pad * 2, w - pad * 2, rad * 0.8);
        g.fill();
    }

    private drawButtonCell(g: Graphics, x: number, y: number, w: number): void {
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

    private drawWaterOverlay(g: Graphics, x: number, y: number, w: number): void {
        g.fillColor = new Color(96, 165, 250, 90);
        g.roundRect(x, y, w, w, 8);
        g.fill();
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

    private addCellBadge(parent: Node, text: string, cs: number, rgb: RGB): void {
        const n = new Node("badge");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(cs * 0.32, cs * 0.32, 0);
        n.addComponent(UITransform).setContentSize(cs * 0.4, cs * 0.4);
        const lab = n.addComponent(Label);
        lab.string = text;
        lab.fontSize = Math.max(14, Math.floor(cs * 0.26));
        lab.lineHeight = lab.fontSize + 2;
        lab.isBold = true;
        lab.color = new Color(rgb[0], rgb[1], rgb[2], 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
    }

}
