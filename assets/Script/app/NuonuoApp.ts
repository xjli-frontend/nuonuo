/**
 * 「挪挪」屏幕管理器（NuonuoApp）
 *
 * 【通俗说明】复刻原挪挪收纳屋的完整表现流程，全部运行时代码构建、零 prefab 依赖：
 *   菜单页 → 选关页 → 关卡 → 结果弹窗，去掉原框架的 loading 进度条。
 * 配色/布局对齐原版 `GameConfig.ts`，关卡玩法复用 NuonuoGame（棋盘渲染 + 两步点选移动）。
 *
 * 挂在 Canvas 下的全屏根节点上，由 Main 静态引入并调用 boot() 进入菜单。
 */
import {
    _decorator, Component, Node, Label, Graphics, Color, UITransform,
    ScrollView, Mask, UIOpacity, tween, BlockInputEvents,
} from 'cc';
const { ccclass } = _decorator;

import NuonuoGame, { HudData, ResultData } from '../hall/NuonuoGame';
import { gameState } from '../nuonuo/core/GameState';
import { TOTAL_LEVELS } from '../nuonuo/config/LevelConfig';

type RGB = [number, number, number];

// ========== 原版配色（挪挪收纳屋 GameConfig.ts） ==========
const C_MENU_BG: RGB = [15, 52, 96];        // #0f3460
const C_PAGE_BG: RGB = [22, 33, 62];        // #16213e
const C_PRIMARY: RGB = [233, 69, 96];       // #e94560
const C_GOLD: RGB = [245, 197, 24];         // #f5c518
const C_GREEN: RGB = [46, 204, 113];        // #2ecc71
const C_BLUE: RGB = [59, 130, 246];         // 选关按钮
const C_LOCKED: RGB = [51, 61, 76];         // 未解锁关卡
const C_SUBTEXT: RGB = [170, 180, 200];     // 副标题/次级文字
const C_WHITE: RGB = [255, 255, 255];

// ========== 布局（设计分辨率 768×1344） ==========
const SCREEN_W = 768;
const SCREEN_H = 1344;
const HUD_H = 90;
const BAR_H = 112;

// ========== 功能开关 ==========
/**
 * 选关页是否允许选择未解锁关卡。
 *  true  = 测试模式：任意关卡都能点进去（未解锁的仍灰显）
 *  false = 正式流程：只能选已解锁（level <= maxUnlockedLevel）的关卡
 */
const SELECT_ALLOW_LOCKED = true;

@ccclass('NuonuoApp')
export default class NuonuoApp extends Component {

    private _screen: Node = null;
    private _game: NuonuoGame = null;

    // HUD 顶栏三处文字（随每次重绘刷新）
    private hudLevel: Label = null;
    private hudSteps: Label = null;
    private hudProgress: Label = null;

    // ========== 入口 ==========

    public boot(): void {
        this.showMenu();
    }

    // ========== 屏幕切换 ==========

    private newScreen(name: string): Node {
        const n = new Node(name);
        n.layer = this.node.layer;
        n.addComponent(UITransform).setContentSize(SCREEN_W, SCREEN_H);
        return n;
    }

    private show(root: Node): void {
        if (this._screen && this._screen.isValid) this._screen.destroy();
        this._screen = root;
        this.node.addChild(root);
    }

    // ========== 菜单页 ==========

    private showMenu(): void {
        const root = this.newScreen("menu");
        this.fullBg(root, C_MENU_BG);

        this.label(root, "title", "挪挪收纳箱", 84, 0, 430);
        this.label(root, "subtitle", "拖拽物品归位，享受整理治愈", 30, 0, 350, C_SUBTEXT);
        this.label(root, "unlocked", `已解锁 ${gameState.maxUnlockedLevel} 关`, 28, 0, 180, C_GOLD);

        this.btn(root, "btn_start", `第 ${gameState.maxUnlockedLevel} 关`, 0, 60, 380, 112, C_PRIMARY, () => this.startGame(gameState.maxUnlockedLevel));
        this.btn(root, "btn_select", "选择关卡（测试）", 0, -80, 380, 96, C_BLUE, () => this.showLevelSelect());
        this.btn(root, "btn_sound", "音效", 0, -210, 300, 84, C_GOLD, () => {
            gameState.toggleSound();
            this.toast(gameState.soundEnabled ? "音效：开" : "音效：关");
        });

        this.label(root, "footer", "v1.0 - 纯玩法 Demo", 22, 0, -560, C_SUBTEXT);

        this.show(root);
    }

    // ========== 选关页 ==========

    private showLevelSelect(): void {
        const root = this.newScreen("levelSelect");
        this.fullBg(root, C_MENU_BG);
        this.label(root, "title", "选择关卡", 56, 0, 600);
        this.btn(root, "btn_back", "← 返回", -280, 600, 180, 80, C_GOLD, () => this.showMenu());

        // 5 列网格，纵向滚动展示全部 100 关
        const cols = 5;
        const cell = 130;
        const gap = 12;
        const gridW = cols * cell + (cols - 1) * gap;          // 698
        const rows = Math.ceil(TOTAL_LEVELS / cols);            // 20
        const contentH = rows * cell + (rows - 1) * gap;        // 2828

        const content = this.makeScroll(root, 0, -20, gridW + 20, 1080, gridW, contentH);

        const maxUnlocked = gameState.maxUnlockedLevel;
        for (let i = 0; i < TOTAL_LEVELS; i++) {
            const lv = i + 1;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = -gridW / 2 + cell / 2 + col * (cell + gap);
            const y = -cell / 2 - row * (cell + gap);
            const unlocked = lv <= maxUnlocked;
            const c = this.levelCell(content, lv, unlocked, x, y, cell);
            // 未解锁关卡：测试模式（SELECT_ALLOW_LOCKED）下也可点，正式流程则拦截
            if (unlocked || SELECT_ALLOW_LOCKED) {
                c.on(Node.EventType.TOUCH_END, () => this.startGame(lv), this);
            }
        }

        this.show(root);
    }

    // ========== 关卡页 ==========

    private startGame(level: number): void {
        const root = this.newScreen("game");
        this.fullBg(root, C_PAGE_BG);

        // 顶部 HUD 条：左「第 X 关」/ 中「步数」/ 右「进度」
        const hud = this.bar(root, "hud", 0, SCREEN_H / 2 - HUD_H / 2, SCREEN_W, HUD_H, 77);
        this.hudLevel = this.label(hud, "lv", "", 30, -260, 0, C_WHITE, 220);
        this.hudSteps = this.label(hud, "steps", "", 30, 0, 0, C_WHITE, 220);
        this.hudProgress = this.label(hud, "prog", "", 30, 260, 0, C_WHITE, 220);

        // 棋盘（NuonuoGame 自绘，位于屏幕中上部）
        const gameNode = new Node("game");
        gameNode.layer = root.layer;
        root.addChild(gameNode);
        gameNode.setPosition(0, 40, 0);
        const game = gameNode.addComponent(NuonuoGame);
        this._game = game;
        game.onHud = (h) => this.updateHud(h);
        game.onTip = (t) => this.toast(t);
        game.onResult = (r) => this.showResult(r);
        game.play(level);

        // 底部按钮栏：暂停 / 撤销 / 刷新 / 道具 / 重开
        const bar = this.bar(root, "bottombar", 0, -(SCREEN_H / 2 - BAR_H / 2), SCREEN_W, BAR_H, 77);
        const labels = ["暂停", "撤销", "刷新", "道具", "重开"];
        const actions: Array<() => void> = [
            () => this.pauseGame(),
            () => this._game.undo(),
            () => this._game.restart(),
            () => this.toast("道具未实现"),
            () => this._game.restart(),
        ];
        const bw = 128, bh = 84, gap = 16;
        const total = labels.length * bw + (labels.length - 1) * gap;
        const startX = -total / 2 + bw / 2;
        for (let i = 0; i < labels.length; i++) {
            this.btn(bar, `btn_${i}`, labels[i], startX + i * (bw + gap), 0, bw, bh, C_PRIMARY, actions[i]);
        }

        this.show(root);
    }

    private updateHud(h: HudData): void {
        if (this.hudLevel) this.hudLevel.string = `第 ${h.level} 关`;
        if (this.hudSteps) this.hudSteps.string = `步数 ${h.steps}${h.maxSteps !== null ? `/${h.maxSteps}` : ''}`;
        if (this.hudProgress) this.hudProgress.string = `进度 ${h.placed}/${h.total}`;
    }

    private pauseGame(): void {
        if (!this._screen) return;
        const mask = new Node("pauseMask");
        mask.layer = this._screen.layer;
        this._screen.addChild(mask);
        mask.setPosition(0, 0, 0);
        mask.addComponent(UITransform).setContentSize(SCREEN_W, SCREEN_H);
        const g = mask.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 150);
        g.rect(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_W, SCREEN_H);
        g.fill();
        mask.addComponent(BlockInputEvents);

        this.label(mask, "pauseTxt", "已暂停", 64, 0, 160);
        this.btn(mask, "btn_resume", "继续", 0, -40, 320, 110, C_PRIMARY, () => mask.destroy());
        this.btn(mask, "btn_back", "返回主页", 0, -180, 320, 90, C_GOLD, () => {
            mask.destroy();
            this.showMenu();
        });
    }

    // ========== 结果弹窗 ==========

    private showResult(r: ResultData): void {
        const overlay = new Node("result");
        overlay.layer = this.node.layer;
        this.node.addChild(overlay);
        overlay.setPosition(0, 0, 0);
        overlay.addComponent(UITransform).setContentSize(SCREEN_W, SCREEN_H);
        const g = overlay.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 179); // rgba(0,0,0,0.7)
        g.rect(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_W, SCREEN_H);
        g.fill();
        overlay.addComponent(BlockInputEvents);

        const win = r.win;
        this.label(overlay, "title", win ? "通关成功！" : "关卡无法完成", 64, 0, 240, win ? C_GREEN : C_PRIMARY);
        this.label(overlay, "moves", `共移动 ${r.steps} 次`, 32, 0, 130, C_WHITE);
        this.label(overlay, "refresh", "刷新 0 次", 32, 0, 70, C_WHITE);

        const primaryText = win ? (r.hasNext ? "下一关" : "通关啦") : "重试";
        this.btn(overlay, "btn_primary", primaryText, 0, -60, 360, 110, C_PRIMARY, () => {
            overlay.destroy();
            if (win && r.hasNext) this.startGame(r.level + 1);
            else this.startGame(r.level);
        });
        this.btn(overlay, "btn_select", "选关", -130, -230, 240, 84, C_WHITE, () => {
            overlay.destroy();
            this.showLevelSelect();
        }, 64);
        this.btn(overlay, "btn_home", "主页", 130, -230, 240, 84, C_WHITE, () => {
            overlay.destroy();
            this.showMenu();
        }, 77);
    }

    // ========== UI 构建助手 ==========

    private makeColor(rgb: RGB, alpha = 255): Color {
        return new Color(rgb[0], rgb[1], rgb[2], alpha);
    }

    private fullBg(parent: Node, rgb: RGB): Node {
        const n = new Node("bg");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(0, 0, 0);
        n.addComponent(UITransform).setContentSize(SCREEN_W, SCREEN_H);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(rgb);
        g.rect(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_W, SCREEN_H);
        g.fill();
        return n;
    }

    private bar(parent: Node, name: string, x: number, y: number, w: number, h: number, alpha: number): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], alpha);
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        return n;
    }

    private label(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, rgb: RGB = C_WHITE, w = 700): Label {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, fontSize + 16);
        const lab = n.addComponent(Label);
        lab.string = text;
        lab.fontSize = fontSize;
        lab.lineHeight = fontSize + 10;
        lab.isBold = true;
        lab.color = this.makeColor(rgb);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        return lab;
    }

    private btn(parent: Node, name: string, text: string, x: number, y: number, w: number, h: number, bg: RGB, cb: () => void, alpha = 255): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(bg, alpha);
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.fill();

        const labNode = new Node("Label");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(w, h);
        const lab = labNode.addComponent(Label);
        lab.string = text;
        lab.fontSize = Math.max(24, Math.floor(h * 0.4));
        lab.lineHeight = lab.fontSize + 6;
        lab.isBold = true;
        lab.color = new Color(255, 255, 255, 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;

        n.on(Node.EventType.TOUCH_END, () => cb(), this);
        return n;
    }

    private levelCell(parent: Node, lv: number, unlocked: boolean, x: number, y: number, size: number): Node {
        const n = new Node(`lv_${lv}`);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(size, size);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(unlocked ? C_PRIMARY : C_LOCKED);
        g.roundRect(-size / 2, -size / 2, size, size, 12);
        g.fill();

        const labNode = new Node("Label");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(size, size);
        const lab = labNode.addComponent(Label);
        lab.string = `${lv}`;
        lab.fontSize = 40;
        lab.isBold = true;
        lab.color = this.makeColor(unlocked ? C_WHITE : C_SUBTEXT);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        return n;
    }

    private makeScroll(parent: Node, x: number, y: number, viewW: number, viewH: number, contentW: number, contentH: number): Node {
        const scroll = new Node("scroll");
        scroll.layer = parent.layer;
        parent.addChild(scroll);
        scroll.setPosition(x, y, 0);
        scroll.addComponent(UITransform).setContentSize(viewW, viewH);
        const mask = scroll.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        const sv = scroll.addComponent(ScrollView);
        sv.horizontal = false;
        sv.vertical = true;
        sv.inertia = true;
        sv.elastic = true;

        const content = new Node("content");
        content.layer = parent.layer;
        scroll.addChild(content);
        const cut = content.addComponent(UITransform);
        cut.setAnchorPoint(0.5, 1);
        cut.setContentSize(contentW, contentH);
        sv.content = content;
        return content;
    }

    private toast(text: string): void {
        const n = new Node("toast");
        n.layer = this.node.layer;
        this.node.addChild(n);
        n.setPosition(0, 220, 0);
        n.addComponent(UITransform).setContentSize(440, 68);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 180);
        g.roundRect(-220, -34, 440, 68, 16);
        g.fill();

        const labNode = new Node("Label");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(440, 68);
        const lab = labNode.addComponent(Label);
        lab.string = text;
        lab.fontSize = 30;
        lab.isBold = true;
        lab.color = new Color(255, 255, 255, 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;

        const op = n.addComponent(UIOpacity);
        tween(op).delay(0.9).to(0.5, { opacity: 0 }).call(() => n.destroy()).start();
    }
}
