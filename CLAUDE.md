# nuonuo

「挪挪收纳屋」的 Cocos Creator **3.8.4** 复刻：把「挪挪收纳屋」的纯 TS 核心逻辑（滑块归位）接成完整表现（菜单 → 选关 → 关卡 → 结果弹窗），界面由运行时代码构建（零 prefab 依赖）。原框架的 loading / 三图层 gui / 通用弹窗 / 飘字已全部移除。

## 运行
- 用 Cocos Creator **3.8.4** 打开本目录（首次会重建 `library/`、`temp/`）。
- 流程：打开即进菜单（无 loading）→ 开始 / 选关进入关卡 → 拖拽物品归位，通关 / 步数耗尽弹结果弹窗。
- 交互：按住物品（高亮所有可落点 + 生成跟手预览）→ 松手到高亮格，物品沿直线滑过去归位。左上角设置按钮开暂停面板（继续 / 重开 / 音乐·音效·震动三开关 / 返回主页）；底部「撤销 / 刷新 / 破冰锤」3 个道具按钮（用完可看广告补，每关限次）；菜单左上角设置按钮开设置弹窗（三开关）。破冰锤进入敲冰模式后点击冰块敲碎恢复原机制。

## 目录结构
- `assets/scene/main.scene` — 唯一场景：Canvas(768×1344) + mainCamera + Main 组件。
- `assets/Script/app/NuonuoApp.ts` — 屏幕管理器（框架无关、全运行时代码构建）：`boot()` 进菜单，负责菜单 / 选关 / 关卡 / 结果弹窗的构建与切换。顶部有功能开关 `SELECT_ALLOW_LOCKED`（选关页是否允许点选未解锁关卡）。
- `assets/Script/common/Main.ts` — 场景入口；`onLoad` 里 `Main.run()` 挂 `NuonuoApp` 并 `boot()`；`mainCamera` getter 供平台层使用。
- `assets/Script/app/NuonuoBootstrap.ts` — 把 `sys.localStorage` 注入为核心包存储适配器；由 Main 作为**首个 import** 引入。
- `assets/Script/app/NuonuoGame.ts` — 挪挪的 Cocos 渲染适配层（棋盘渲染 + 拖拽归位 + 破冰锤敲冰 + 胜负判定；优先 `resources/nuonuo/` 贴图，未就绪回退 Graphics + Label）。框架无关：宿主经 `onHud`/`onResult`/`onTip`/`onSfx`/`onVibrate` 注入回调，公开 `play(level)`/`undo()`/`restart()`/`refresh()`/`addSteps(n)`/`hammerMode`/`hasIce()`。
- `assets/Script/app/SoundManager.ts` — 音频管理器（`boot()` 时 `init` 挂在 NuonuoApp 节点下）：`resources/audio/` 懒加载，BGM 单一 AudioSource 循环（0.45）、音效各自 AudioSource（0.85）；播放前检查 `gameState.sfxEnabled`/`musicEnabled`，音乐开关变化后调 `onMusicToggle()` 续播/停 BGM。BGM 全场景统一 `bgm_theme`。
- `assets/resources/audio/` — 源工程 `dist/audio/` 复制来的 20 个 mp3（`bgm_theme` + 19 个 `sfx_*`，文件名即 SoundManager 加载键；Cocos 打开编辑器时自动生成 .meta）。
- `assets/Script/nuonuo/` — 引擎无关核心包（types / config / core / systems / utils，纯 TS、零 `cc` 依赖、相对导入）。
- `scripts/sync-core.mjs` — 与源工程（`../挪挪收纳屋/src`，可用 `NUONUO_SRC` 覆盖）同步核心逻辑：不带参数只对比，`--apply` 真正写入。白名单=纯逻辑文件；transform 自动完成适配（Storage 注入、剥离 AudioManager、注入 `reload()`/`setUnlockedLevel()`、删除 screenToCanvas）。源工程更新后直接跑 `node scripts/sync-core.mjs --apply` 即可。
- `assets/resources/nuonuo/` — 挪挪收纳屋原图（30 张 PNG：`gezi`/`dizuo`/`zhangai`/`arr`/`xuanzhogn`/`portal1~5`/`item_1~9`/`item_1_1~9_1`/`snow`/`freeon`，`water.png` 已删除——水洼机制保留但不铺水贴图）。`level/` 子目录放按钮类 UI 图（`btn_cancel`/`btn_refresh`/`btn_hammer`/`btn_setting`/`boad_bg`/`num_bg`/`level_bg`，其中 `btn_hammer` 破冰锤为新画；`level_bg_blur` 是 `level_bg` 的高斯模糊版（离线 box blur 生成），关卡背景用毛玻璃效果）。
- `assets/Script/util/PlatHelper.ts` + `WeChatPlatHelper.ts` — 微信平台适配（分享 / 广告 / 游戏圈 / 上报 / 震动），已与旧框架解耦。
- `assets/Script/enum/` — `GameEnum` / `VideoEnum` / `ReportEnum`（平台层用）。

## 关键约定 / 易踩坑
- 脚本 `__type__` = `.ts.meta` 里 uuid 的压缩形式；**保留文件名 + `.meta` 不变、只改 `.ts` 内容**即可让 prefab/scene 里已有的 `__type__` 引用继续生效。
- 新增界面**不写进 prefab/scene JSON**，改用运行时 `new Node()` + `node.addComponent(类引用)`，Cocos 导入时自动生成 `.meta`/uuid，免手算 `__type__`。
- `nuonuo/core/GameState` 单例在模块导入时即读存档，所以存储适配器必须在 GameState 首次加载前注入：`NuonuoBootstrap.ts` 必须作为 `Main.ts` 的**首个 import**（ESM 深度优先求值保证先执行，否则读到默认内存存储）。另外引擎预览的模块求值顺序不保证按 import 图走，`NuonuoApp.boot()` 里还要兜底调一次 `gameState.reload()` 重读存档。
- `Board.clone()` 是浅拷贝（共享 `stack` 引用）；快照式撤销用 `Board.snapshot()` / `restore()`（内部 `cloneCell` 深拷贝 `stack`），适配层自己的撤销历史走 `JSON.stringify` 深拷贝即可。
- 归位判定由 `Board.moveItem` 内部完成（匹配目标 → `placedCount++`），适配层只需扫描 `targetPositions` 统计，不要自己判断 placing。
- 步数 / 归位计数由适配层自管（核心包无对减 API）；`maxUnlockedLevel` 即续玩进度，规则：只增不减（通关 `unlockLevel` +1、选关 `setUnlockedLevel` 只前移、`NuonuoBootstrap` 落盘前与已存值取 max，旧预览页回写不会覆盖新进度）。最后一关通关不再解锁（`NuonuoGame.onWin` 只在下一关存在时 +1），菜单「开始」= `min(maxUnlockedLevel, TOTAL_LEVELS)`——清完全部关卡后永远进最后一关。
- 地形 / 物品有美术资源：`NuonuoGame.preloadAssets()` 预加载到静态 `_sfCache`，`renderCell` 优先贴图、未就绪回退 Graphics 程序化绘制。美术映射：障碍→`zhangai`、空格/物品底→`gezi`、目标→`item_N_1` 剪影、传送门→`portal_N`、物品→`dizuo`+`item_N`、单向门→`zhangai` 底 + 绿色 `arr` 箭头（默认指左，按方向旋转）、水洼→不铺水贴图，仅左上角 `snow` 雪花 + 红字倒计时（`water` 已移除）、冰块→`freeon`、冻结物品→`snow` 雪花标记；按钮 / 活动墙桥 / 落点高亮仍纯程序化。拖拽预览悬浮 `dizuo` 底座 + 物品图标（不垫 `xuanzhogn` 金底，用户指定；xuanzhogn 图现无用途）。道具按钮（撤销/刷新/破冰锤）由 NuonuoApp `loadSprite` 走 `level/btn_cancel`/`btn_refresh`/`btn_hammer`，无占位符。关卡背景用 `level_bg_blur`（毛玻璃模糊版，未就绪回退 `level_bg`）+ 半透明黑色蒙版（`LEVEL_BG_MASK_ALPHA`）压暗，降低背景视觉干扰。
- 物品 9 种（`ItemType`），配色 / 单字名在 `NuonuoGame.ts` 顶部的 `ITEM_COLORS` / `ITEM_NAMES`，`ITEM_ID` 映射 `ItemType → 1~9`（对应 `item_N.png`）。
- `NuonuoGame` 是框架无关模块（只依赖 `cc` 与 `nuonuo/` 核心包）：胜负 / 提示走 `onResult` / `onTip` 回调注入，HUD 走 `onHud`，音效 / 震动走 `onSfx(name)` / `onVibrate('short'|'long')`（名称对齐源工程 AudioManager；宿主接 SoundManager / PlatHelper）。改它时不要重新引入 `gui` / `ComponentExtends` / `Utils` 依赖；需要弹窗 / 飘字就在 `NuonuoApp` 里注入。
- 音频 / 震动链路：NuonuoGame 只在游戏事件点发 `onSfx`/`onVibrate`（pick/drop/invalid/match/teleport/ice/switch/step_low/undo/refresh/win/fail/level_start + 归位短震/通关长震）；菜单、按钮、弹窗、道具、广告的音效由 NuonuoApp 直接播（ui_tap/ui_popup/reward/ad_reward/toggle_on/toggle_off）。`PlatHelper.vibrateShort()/vibrateLong()` 内部检查 `gameState.vibrationEnabled`（WeChatPlatHelper 只做微信 API 调用，不读开关）。
- 破冰锤：敲冰交互在 NuonuoGame（`hammerMode` 为 true 时点格子走 `handleHammerTouch`：命中冰块 → `useHammerItem()` + `board.breakIce()` + `recalcButtons()`，敲冰模式高亮所有冰块格）；按钮点击 / 广告补锤在 NuonuoApp（`onHammerClick`：无冰/无锤/看广告分支，`requestItemByAd('hammer')` → `recordAdHammer()` + `addHammerItems(1)`）。每关广告次数由 `GameConfig.AD_LIMITS` 限制（`hasAdUndoLeft`/`hasAdRefreshLeft`/`hasAdHammerLeft`），进关 `gameState.setLevel()` 时 `resetLevelState()` 重置。
- 节点世界坐标是**可见区左下角原点、y 向上**（Canvas 挂在 mainCamera 前、`alignCanvasWithScreen` 把 Canvas 移到可见区中心 (半宽, 半高)，mainCamera 是 Canvas 子节点）。微信原生覆盖层（游戏圈按钮）style 的 left/top 以屏幕**左上角**为原点：`left = world.x * radio`、`top = windowHeight - world.y * radio`（再减半宽/半高），radio = windowWidth / view.getVisibleSize().width。
