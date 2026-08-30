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
    Sprite, SpriteFrame, resources, Tween, v3, sys, view, Size,
} from 'cc';
const { ccclass } = _decorator;

import NuonuoGame, { HudData, ResultData } from './NuonuoGame';
import { gameState } from '../nuonuo/core/GameState';
import { getStorageAdapter } from '../nuonuo/core/Storage';
import { TOTAL_LEVELS } from '../nuonuo/config/LevelConfig';
import { PlatHelper } from '../util/PlatHelper';
import { VideoEnum } from '../enum/VideoEnum';

type RGB = [number, number, number];

// ========== 原版配色（挪挪收纳屋 GameConfig.ts） ==========
const C_MENU_BG: RGB = [15, 52, 96];        // #0f3460
const C_PAGE_BG: RGB = [22, 33, 62];        // #16213e
const C_PRIMARY: RGB = [233, 69, 96];       // #e94560
const C_GOLD: RGB = [245, 197, 24];         // #f5c518
const C_BLUE: RGB = [59, 130, 246];         // 选关按钮
const C_SUBTEXT: RGB = [170, 180, 200];     // 副标题/次级文字
const C_WHITE: RGB = [255, 255, 255];
const C_BROWN: RGB = [135, 94, 45];        // #875E2D 关卡界面文字/数字统一色

// ========== 布局（设计分辨率 768×1344，布局坐标按设计稿写死） ==========
// 全屏底板/遮罩不按设计分辨率铺，统一用 view.getVisibleSize()（见 visSize）：
// 真机宽高比与设计分辨率不同时可见区会扩展，固定 768×1344 会铺不满留边。

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

    // 底部「撤销 / 刷新」道具按钮节点（道具数量变化后重绘图标与角标）
    private undoBtnNode: Node = null;
    private refreshBtnNode: Node = null;

    // 每日奖励弹窗内的「领取按钮 / 当前背包」文字（领取后刷新）
    private dailyClaimLabel: Label = null;
    private dailyBagLabel: Label = null;

    // 菜单「每日奖励」按钮上的红点（领取后移除，避免残留）
    private dailyDot: Node = null;

    // ========== 入口 ==========

    public boot(): void {
        // 兜底重读存档：引擎预览里模块求值顺序不保证，GameState 可能早于存储适配器注入就被
        // 构造（读到内存空存档）；此刻 Main 的首个 import（NuonuoBootstrap）必已执行，重读拿真实存档
        gameState.reload();
        this.showMenu();
    }

    // ========== 屏幕切换 ==========

    private newScreen(name: string): Node {
        const n = new Node(name);
        n.layer = this.node.layer;
        const vs = this.visSize();
        n.addComponent(UITransform).setContentSize(vs.width, vs.height);
        return n;
    }

    private show(root: Node): void {
        if (this._screen && this._screen.isValid) this._screen.destroy();
        this._screen = root;
        this.node.addChild(root);
    }

    /** 当前可见区域尺寸（设计坐标，随屏幕宽高比动态变化），全屏底板/遮罩按它铺满 */
    private visSize(): Size {
        return view.getVisibleSize();
    }

    // ========== 菜单页 ==========

    private showMenu(): void {
        const root = this.newScreen("menu");

        // 背景：先铺原版底色兜底，再异步加载 first_bg.jpg 贴图覆盖（未就绪回退纯色）
        this.fullBg(root, C_MENU_BG);
        this.loadFullBgSprite(root, 'first', 'first_bg');

        // 同一行三按钮：排行榜(左) · 开始(中) · 每日奖励(右)
        this.loadFirstSprite(root, "btn_rank", 139, 123, -266, -320, () => this.openRank());
        // 开始 = 续玩：从 maxUnlockedLevel 继续（通关自动 +1；选关点选会直接设为所选关卡）
        this.loadFirstSprite(root, "btn_start", 321, 125, 0, -320, () => this.startGame(gameState.maxUnlockedLevel));

        // 每日登录奖励入口（btn_login_award.png）+ 未领取红点
        this.dailyDot = null;
        const dailyBtn = this.loadFirstSprite(root, "btn_login_award", 140, 128, 266, -320, () => this.showDailyRewardPopup());
        if (!this.hasClaimedDaily()) this.dailyDot = this.redDot(dailyBtn, 60, 48);

        // 选关（测试入口，仅浏览器平台显示）
        if (sys.isBrowser) {
            this.btn(root, "btn_select", "选关（测试）", -300, -560, 160, 60, C_BLUE, () => this.showLevelSelect());
        }

        this.show(root);
    }

    /** 排行榜入口（占位空方法，后续接入开放数据域） */
    private openRank(): void {
        // TODO: 排行榜
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
                c.on(Node.EventType.TOUCH_END, () => {
                    // 选关即记录进度（直接写 maxUnlockedLevel）：刷新游戏后「开始」仍回到这关
                    gameState.setUnlockedLevel(lv);
                    this.startGame(lv);
                }, this);
            }
        }

        this.show(root);
    }

    // ========== 关卡页 ==========

    private startGame(level: number): void {
        const root = this.newScreen("game");

        // 背景：先铺兜底色，再异步加载 level_bg.jpg 覆盖（未就绪回退纯色）
        this.fullBg(root, C_PAGE_BG);
        this.loadFullBgSprite(root, 'level', 'level_bg');

        // 顶部底板（static_bg 九宫格）：剩余物品/关卡信息；设置按钮放左上角
        const topPlate = this.loadPlate(root, 620, 110, 0, 515);
        this.hudLevel = this.label(topPlate, "lv", "", 30, -200, 0, C_BROWN, 200);
        this.hudSteps = this.label(topPlate, "steps", "", 30, -30, 0, C_BROWN, 200);
        this.hudProgress = this.label(topPlate, "prog", "", 30, 170, 0, C_BROWN, 200);
        this.loadLevelSprite(root, "btn_setting", 85, 79, -330, 610, () => this.pauseGame());

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

        // 底部底板（static_bg）：撤销 / 刷新道具按钮
        const bottomPlate = this.loadPlate(root, 590, 168, 0, -515);
        this.undoBtnNode = null;
        this.refreshBtnNode = null;
        this.undoBtnNode = this.makePropButton(bottomPlate, 'undo', -140, 0);
        this.refreshBtnNode = this.makePropButton(bottomPlate, 'refresh', 140, 0);
        this.updatePropButtons();

        this.show(root);
    }

    private updateHud(h: HudData): void {
        if (this.hudLevel) this.hudLevel.string = `第 ${h.level} 关`;
        if (this.hudSteps) this.hudSteps.string = `步数：${h.steps}${h.maxSteps !== null ? `/${h.maxSteps}` : ''}`;
        if (this.hudProgress) this.hudProgress.string = `剩余物品：${h.total - h.placed}`;
    }

    private pauseGame(): void {
        if (!this._screen) return;
        const mask = new Node("pauseMask");
        mask.layer = this._screen.layer;
        this._screen.addChild(mask);
        mask.setPosition(0, 0, 0);
        const vs = this.visSize();
        mask.addComponent(UITransform).setContentSize(vs.width, vs.height);
        const g = mask.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 150);
        g.rect(-vs.width / 2, -vs.height / 2, vs.width, vs.height);
        g.fill();
        mask.addComponent(BlockInputEvents);

        this.label(mask, "pauseTxt", "已暂停", 64, 0, 160);
        this.btn(mask, "btn_resume", "继续", 0, -40, 320, 110, C_PRIMARY, () => mask.destroy());
        this.btn(mask, "btn_restart", "重开", 0, -180, 320, 90, C_BLUE, () => {
            mask.destroy();
            this._game.restart();
        });
        this.btn(mask, "btn_back", "返回主页", 0, -300, 320, 90, C_GOLD, () => {
            mask.destroy();
            this.showMenu();
        });
    }

    // ========== 道具系统（撤销/刷新消耗全局道具 + 看广告补道具 + 每日奖励） ==========

    /** 点击撤销：有道具则扣 1 个并撤销；无道具则引导看广告 */
    private onUndo(): void {
        if (gameState.undoItems > 0) {
            if (this._game.undo()) {
                gameState.useUndoItem();
                this.updatePropButtons();
            }
        } else {
            this.requestItemByAd('undo');
        }
    }

    /** 点击刷新：有道具则扣 1 个并刷新；无道具则引导看广告 */
    private onRefresh(): void {
        if (gameState.refreshItems > 0) {
            gameState.useRefreshItem();
            this._game.refresh();
            this.updatePropButtons();
            this.toast(`已刷新，剩余刷新道具 ${gameState.refreshItems} 个`);
        } else {
            this.requestItemByAd('refresh');
        }
    }

    /** 看广告获取道具：微信走激励视频广告，非微信环境直接放发（对齐 PlatHelper.playVideo 的约定） */
    private requestItemByAd(type: 'undo' | 'refresh'): void {
        const slot = type === 'undo' ? VideoEnum.RewardedVideo.Prop_Undo : VideoEnum.RewardedVideo.Prop_Refresh;
        PlatHelper.playVideo((success: boolean) => {
            if (success) {
                this.grantItemByAd(type);
            } else {
                this.toast('未看完广告，未获得道具');
            }
        }, slot);
    }

    /** 广告观看完毕，发放对应道具（撤回+3 / 刷新+1，对齐原版 grantItemByAd） */
    private grantItemByAd(type: 'undo' | 'refresh'): void {
        if (type === 'undo') {
            gameState.addUndoItems(3);
            this.toast('已获得撤回道具 ×3');
        } else {
            gameState.addRefreshItems(1);
            this.toast('已获得刷新道具 ×1');
        }
        this.updatePropButtons();
    }

    /** 刷新撤销/刷新道具按钮：有道具显示道具图+数量角标，无道具显示广告按钮 */
    private updatePropButtons(): void {
        if (this.undoBtnNode && this.undoBtnNode.isValid) {
            this.applyPropVisual(this.undoBtnNode, gameState.undoItems, 'btn_cancel');
        }
        if (this.refreshBtnNode && this.refreshBtnNode.isValid) {
            this.applyPropVisual(this.refreshBtnNode, gameState.refreshItems, 'btn_refresh');
        }
    }

    // ========== 每日登录奖励 ==========

    private todayStr(): string {
        const d = new Date();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
        return `${d.getFullYear()}-${pad(m)}-${pad(day)}`;
    }

    private hasClaimedDaily(): boolean {
        try {
            const saved = getStorageAdapter().getItem('nuonuo_daily_reward');
            if (saved) return JSON.parse(saved).lastClaimDate === this.todayStr();
        } catch (e) { /* 忽略 */ }
        return false;
    }

    /** 每日登录奖励弹窗（对齐源工程：仅「领取奖励」可点击，奖励卡片为纯展示） */
    private showDailyRewardPopup(): void {
        const overlay = new Node("dailyReward");
        overlay.layer = this.node.layer;
        this.node.addChild(overlay);
        overlay.setPosition(0, 0, 0);
        const vs = this.visSize();
        overlay.addComponent(UITransform).setContentSize(vs.width, vs.height);
        const g = overlay.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 140); // rgba(0,0,0,0.55)
        g.rect(-vs.width / 2, -vs.height / 2, vs.width, vs.height);
        g.fill();
        overlay.addComponent(BlockInputEvents);

        // 面板（源工程 #1a2c52）
        const panel = this.panel(overlay, "panel", 0, 0, 640, 680, [26, 44, 82]);
        this.label(panel, "title", "每日登录奖励", 44, 0, 290);
        this.label(panel, "sub", "每天登录可领一次", 26, 0, 238, C_SUBTEXT);

        // 奖励卡片：撤回×3 / 刷新×3（纯展示，不可点击）
        this.rewardCard(panel, -160, 120, 290, 168, "撤回道具", 3);
        this.rewardCard(panel, 160, 120, 290, 168, "刷新道具", 3);

        // 当前背包数量
        this.dailyBagLabel = this.label(panel, "bag", `当前背包：撤回 ${gameState.undoItems} ｜ 刷新 ${gameState.refreshItems}`, 22, 0, -84, C_SUBTEXT);

        // 领取奖励（已领 → "已领取"，仍可点击给提示）
        const claimText = this.hasClaimedDaily() ? '已领取' : '领取奖励';
        const claimBtn = this.btn(panel, "claim", claimText, 0, -210, 360, 96, C_PRIMARY, () => this.claimDailyReward());
        this.dailyClaimLabel = claimBtn.getChildByName("Label")?.getComponent(Label);

        // 右上角关闭
        this.btn(panel, "close", "✕", 290, 300, 56, 56, C_WHITE, () => overlay.destroy(), 64);
    }

    /** 单张奖励卡片（名称/数量，纯展示，不可点击） */
    private rewardCard(parent: Node, x: number, y: number, w: number, h: number, name: string, count: number): void {
        const n = new Node("card");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor([255, 255, 255], 26);   // rgba(255,255,255,0.10)
        g.roundRect(-w / 2, -h / 2, w, h, 12);
        g.fill();
        g.lineWidth = 1;
        g.strokeColor = this.makeColor([255, 255, 255], 31); // rgba(255,255,255,0.12)
        g.roundRect(-w / 2, -h / 2, w, h, 12);
        g.stroke();

        this.label(n, "name", name, 24, 0, 34, C_WHITE);
        this.label(n, "count", `×${count}`, 40, 0, -34, C_GOLD);
    }

    private claimDailyReward(): void {
        if (this.hasClaimedDaily()) {
            this.toast('明天再来领取奖励吧');
            return;
        }
        try {
            getStorageAdapter().setItem('nuonuo_daily_reward', JSON.stringify({ lastClaimDate: this.todayStr() }));
        } catch (e) { /* 忽略 */ }
        gameState.addUndoItems(3);
        gameState.addRefreshItems(3);
        this.toast('领取成功！撤回×3、刷新×3 已到账');
        this.updatePropButtons();
        // 移除菜单「每日奖励」按钮上的红点（领取后及时刷新，避免残留）
        if (this.dailyDot && this.dailyDot.isValid) {
            this.dailyDot.destroy();
            this.dailyDot = null;
        }
        if (this.dailyClaimLabel && this.dailyClaimLabel.isValid) this.dailyClaimLabel.string = '已领取';
        if (this.dailyBagLabel && this.dailyBagLabel.isValid) this.dailyBagLabel.string = `当前背包：撤回 ${gameState.undoItems} ｜ 刷新 ${gameState.refreshItems}`;
    }

    // ========== 结果弹窗 ==========

    private showResult(r: ResultData): void {
        // 步数耗尽但本关还有看广告加步数次数 → 续命弹窗（对齐源工程 checkStepLimit），不进失败结算
        if (r.stepLimit) {
            this.showStepLimitPopup(r);
            return;
        }
        const overlay = this.makeOverlay("result");
        if (r.win) {
            // ===== 挑战成功：result 贴图（底板 + 标题 + 继续按钮），三者拉开间距 =====
            const resultBg = this.loadSprite(overlay, 'result', 'result_bg', 401, 429, 0, 20, null);
            const titleNode = this.loadSprite(overlay, 'result', 'title', 485, 149, 0, 360, null);

            const continueBtn = this.loadSprite(overlay, 'result', 'btn_continue', 461, 131, 0, -305, null);
            continueBtn.on(Node.EventType.TOUCH_END, (e: any) => {
                e.propagationStopped = true;   // 阻止冒泡到「点击空白返回首页」
                overlay.destroy();
                if (r.hasNext) this.startGame(r.level + 1);   // 继续游戏 → 下一关
                else this.showMenu();
            }, this);
            this.pressScale(continueBtn);

            // 三个 UI（底板 / 标题）吞掉点击，避免点它们触发「返回首页」（继续按钮已自行 stopPropagation）
            [resultBg, titleNode].forEach((n) => {
                n.on(Node.EventType.TOUCH_END, (e: any) => { e.propagationStopped = true; }, this);
            });

            // 继续按钮下方的提示文本
            this.label(overlay, 'hint', '点击空白返回首页', 26, 0, -415, C_SUBTEXT);

            // 点击空白返回首页
            overlay.on(Node.EventType.TOUCH_END, () => {
                overlay.destroy();
                this.showMenu();
            }, this);
        } else {
            // ===== 挑战失败：文字 + 重试 / 选关 / 主页 =====
            this.buildFailUi(overlay, r);
        }
    }

    /** 全屏半透明遮罩（结果 / 续命弹窗共用），带 BlockInputEvents 吞掉下层点击 */
    private makeOverlay(name: string): Node {
        const overlay = new Node(name);
        overlay.layer = this.node.layer;
        this.node.addChild(overlay);
        overlay.setPosition(0, 0, 0);
        const vs = this.visSize();
        overlay.addComponent(UITransform).setContentSize(vs.width, vs.height);
        const g = overlay.addComponent(Graphics);
        g.fillColor = this.makeColor([0, 0, 0], 178); // 约 70% 不透明蒙版（255×0.7≈178）
        g.rect(-vs.width / 2, -vs.height / 2, vs.width, vs.height);
        g.fill();
        overlay.addComponent(BlockInputEvents);
        return overlay;
    }

    /** 挑战失败结算内容（重试 / 选关 / 主页），画在传入的遮罩上；失败结算与「放弃续命」共用 */
    private buildFailUi(overlay: Node, r: ResultData): void {
        this.label(overlay, "title", "关卡无法完成", 64, 0, 240, C_PRIMARY);
        this.label(overlay, "moves", `共移动 ${r.steps} 次`, 32, 0, 130, C_WHITE);
        this.label(overlay, "refresh", `使用刷新道具 ${gameState.levelRefreshSpent} 个`, 32, 0, 70, C_WHITE);
        this.btn(overlay, "btn_primary", "重试", 0, -60, 360, 110, C_PRIMARY, () => {
            overlay.destroy();
            this.startGame(r.level);
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

    /**
     * 步数耗尽续命弹窗（对齐源工程 checkStepLimit / createStepLimitButtons / renderStepLimitPopup）：
     * 「看广告 +5步」按钮用 btn_video 贴图放大 + 文字，剩余次数实时显示；「放弃」进失败结算
     */
    private showStepLimitPopup(r: ResultData): void {
        const overlay = this.makeOverlay("stepLimit");

        // 面板（源工程 #1a1a2e）
        const panel = this.panel(overlay, "panel", 0, 0, 560, 440, [26, 26, 46]);
        this.label(panel, "title", "步数耗尽！", 44, 0, 180, C_GOLD);
        this.label(panel, "sub", "看广告获得额外5步继续挑战", 26, 0, 128, C_SUBTEXT);
        this.label(panel, "hint", `本关还可看广告 ${gameState.adStepsLeft} 次`, 26, 0, 78, C_GOLD);

        // 看广告按钮：与「放弃」同款圆角底板（白色半透明），btn_video 小图 + 「看广告 +5步」文字同一个按钮，整块可点
        const adBtn = new Node("btn_video");
        adBtn.layer = panel.layer;
        panel.addChild(adBtn);
        adBtn.setPosition(0, -50, 0);
        adBtn.addComponent(UITransform).setContentSize(320, 84);
        const ag = adBtn.addComponent(Graphics);
        ag.fillColor = this.makeColor(C_WHITE, 77);   // 与放弃按钮一致 rgba(255,255,255,0.3)
        ag.roundRect(-160, -42, 320, 84, 16);
        ag.fill();
        this.loadSprite(adBtn, 'static', 'btn_video', 44, 45, -88, 0, null);
        this.label(adBtn, "adText", "看广告 +5步", 30, 28, 0, C_WHITE, 190);
        adBtn.on(Node.EventType.TOUCH_END, () => this.watchAdForSteps(overlay), this);
        this.pressScale(adBtn);

        // 放弃 → 清掉续命弹窗内容，原地转成失败结算（源工程 giveUpLevel）
        this.btn(panel, "btn_giveup", "放弃", 0, -158, 320, 84, C_WHITE, () => {
            overlay.removeAllChildren();
            this.buildFailUi(overlay, r);
        }, 77);
    }

    /** 看广告续命：微信走激励视频（预留广告位），其余环境直接发放；观看完毕记录次数并 +5步（对齐源工程 watchAdForSteps） */
    private watchAdForSteps(overlay: Node): void {
        PlatHelper.playVideo((success: boolean) => {
            if (success) {
                gameState.recordAdStep();
                this._game.addSteps(5);
                overlay.destroy();
                this.toast(`看广告续命 +5步（本关剩余 ${gameState.adStepsLeft} 次）`);
            } else {
                this.toast('未看完广告，未获得步数');
            }
        }, VideoEnum.RewardedVideo.Prop_Steps);
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
        const vs = this.visSize();
        n.addComponent(UITransform).setContentSize(vs.width, vs.height);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(rgb);
        g.rect(-vs.width / 2, -vs.height / 2, vs.width, vs.height);
        g.fill();
        return n;
    }

    /** 从 resources/nuonuo/{folder}/{name} 异步加载贴图并显示（给定尺寸/位置，可选点击回调）；加载完成前为空节点（背景有纯色兜底） */
    private loadSprite(parent: Node, folder: string, name: string, w: number, h: number, x: number, y: number, cb: (() => void) | null): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        const uITransform = n.addComponent(UITransform);
        uITransform.setContentSize(w, h);
        if (cb) {
            n.on(Node.EventType.TOUCH_END, () => cb(), this);
            this.pressScale(n);
        }
        // 注意按 spriteFrame 子资源加载：nuonuo/ 下有 auto-atlas 自动图集，
        // 打包后 PNG 不再输出独立 texture 子资源（只剩指向图集的 spriteFrame）
        resources.load(`nuonuo/${folder}/${name}/spriteFrame`, SpriteFrame, (err, sf) => {
            if (err || !sf || !n.isValid) return;
            const spr = n.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = sf;
        });
        return n;
    }

    /**
     * 全屏背景大图：按贴图原始尺寸居中显示（first_bg / level_bg），不做拉伸。
     * 图片尺寸以实际资源为准（后续会调整图片）：画布只露出中心部分，超出部分由屏幕两侧裁掉。
     */
    private loadFullBgSprite(parent: Node, folder: string, name: string): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(0, 0, 0);
        n.addComponent(UITransform);
        resources.load(`nuonuo/${folder}/${name}/spriteFrame`, SpriteFrame, (err, sf) => {
            if (err || !sf || !n.isValid) return;
            // sizeMode 默认 TRIMMED：按 spriteFrame 原始尺寸渲染，节点尺寸由 Sprite 自动同步
            const spr = n.addComponent(Sprite);
            spr.spriteFrame = sf;
        });
        return n;
    }

    /** 菜单页贴图（resources/nuonuo/first/） */
    private loadFirstSprite(parent: Node, name: string, w: number, h: number, x: number, y: number, cb: (() => void) | null): Node {
        return this.loadSprite(parent, 'first', name, w, h, x, y, cb);
    }

    /** 关卡页贴图（resources/nuonuo/level/） */
    private loadLevelSprite(parent: Node, name: string, w: number, h: number, x: number, y: number, cb: (() => void) | null): Node {
        return this.loadSprite(parent, 'level', name, w, h, x, y, cb);
    }

    /** 顶部/底部底板：static_bg 九宫格贴图（SLICED 拉伸，适配任意宽度），未就绪回退透明 */
    private loadPlate(parent: Node, w: number, h: number, x: number, y: number): Node {
        const n = new Node("plate");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        resources.load('nuonuo/static/static_bg/spriteFrame', SpriteFrame, (err, sf) => {
            if (err || !sf || !n.isValid) return;
            // 九宫格四边（来自 static_bg.png.meta 的 border，贴图直接包 SpriteFrame 不携带，需手动补上）
            sf.insetLeft = 191;
            sf.insetRight = 191;
            sf.insetTop = 64;
            sf.insetBottom = 64;
            const spr = n.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.type = Sprite.Type.SLICED;
            spr.spriteFrame = sf;
        });
        return n;
    }

    /** 创建道具按钮容器（撤销/刷新）：固定尺寸+点击+缩放，内容由 applyPropVisual 重绘 */
    private makePropButton(parent: Node, kind: 'undo' | 'refresh', x: number, y: number): Node {
        const n = new Node(`btn_${kind}`);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(120, 123);
        n.on(Node.EventType.TOUCH_END, kind === 'undo' ? () => this.onUndo() : () => this.onRefresh(), this);
        this.pressScale(n);
        return n;
    }

    /** 重绘道具按钮内容：道具图永远显示；有道具 → 右上角 num_bg 数量角标；无道具 → 广告图标替换该角标（数字隐藏） */
    private applyPropVisual(node: Node, count: number, propImage: string): void {
        node.removeAllChildren();
        this.loadSprite(node, 'level', propImage, 120, 123, 0, 0, null);
        if (count > 0) {
            this.numBadge(node, count, 48, 50);
        } else {
            this.loadSprite(node, 'static', 'btn_video', 44, 44, 48, 50, null);
        }
    }

    /** 在父节点上放一个「圆底(num_bg) + 棕色数字」角标，返回数字 Label 便于刷新计数 */
    private numBadge(parent: Node, num: number, x: number, y: number): Label {
        const n = new Node("badge");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        const size = 44;
        n.addComponent(UITransform).setContentSize(size, size);

        // 圆底贴图 num_bg（直接用 Sprite；不再画黑色兜底，否则 Graphics 会和 Sprite 同节点冲突导致贴图不显示）
        resources.load('nuonuo/level/num_bg/spriteFrame', SpriteFrame, (err, sf) => {
            if (err || !sf || !n.isValid) return;
            const spr = n.addComponent(Sprite);
            spr.sizeMode = Sprite.SizeMode.CUSTOM;
            spr.spriteFrame = sf;
        });

        const labNode = new Node("Label");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(size, size);
        const lab = labNode.addComponent(Label);
        lab.string = `${num}`;
        lab.fontSize = 22;
        lab.isBold = true;
        lab.color = this.makeColor(C_BROWN);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        return lab;
    }

    /** 圆角面板（可指定底色 + 白色细描边，用于弹窗面板） */
    private panel(parent: Node, name: string, x: number, y: number, w: number, h: number, rgb: RGB): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(w, h);
        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(rgb);
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.fill();
        g.lineWidth = 1;
        g.strokeColor = this.makeColor([255, 255, 255], 31);
        g.roundRect(-w / 2, -h / 2, w, h, 16);
        g.stroke();
        return n;
    }

    /** 红点标记（未领取提示，画在按钮右上角），返回节点便于领取后移除 */
    private redDot(parent: Node, x: number, y: number): Node {
        const n = new Node("dot");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(20, 20);
        const g = n.addComponent(Graphics);
        g.fillColor = new Color(255, 77, 79, 255); // #ff4d4f
        g.circle(0, 0, 8);
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
        this.pressScale(n);
        return n;
    }

    /** 给按钮节点绑定「按下缩放」手感（按下缩到 0.9，松手/取消回弹 1.0），所有按钮统一走这里 */
    private pressScale(n: Node): void {
        const down = () => {
            Tween.stopAllByTarget(n);
            tween(n).to(0.06, { scale: v3(0.9, 0.9, 1) }).start();
        };
        const up = () => {
            Tween.stopAllByTarget(n);
            tween(n).to(0.1, { scale: v3(1, 1, 1) }).start();
        };
        n.on(Node.EventType.TOUCH_START, down, this);
        n.on(Node.EventType.TOUCH_END, up, this);
        n.on(Node.EventType.TOUCH_CANCEL, up, this);
    }

    private levelCell(parent: Node, lv: number, unlocked: boolean, x: number, y: number, size: number): Node {
        const n = new Node(`lv_${lv}`);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(size, size);

        // 格子底：棋盘默认格子贴图 gezi 铺满整格（Sprite），不再画 Graphics 圆角块；
        // 未解锁用灰色调把贴图压暗
        const spr = n.addComponent(Sprite);
        spr.sizeMode = Sprite.SizeMode.CUSTOM;
        spr.color = this.makeColor(unlocked ? C_WHITE : [120, 120, 120]);
        resources.load('nuonuo/gezi/spriteFrame', SpriteFrame, (err, sf) => {
            if (err || !sf || !n.isValid) return;
            spr.spriteFrame = sf;
        });

        const labNode = new Node("Label");
        labNode.layer = n.layer;
        n.addChild(labNode);
        labNode.addComponent(UITransform).setContentSize(size, size);
        const lab = labNode.addComponent(Label);
        lab.string = `${lv}`;
        lab.fontSize = 40;
        lab.isBold = true;
        // gezi 底是浅米色（#ffdeab），数字改深色才看得清；未解锁整体变灰
        lab.color = this.makeColor(unlocked ? C_BROWN : C_SUBTEXT);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        this.pressScale(n);
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
