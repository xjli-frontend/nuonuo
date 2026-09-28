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
import { GameConfig } from '../nuonuo/config/GameConfig';
import { PlatHelper } from '../util/PlatHelper';
import { VideoEnum } from '../enum/VideoEnum';
import { SoundManager, SfxName } from './SoundManager';

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

// 关卡背景蒙版：黑色半透明压暗（毛玻璃效果的一部分，压不住背景就调大，挡太多就调小）
const LEVEL_BG_MASK_ALPHA = 30;

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

    // 底部「撤销 / 破冰锤」道具按钮节点（道具数量变化后重绘图标与角标）
    // 【已停用】刷新按钮随源工程 9.21 版下线（底部栏仅 撤销 + 破冰锤），其广告位也从
    // WeChatPlatHelper.videoIds 移除；核心包的 refreshItems / hasAdRefreshLeft 由 sync-core
    // 从源工程同步，本地不再有调用方（NuonuoGame.refresh() 仍保留，供死局兜底复用）
    private undoBtnNode: Node = null;
    private hammerBtnNode: Node = null;

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
        // 音频：挂在 NuonuoApp 节点下（零 prefab，运行时构建）；全场景统一主题 BGM（对齐源工程）
        SoundManager.instance.init(this.node);
        SoundManager.instance.playBgm('theme');
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
        const rankBtn = this.loadFirstSprite(root, "btn_rank", 139, 123, -266, -320, () => this.openRank());
        // 开始 = 续玩：从 maxUnlockedLevel 继续；清完全部关卡后永远停在最后一关
        this.loadFirstSprite(root, "btn_start", 321, 125, 0, -320, () => this.startGame(Math.min(gameState.maxUnlockedLevel, TOTAL_LEVELS)));

        // 每日登录奖励入口（btn_login_award.png）+ 未领取红点
        this.dailyDot = null;
        const dailyBtn = this.loadFirstSprite(root, "btn_login_award", 140, 128, 266, -320, () => this.showDailyRewardPopup());
        if (!this.hasClaimedDaily()) this.dailyDot = this.redDot(dailyBtn, 60, 48);

        // 选关（测试入口，仅浏览器平台显示）
        if (sys.isBrowser) {
            this.btn(root, "btn_select", "选关（测试）", -300, -560, 160, 60, C_BLUE, () => this.showLevelSelect());
        }

        // 左上角金币余额胶囊（对齐源工程 SceneMenu.renderCoinBadge）
        this.coinBadge(root);

        // 设置按钮（右上角）：打开设置弹窗（音乐/音效/震动三开关）
        // 【v0.13.0】原在左上角，为给「金币余额」腾位置移到右上角（对齐源工程）
        this.loadLevelSprite(root, "btn_setting", 85, 79, 330, 610, () => this.showSettingsPopup());

        this.show(root);

        // 微信小游戏：在排行榜按钮位置盖官方「游戏圈」原生按钮（非微信平台空操作）；
        // 按钮是单例，重复调用只重显；进关卡/选关时由对应屏幕隐藏
        PlatHelper.createGameClubButton(rankBtn, true);
    }

    /** 排行榜入口（占位空方法，后续接入开放数据域） */
    private openRank(): void {
        // TODO: 排行榜
    }

    /**
     * 【货币系统】左上角金币余额胶囊（对齐源工程 SceneMenu.renderCoinBadge，图标换 gold.png）。
     * 胶囊宽度按数字位数自适应（图标区 34 + 数字 + 右侧留白 14），数量再多也不溢出；纯展示不可点。
     */
    private coinBadge(parent: Node): Node {
        const text = `${gameState.coins}`;
        const h = 40;
        const numW = Math.max(26, text.length * 17);   // Cocos 无 measureText，按字号近似估宽
        const w = 34 + numW + 14;
        const vs = this.visSize();

        const n = new Node("coinBadge");
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(-vs.width / 2 + 16 + w / 2, vs.height / 2 - 16 - h / 2, 0);
        n.addComponent(UITransform).setContentSize(w, h);

        const g = n.addComponent(Graphics);
        g.fillColor = this.makeColor(C_GOLD, 41);      // rgba(245,197,24,0.16)
        g.roundRect(-w / 2, -h / 2, w, h, h / 2);
        g.fill();
        g.lineWidth = 1.5;
        g.strokeColor = this.makeColor(C_GOLD, 179);   // rgba(245,197,24,0.7)
        g.roundRect(-w / 2, -h / 2, w, h, h / 2);
        g.stroke();

        // 金币图标（gold.png）＋ 数量
        this.loadSprite(n, 'static', 'gold', 28, 28, -w / 2 + 17, 0, null);
        this.label(n, "num", text, 26, -w / 2 + 34 + numW / 2, 1, C_WHITE, numW);
        return n;
    }

    /** 设置弹窗（音乐/音效/震动三开关，对齐源工程 SceneMenu 设置弹窗） */
    private showSettingsPopup(): void {
        // 弹窗叠在菜单上，原生游戏圈按钮仍可点（BlockInputEvents 挡不住原生层），先隐藏
        PlatHelper.GameClubButtonShowHide(false);
        const overlay = new Node("settings");
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
        const panel = this.panel(overlay, "panel", 0, 0, 560, 590, [26, 44, 82]);
        this.label(panel, "title", "设置", 44, 0, 250);

        // 音乐 / 音效 / 震动 三开关（文字随状态刷新）
        const musicBtn = this.btn(panel, "btn_music", "", 0, 145, 440, 76, C_WHITE, () => this.doToggle('music', musicBtn, false), 64);
        const sfxBtn = this.btn(panel, "btn_sfx", "", 0, 50, 440, 76, C_WHITE, () => this.doToggle('sfx', sfxBtn, false), 64);
        const vibBtn = this.btn(panel, "btn_vib", "", 0, -45, 440, 76, C_WHITE, () => this.doToggle('vibration', vibBtn, false), 64);
        this.refreshToggleLabel(musicBtn, 'music');
        this.refreshToggleLabel(sfxBtn, 'sfx');
        this.refreshToggleLabel(vibBtn, 'vibration');

        // 操作模式开关（v0.13.3）：长按拖动（默认）⇄ 点击选择
        const tapBtn = this.btn(panel, "btn_tapMode", "", 0, -140, 440, 76, C_WHITE, () => {
            gameState.toggleTapMode();
            SoundManager.instance.playSfx(gameState.tapMode ? 'toggle_on' : 'toggle_off');
            this.refreshTapModeLabel(tapBtn);
        }, 64);
        this.refreshTapModeLabel(tapBtn);

        // 底部说明
        this.label(panel, "hint", "音乐、音效与震动可分别开关", 22, 0, -230, C_SUBTEXT);

        // 右上角关闭（关弹窗回到菜单，恢复显示游戏圈按钮）
        this.btn(panel, "close", "✕", 250, 255, 56, 56, C_WHITE, () => {
            overlay.destroy();
            PlatHelper.GameClubButtonShowHide(true);
        }, 64);
    }

    // ========== 选关页 ==========

    private showLevelSelect(): void {
        PlatHelper.GameClubButtonShowHide(false);   // 隐藏菜单页的游戏圈原生按钮
        const root = this.newScreen("levelSelect");
        this.fullBg(root, C_MENU_BG);
        this.label(root, "title", "选择关卡", 56, 0, 600);
        this.btn(root, "btn_back", "← 返回", -280, 600, 180, 80, C_GOLD, () => this.showMenu());

        // 5 列网格，纵向滚动展示全部关卡（关卡数随源工程 LevelConfig 变化，按 TOTAL_LEVELS 自适应）
        const cols = 5;
        const cell = 130;
        const gap = 12;
        const gridW = cols * cell + (cols - 1) * gap;          // 698
        const rows = Math.ceil(TOTAL_LEVELS / cols);
        const contentH = rows * cell + (rows - 1) * gap;

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
                    SoundManager.instance.playSfx('ui_tap');
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
        PlatHelper.GameClubButtonShowHide(false);   // 隐藏菜单页的游戏圈原生按钮（会盖在棋盘上）
        const root = this.newScreen("game");

        // 背景：先铺兜底色，再异步加载毛玻璃背景（level_bg 的高斯模糊版）覆盖；模糊版未就绪回退原图
        this.fullBg(root, C_PAGE_BG);
        this.loadFullBgSprite(root, 'level', 'level_bg_blur', ['level', 'level_bg']);
        // 背景蒙版：半透明深色压暗，让棋盘成为视觉焦点（顶板/棋盘在其后添加，渲染在蒙版之上）
        const bgMask = new Node("bgMask");
        bgMask.layer = root.layer;
        root.addChild(bgMask);
        const vsMask = this.visSize();
        bgMask.addComponent(UITransform).setContentSize(vsMask.width, vsMask.height);
        const mg = bgMask.addComponent(Graphics);
        mg.fillColor = this.makeColor([0, 0, 0], LEVEL_BG_MASK_ALPHA);
        mg.rect(-vsMask.width / 2, -vsMask.height / 2, vsMask.width, vsMask.height);
        mg.fill();

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
        game.onSfx = (name) => SoundManager.instance.playSfx(name as SfxName);
        game.onVibrate = (kind) => kind === 'short' ? PlatHelper.vibrateShort() : PlatHelper.vibrateLong();
        game.onHammerModeChange = () => this.updatePropButtons();   // 敲冰中标识随模式刷新
        game.play(level);

        // 底部底板（static_bg）：撤销 / 刷新 / 破冰锤道具按钮
        const bottomPlate = this.loadPlate(root, 590, 168, 0, -515);
        this.undoBtnNode = null;
        this.hammerBtnNode = null;
        this.undoBtnNode = this.makePropButton(bottomPlate, 'undo', -100, 0);
        this.hammerBtnNode = this.makePropButton(bottomPlate, 'hammer', 100, 0);
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
        // 暂停弹窗会盖住棋盘：先放下已拿起的物品，避免恢复后残留悬浮 / 机关停在「开着」的显示（对齐源工程 pause()）
        if (this._game) this._game.dropHeld();
        SoundManager.instance.playSfx('ui_popup');   // 暂停弹窗打开音（对齐源工程 pause()）
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

        this.label(mask, "pauseTxt", "已暂停", 64, 0, 230);
        this.btn(mask, "btn_resume", "继续", 0, 120, 320, 100, C_PRIMARY, () => mask.destroy());
        this.btn(mask, "btn_restart", "重开", 0, 20, 320, 90, C_BLUE, () => {
            mask.destroy();
            this._game.restart();
        });
        // 操作模式开关（v0.13.3）：长按拖动（默认）⇄ 点击选择
        const tapBtn = this.btn(mask, "btn_tapMode", "", 0, -80, 440, 76, C_WHITE, () => {
            gameState.toggleTapMode();
            SoundManager.instance.playSfx(gameState.tapMode ? 'toggle_on' : 'toggle_off');
            // 切回长按拖动时，若正处于「点击拿起」待放置状态 → 立即放下，避免残留悬浮
            if (!gameState.tapMode) this._game.dropHeld();
            this.refreshTapModeLabel(tapBtn);
        }, 64);
        this.refreshTapModeLabel(tapBtn);

        // 音乐 / 音效 / 震动 三开关（对齐源工程暂停弹窗；文字随状态刷新）
        const musicBtn = this.btn(mask, "btn_music", "", -110, -210, 100, 70, C_WHITE, () => this.doToggle('music', musicBtn, true), 77);
        const sfxBtn = this.btn(mask, "btn_sfx", "", 0, -210, 100, 70, C_WHITE, () => this.doToggle('sfx', sfxBtn, true), 77);
        const vibBtn = this.btn(mask, "btn_vib", "", 110, -210, 100, 70, C_WHITE, () => this.doToggle('vibration', vibBtn, true), 77);
        this.refreshToggleLabel(musicBtn, 'music');
        this.refreshToggleLabel(sfxBtn, 'sfx');
        this.refreshToggleLabel(vibBtn, 'vibration');
        this.btn(mask, "btn_back", "返回主页", 0, -330, 320, 90, C_GOLD, () => {
            mask.destroy();
            this.showMenu();
        });
    }

    /** 更新操作模式按钮文字（长按拖动 ✋ / 点击选择 👆，对齐源工程拖拽模式开关） */
    private refreshTapModeLabel(btnNode: Node): void {
        const lab = btnNode.getChildByName("Label")?.getComponent(Label);
        if (lab) lab.string = gameState.tapMode ? '操作：点击选择 👆' : '操作：长按拖动 ✋';
    }

    /** 音乐 / 音效 / 震动开关（pauseMode=true 暂停面板，false 菜单设置弹窗；音效/反馈对齐源工程两处差异） */
    private doToggle(kind: 'music' | 'sfx' | 'vibration', btnNode: Node, pauseMode: boolean): void {
        if (kind === 'music') {
            gameState.toggleMusic();
            SoundManager.instance.onMusicToggle();
            if (pauseMode) {
                // 暂停面板：音乐被关掉时用音效提示（音效还开着才听得到）
                if (!gameState.musicEnabled) SoundManager.instance.playSfx('toggle_off');
            } else {
                // 菜单设置弹窗：音乐被打开时播开音
                if (gameState.musicEnabled) SoundManager.instance.playSfx('toggle_on');
            }
        } else if (kind === 'sfx') {
            gameState.toggleSfx();
            if (gameState.sfxEnabled) SoundManager.instance.playSfx('toggle_on');
        } else {
            gameState.toggleVibration();
            // 打开震动时立即给一次短震，让玩家确认震动功能已开启（关着时 PlatHelper 内部拦截不震）
            PlatHelper.vibrateShort();
        }
        this.refreshToggleLabel(btnNode, kind);
    }

    /** 更新开关按钮文字（音乐：开/关 等） */
    private refreshToggleLabel(btnNode: Node, kind: 'music' | 'sfx' | 'vibration'): void {
        const lab = btnNode.getChildByName("Label")?.getComponent(Label);
        if (!lab) return;
        const on = kind === 'music' ? gameState.musicEnabled : kind === 'sfx' ? gameState.sfxEnabled : gameState.vibrationEnabled;
        const name = kind === 'music' ? '音乐' : kind === 'sfx' ? '音效' : '震动';
        lab.string = `${name} ${on ? '开' : '关'}`;
    }

    // ========== 道具系统（撤销/刷新消耗全局道具 + 看广告补道具 + 每日奖励） ==========

    /** 点击撤销：有道具则扣 1 个并撤销；无道具则本关广告次数内看广告换取（对齐源工程 onUndoClick） */
    private onUndo(): void {
        if (gameState.undoItems > 0) {
            if (this._game.undo()) {
                gameState.useUndoItem();
                this.updatePropButtons();
            }
        } else if (gameState.hasAdUndoLeft) {
            this.requestItemByAd('undo');
        } else {
            SoundManager.instance.playSfx('invalid');
            this.toast('本关看广告换撤销次数已用完');
        }
    }

    /**
     * 【已下线】点击刷新：有道具则扣 1 个并刷新；无道具则本关广告次数内看广告换取。
     * 底部刷新按钮随源工程 9.21 版去掉、微信后台的刷新广告位也已删除，故入口与广告逻辑一并移除。
     * 真要恢复：重新建按钮并把回调接到这里，同时把 VideoEnum.RewardedVideo 与
     * WeChatPlatHelper.videoIds 各补回一个刷新广告位（下标要对齐）。
     */

    /** 点击破冰锤按钮：进入/退出「选择冰块」模式（对齐源工程 onHammerClick） */
    private onHammerClick(): void {
        // 已进入破冰模式 → 再点退出
        if (this._game.hammerMode) {
            this._game.hammerMode = false;
            this.toast('已退出破冰');
            return;
        }
        // 本关没有冰块
        if (!this._game.hasIce()) {
            SoundManager.instance.playSfx('invalid');
            this.toast('本关没有冰块');
            return;
        }
        // 破冰锤用完：本关还有看广告换破冰锤次数 → 弹广告换取（看一次 +1）；用完则提示
        if (gameState.hammerItems <= 0) {
            if (gameState.hasAdHammerLeft) {
                this.requestItemByAd('hammer');
            } else {
                SoundManager.instance.playSfx('invalid');
                this.toast('本关看广告换破冰锤次数已用完');
            }
            return;
        }
        this._game.hammerMode = true;
        this.toast('请点击要敲碎的冰块');
    }

    /** 看广告获取道具：微信走激励视频广告，非微信环境直接放发（对齐 PlatHelper.playVideo 的约定） */
    private requestItemByAd(type: 'undo' | 'hammer'): void {
        const slot = type === 'undo' ? VideoEnum.RewardedVideo.Prop_Undo
            : VideoEnum.RewardedVideo.Prop_Hammer;
        PlatHelper.playVideo((success: boolean) => {
            if (success) {
                this.grantItemByAd(type);
            } else {
                this.toast('未看完广告，未获得道具');
            }
        }, slot);
    }

    /** 广告观看完毕，发放对应道具并记录本关广告次数（撤回+3 / 破冰锤+1，对齐源工程 grantItemByAd） */
    private grantItemByAd(type: 'undo' | 'hammer'): void {
        SoundManager.instance.playSfx('ad_reward');
        if (type === 'undo') {
            gameState.recordAdUndo();    // 记录本关看广告换撤销次数
            gameState.addUndoItems(3);   // 看一次广告获得 3 个撤回道具
            this.toast('已获得撤回道具 ×3');
        } else {
            gameState.recordAdHammer();  // 记录本关看广告换破冰锤次数
            gameState.addHammerItems(1);
            this.toast('已获得破冰锤 ×1');
        }
        this.updatePropButtons();
    }

    /** 刷新撤销/破冰锤道具按钮：有道具显示道具图+数量角标，无道具显示广告按钮 */
    private updatePropButtons(): void {
        if (this.undoBtnNode && this.undoBtnNode.isValid) {
            this.applyPropVisual(this.undoBtnNode, gameState.undoItems, 'btn_cancel');
        }
        if (this.hammerBtnNode && this.hammerBtnNode.isValid) {
            this.applyHammerVisual(this.hammerBtnNode);
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
        // 弹窗叠在菜单上，原生游戏圈按钮仍可点（BlockInputEvents 挡不住原生层），先隐藏
        PlatHelper.GameClubButtonShowHide(false);
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

        // 奖励卡片：撤回×3 / 破冰锤×1（纯展示，不可点击；对齐源工程 DailyRewardManager.REWARD）
        this.rewardCard(panel, -160, 120, 290, 168, "撤回道具", 3);
        this.rewardCard(panel, 160, 120, 290, 168, "破冰锤", 1);

        // 当前背包数量
        this.dailyBagLabel = this.label(panel, "bag", `当前背包：撤回 ${gameState.undoItems} ｜ 破冰锤 ${gameState.hammerItems}`, 22, 0, -84, C_SUBTEXT);

        // 领取奖励（已领 → "已领取"，仍可点击给提示）
        const claimText = this.hasClaimedDaily() ? '已领取' : '领取奖励';
        const claimBtn = this.btn(panel, "claim", claimText, 0, -210, 360, 96, C_PRIMARY, () => this.claimDailyReward());
        this.dailyClaimLabel = claimBtn.getChildByName("Label")?.getComponent(Label);

        // 右上角关闭（关弹窗回到菜单，恢复显示游戏圈按钮）
        this.btn(panel, "close", "✕", 290, 300, 56, 56, C_WHITE, () => {
            overlay.destroy();
            PlatHelper.GameClubButtonShowHide(true);
        }, 64);
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
        gameState.addHammerItems(1);
        SoundManager.instance.playSfx('reward');   // 领取成功音（对齐源工程菜单领取每日奖励）
        this.toast('领取成功！撤回×3、破冰锤×1 已到账');
        this.updatePropButtons();
        // 移除菜单「每日奖励」按钮上的红点（领取后及时刷新，避免残留）
        if (this.dailyDot && this.dailyDot.isValid) {
            this.dailyDot.destroy();
            this.dailyDot = null;
        }
        if (this.dailyClaimLabel && this.dailyClaimLabel.isValid) this.dailyClaimLabel.string = '已领取';
        if (this.dailyBagLabel && this.dailyBagLabel.isValid) this.dailyBagLabel.string = `当前背包：撤回 ${gameState.undoItems} ｜ 破冰锤 ${gameState.hammerItems}`;
    }

    // ========== 结果弹窗 ==========

    private showResult(r: ResultData): void {
        // 步数耗尽但本关还有金币续命次数 → 续命弹窗（对齐源工程 checkStepLimit），不进失败结算
        if (r.stepLimit) {
            this.showStepLimitPopup(r);
            return;
        }
        const overlay = this.makeOverlay("result");
        if (r.win) {
            // 【货币系统】先发金币再建按钮：按钮布局依赖「本次是否真的发了奖励」（对齐源工程 SceneResult.onEnter）
            const coinReward = this.grantLevelCoins(r.level);

            // ===== 挑战成功：result 贴图（底板 + 标题 + 继续按钮），三者拉开间距 =====
            const resultBg = this.loadSprite(overlay, 'result', 'result_bg', 401, 429, 0, 70, null);
            const titleNode = this.loadSprite(overlay, 'result', 'title', 485, 149, 0, 410, null);

            // 金币奖励区：本次到账 / 本关已领过 + 当前余额（让玩家看到到账）
            const coinText = coinReward > 0 ? `+${coinReward} 金币` : '本关金币奖励已领取过';
            const coinNode = coinReward > 0
                ? this.label(overlay, 'coin', coinText, 40, 0, -215, C_GOLD)
                : this.label(overlay, 'coin', coinText, 26, 0, -215, C_SUBTEXT);
            const balanceNode = this.label(overlay, 'coinBalance', `当前金币：${gameState.coins}`, 24, 0, -252, C_SUBTEXT);
            this.swallow([coinNode.node, balanceNode.node]);

            // 看广告翻倍：仅「本次确实发了奖励」+「该关已开放翻倍广告」时出现；
            // 未开放（前 10 关）给一行灰字说明，不留空位也不让玩家以为奖励少了（对齐源工程 v0.13.1）
            let doubleBtn: Node = null;
            if (coinReward > 0) {
                if (this.canShowCoinDoubleAd(r.level)) {
                    doubleBtn = this.btn(overlay, 'btn_coinDouble', `看广告翻倍（+${coinReward}）`, 0, -320, 440, 64, C_GOLD, () => {
                        this.onCoinDoubleClick(overlay, doubleBtn, coinReward);
                    }, 255);
                    this.swallow([doubleBtn]);
                } else {
                    const tip = this.label(overlay, 'coinDoubleHint',
                        `第 ${Math.max(1, GameConfig.COIN_DOUBLE_AD_MIN_LEVEL)} 关起可看广告翻倍`, 22, 0, -320, C_SUBTEXT);
                    this.swallow([tip.node]);
                }
            }

            const continueBtn = this.loadSprite(overlay, 'result', 'btn_continue', 461, 131, 0, -425, null);
            continueBtn.on(Node.EventType.TOUCH_END, (e: any) => {
                e.propagationStopped = true;   // 阻止冒泡到「点击空白返回首页」
                SoundManager.instance.playSfx('ui_tap');
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
            this.label(overlay, 'hint', '点击空白返回首页', 26, 0, -530, C_SUBTEXT);

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

    /**
     * 让一组节点吞掉点击：结果页「点空白返回首页」挂在遮罩上，
     * 直接放在遮罩上的金币文字 / 翻倍按钮如果不停冒泡，点它们会一起触发返回首页。
     */
    private swallow(nodes: Node[]): void {
        nodes.forEach((n) => {
            if (n && n.isValid) n.on(Node.EventType.TOUCH_END, (e: any) => { e.propagationStopped = true; }, this);
        });
    }

    /**
     * 【货币系统】发放通关金币奖励（对齐源工程 SceneResult.grantLevelCoins）。
     * 每关**首次**通关发放 GameConfig.LEVEL_CLEAR_COINS；重复通关不再发放
     * （否则可在最简单的关卡反复刷金币），此时结算页也不显示「翻倍」按钮。
     * @returns 本次实发的金币数（0 = 已领过）
     */
    private grantLevelCoins(level: number): number {
        if (gameState.hasCoinRewardFor(level)) return 0;
        gameState.markCoinReward(level);
        gameState.addCoins(GameConfig.LEVEL_CLEAR_COINS);
        return GameConfig.LEVEL_CLEAR_COINS;
    }

    /**
     * 【v0.13.1】本关是否开放「看广告翻倍」金币奖励。
     * 门槛配置在 GameConfig.COIN_DOUBLE_AD_MIN_LEVEL（默认 11 = 前 10 关不显示翻倍按钮）。
     */
    private canShowCoinDoubleAd(level: number): boolean {
        return level >= Math.max(1, GameConfig.COIN_DOUBLE_AD_MIN_LEVEL);
    }

    /**
     * 点击「看广告翻倍」：微信走激励视频广告，其他环境直接放发（PlatHelper.playVideo 的约定）。
     * 翻倍按钮节点会被替换成「已翻倍领取」文字，避免重复点击。
     */
    private onCoinDoubleClick(overlay: Node, btnNode: Node, coinReward: number): void {
        if (coinReward <= 0) {
            this.toast('本次金币奖励已翻倍领取');
            return;
        }
        PlatHelper.playVideo((success: boolean) => {
            if (!success) {
                this.toast('未看完广告，未获得翻倍奖励');
                return;
            }
            // 再发一份等额金币 = 双倍
            gameState.addCoins(coinReward);
            SoundManager.instance.playSfx('reward');
            this.toast(`翻倍成功！额外获得 ${coinReward} 金币`);
            if (btnNode && btnNode.isValid) btnNode.destroy();
            if (overlay && overlay.isValid) {
                const done = this.label(overlay, 'coinDoubled', `已翻倍领取（+${coinReward * 2} 金币）`, 24, 0, -320, C_GOLD);
                this.swallow([done.node]);
            }
        }, VideoEnum.RewardedVideo.Coin_Double);
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
     * 消耗金币买步数、价格逐次递增（GameConfig.STEP_RESCUE_COSTS），次数用尽即走失败结算。
     */
    private showStepLimitPopup(r: ResultData): void {
        SoundManager.instance.playSfx('ui_popup');   // 续命弹窗打开音（对齐源工程）
        const overlay = this.makeOverlay("stepLimit");

        const cost = gameState.nextStepRescueCost;
        const steps = GameConfig.STEP_RESCUE_STEPS;
        const afford = gameState.canAfford(cost);

        // 面板（源工程 #1a1a2e）
        const panel = this.panel(overlay, "panel", 0, 0, 560, 470, [26, 26, 46]);
        this.label(panel, "title", "步数耗尽", 44, 0, 196, C_GOLD);
        this.label(panel, "sub", `消耗 ${cost} 金币，再获得 ${steps} 步继续挑战`, 26, 0, 142, C_SUBTEXT);

        // 金币余额 + 本关剩余续命次数（金币图标 gold.png）
        this.loadSprite(panel, 'static', 'gold', 42, 42, -158, 86, null);
        this.label(panel, "balance", `${gameState.coins}  ｜  本关还可续命 ${gameState.stepRescueLeft} 次`, 26, 20, 86, C_GOLD, 320);
        if (!afford) {
            this.label(panel, "lack", `金币不足，还差 ${cost - gameState.coins}`, 26, 0, 32, [232, 96, 96]);
        }

        // 底部两个并排按钮（对齐源工程 createStepLimitButtons：左=重试，右=花金币买步数）
        this.btn(panel, "btn_retry", "重试", -118, -70, 220, 84, C_BLUE, () => {
            overlay.destroy();
            this._game.restart();
        }, 200);

        // 金币续命按钮（整块可点；金币不足时压暗提示）
        const buyBtn = new Node("btn_buySteps");
        buyBtn.layer = panel.layer;
        panel.addChild(buyBtn);
        buyBtn.setPosition(118, -70, 0);
        buyBtn.addComponent(UITransform).setContentSize(220, 84);
        const bg = buyBtn.addComponent(Graphics);
        bg.fillColor = this.makeColor(C_PRIMARY, afford ? 255 : 120);
        bg.roundRect(-110, -42, 220, 84, 16);
        bg.fill();
        this.loadSprite(buyBtn, 'static', 'gold', 36, 36, -74, 0, null);
        this.label(buyBtn, "buyText", `${cost} +${steps}步`, 24, 22, 0, C_WHITE, 140);
        buyBtn.on(Node.EventType.TOUCH_END, () => {
            SoundManager.instance.playSfx('ui_tap');
            this.buyExtraSteps(overlay, cost);
        }, this);
        this.pressScale(buyBtn);

        // 右上角关闭 = 放弃续命 → 清掉续命弹窗内容，原地转成失败结算（源工程 abandonAndGoHome）
        this.btn(panel, "close", "✕", 250, 196, 56, 56, C_WHITE, () => {
            overlay.removeAllChildren();
            this.buildFailUi(overlay, r);
        }, 64);
    }

    /**
     * 金币续命：扣金币 + 补步数（对齐源工程 buyExtraSteps）。
     * 金币不足时不扣费、保持弹窗；成功则关弹窗继续挑战。
     */
    private buyExtraSteps(overlay: Node, cost: number): void {
        if (!gameState.canAfford(cost)) {
            SoundManager.instance.playSfx('invalid');
            this.toast(`金币不足，还差 ${cost - gameState.coins} 金币`);
            return;
        }
        gameState.spendCoins(cost);
        gameState.recordStepRescue();
        this._game.addSteps(GameConfig.STEP_RESCUE_STEPS);
        SoundManager.instance.playSfx('reward');
        overlay.destroy();
        this.toast(`消耗 ${cost} 金币，步数 +${GameConfig.STEP_RESCUE_STEPS}`);
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
            n.on(Node.EventType.TOUCH_END, () => {
                SoundManager.instance.playSfx('ui_tap');
                cb();
            }, this);
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
     * fallback：主图加载失败时回退的 [目录, 文件名]（如毛玻璃背景未导入时回退原图）。
     */
    private loadFullBgSprite(parent: Node, folder: string, name: string, fallback: [string, string] | null = null): Node {
        const n = new Node(name);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(0, 0, 0);
        n.addComponent(UITransform);
        const put = (sf: SpriteFrame) => {
            if (!n.isValid) return;
            // sizeMode 默认 TRIMMED：按 spriteFrame 原始尺寸渲染，节点尺寸由 Sprite 自动同步
            const spr = n.addComponent(Sprite);
            spr.spriteFrame = sf;
        };
        resources.load(`nuonuo/${folder}/${name}/spriteFrame`, SpriteFrame, (err, sf) => {
            if (err || !sf) {
                if (fallback) {
                    resources.load(`nuonuo/${fallback[0]}/${fallback[1]}/spriteFrame`, SpriteFrame, (err2, sf2) => {
                        if (!err2 && sf2) put(sf2);
                    });
                }
                return;
            }
            put(sf);
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

    /** 创建道具按钮容器（撤销/破冰锤）：固定尺寸+点击+缩放，内容由 applyPropVisual/applyHammerVisual 重绘 */
    private makePropButton(parent: Node, kind: 'undo' | 'hammer', x: number, y: number): Node {
        const n = new Node(`btn_${kind}`);
        n.layer = parent.layer;
        parent.addChild(n);
        n.setPosition(x, y, 0);
        n.addComponent(UITransform).setContentSize(120, 123);
        n.on(Node.EventType.TOUCH_END, () => {
            SoundManager.instance.playSfx('ui_tap');
            if (kind === 'undo') this.onUndo();
            else this.onHammerClick();
        }, this);
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

    /** 重绘破冰锤按钮：btn_hammer 贴图（与撤销/刷新同 loadSprite 管线，无占位）；有道具 → 数量角标；无道具 → 广告图标；敲冰中 → 黄描边标识（对齐源工程「敲冰中」文字） */
    private applyHammerVisual(node: Node): void {
        node.removeAllChildren();
        this.loadSprite(node, 'level', 'btn_hammer', 120, 123, 0, 0, null);
        if (gameState.hammerItems > 0) {
            this.numBadge(node, gameState.hammerItems, 48, 50);
        } else {
            this.loadSprite(node, 'static', 'btn_video', 44, 44, 48, 50, null);
        }
        if (this._game && this._game.hammerMode) {
            const ring = new Node("ring");
            ring.layer = node.layer;
            node.addChild(ring);
            ring.addComponent(UITransform).setContentSize(120, 123);
            const rg = ring.addComponent(Graphics);
            rg.lineWidth = 3;
            rg.strokeColor = new Color(...C_GOLD, 255);
            rg.roundRect(-60, -62, 120, 123, 16);
            rg.stroke();
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

        n.on(Node.EventType.TOUCH_END, () => {
            SoundManager.instance.playSfx('ui_tap');
            cb();
        }, this);
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
