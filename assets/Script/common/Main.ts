import './NuonuoBootstrap'; // 必须最先导入：先于任何可能拖入 gameState 的模块注入存储适配器
import { _decorator, Camera, Component, find, Game, game, log, Node, UITransform } from 'cc';
const { ccclass } = _decorator;

import NuonuoApp from "../app/NuonuoApp";

@ccclass('Main')
export default class Main extends Component {
    /** 主图层 */
    public static canvas: Node | null = null;

    onLoad() {
        this.initEngine();
        this.initEvents();
        Main.canvas = this.node;
        Main.run();
    }

    /** 初始化引擎 */
    protected initEngine() {
        game.frameRate = 60;
        log(`[Engine] initEngine`);
    }

    /** 初始化事件回调 */
    protected initEvents() {
        game.on(Game.EVENT_SHOW, () => log("cc.game.EVENT_SHOW"));
        game.on(Game.EVENT_HIDE, () => log("cc.game.EVENT_HIDE"));
    }

    static run() {
        // 直接进菜单，不再走框架的 loading 进度条。
        // NuonuoApp 接管全部表现；存储适配器已由首行 import 的 NuonuoBootstrap 先行注入。
        const canvas = Main.canvas || find("Canvas");
        if (!canvas) return;
        const appNode = new Node("NuonuoApp");
        appNode.layer = canvas.layer;
        canvas.addChild(appNode);
        appNode.addComponent(UITransform).setContentSize(768, 1344);
        appNode.addComponent(NuonuoApp).boot();
    }

    /** 主相机（大厅/UI 使用） */
    public static get mainCamera(): Camera {
        return find("Canvas").getChildByName("mainCamera").getComponent(Camera);
    }
}
