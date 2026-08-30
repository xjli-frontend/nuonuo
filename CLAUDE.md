# nuonuo

「挪挪收纳屋」的 Cocos Creator **3.8.4** 复刻：把「挪挪收纳屋」的纯 TS 核心逻辑（滑块归位）接成完整表现（菜单 → 选关 → 关卡 → 结果弹窗），界面由运行时代码构建（零 prefab 依赖）。原框架的 loading / 三图层 gui / 通用弹窗 / 飘字已全部移除。

## 运行
- 用 Cocos Creator **3.8.4** 打开本目录（首次会重建 `library/`、`temp/`）。
- 流程：打开即进菜单（无 loading）→ 开始 / 选关进入关卡 → 拖拽物品归位，通关 / 步数耗尽弹结果弹窗。
- 交互：按住物品（高亮所有可落点 + 生成跟手预览）→ 松手到高亮格，物品沿直线滑过去归位。底部有「暂停 / 撤销 / 刷新 / 道具 / 重开」5 个按钮（暂停做遮罩、道具为占位提示）。

## 目录结构
- `assets/scene/main.scene` — 唯一场景：Canvas(768×1344) + mainCamera + Main 组件。
- `assets/Script/app/NuonuoApp.ts` — 屏幕管理器（框架无关、全运行时代码构建）：`boot()` 进菜单，负责菜单 / 选关 / 关卡 / 结果弹窗的构建与切换。顶部有功能开关 `SELECT_ALLOW_LOCKED`（选关页是否允许点选未解锁关卡）。
- `assets/Script/common/Main.ts` — 场景入口；`onLoad` 里 `Main.run()` 挂 `NuonuoApp` 并 `boot()`；`mainCamera` getter 供平台层使用。
- `assets/Script/app/NuonuoBootstrap.ts` — 把 `sys.localStorage` 注入为核心包存储适配器；由 Main 作为**首个 import** 引入。
- `assets/Script/app/NuonuoGame.ts` — 挪挪的 Cocos 渲染适配层（棋盘渲染 + 拖拽归位 + 胜负判定；优先 `resources/nuonuo/` 贴图，未就绪回退 Graphics + Label）。框架无关：宿主经 `onHud`/`onResult`/`onTip` 注入回调，公开 `play(level)`/`undo()`/`restart()`。
- `assets/Script/nuonuo/` — 引擎无关核心包（types / config / core / systems / utils，纯 TS、零 `cc` 依赖、相对导入）。
- `assets/resources/nuonuo/` — 挪挪收纳屋原图（30 张 PNG：`gezi`/`dizuo`/`zhangai`/`xuanzhogn`/`portal1~5`/`item_1~9`/`item_1_1~9_1`/`water`/`snow`/`freeon`）。
- `assets/Script/util/PlatHelper.ts` + `WeChatPlatHelper.ts` — 微信平台适配（分享 / 广告 / 游戏圈 / 上报 / 震动），已与旧框架解耦。
- `assets/Script/enum/` — `GameEnum` / `VideoEnum` / `ReportEnum`（平台层用）。

## 关键约定 / 易踩坑
- 脚本 `__type__` = `.ts.meta` 里 uuid 的压缩形式；**保留文件名 + `.meta` 不变、只改 `.ts` 内容**即可让 prefab/scene 里已有的 `__type__` 引用继续生效。
- 新增界面**不写进 prefab/scene JSON**，改用运行时 `new Node()` + `node.addComponent(类引用)`，Cocos 导入时自动生成 `.meta`/uuid，免手算 `__type__`。
- `nuonuo/core/GameState` 单例在模块导入时即读存档，所以存储适配器必须在 GameState 首次加载前注入：`NuonuoBootstrap.ts` 必须作为 `Main.ts` 的**首个 import**（ESM 深度优先求值保证先执行，否则读到默认内存存储）。另外引擎预览的模块求值顺序不保证按 import 图走，`NuonuoApp.boot()` 里还要兜底调一次 `gameState.reload()` 重读存档。
- `Board.clone()` 是浅拷贝（共享 `stack` 引用），撤销快照要用 `JSON.stringify(board.grid)` 深拷贝。
- 归位判定由 `Board.moveItem` 内部完成（匹配目标 → `placedCount++`），适配层只需扫描 `targetPositions` 统计，不要自己判断 placing。
- 步数 / 归位计数由适配层自管（核心包无对减 API）；`maxUnlockedLevel` 即续玩进度：通关 `unlockLevel` +1、选关 `setUnlockedLevel` 直接设置，均即时落盘。菜单「开始」= `maxUnlockedLevel`。
- 地形 / 物品有美术资源：`NuonuoGame.preloadAssets()` 预加载到静态 `_sfCache`，`renderCell` 优先贴图、未就绪回退 Graphics 程序化绘制。美术映射：障碍→`zhangai`、空格/物品底→`gezi`、目标→`item_N_1` 剪影、传送门→`portal_N`、物品→`dizuo`+`item_N`（选中垫 `xuanzhogn`）、水洼→`water`、冰块→`freeon`、冻结物品→`snow` 雪花标记；单向门 / 按钮 / 活动墙桥 / 落点高亮仍纯程序化。
- 物品 9 种（`ItemType`），配色 / 单字名在 `NuonuoGame.ts` 顶部的 `ITEM_COLORS` / `ITEM_NAMES`，`ITEM_ID` 映射 `ItemType → 1~9`（对应 `item_N.png`）。
- `NuonuoGame` 是框架无关模块（只依赖 `cc` 与 `nuonuo/` 核心包）：胜负 / 提示走 `onResult` / `onTip` 回调注入，HUD 走 `onHud`。改它时不要重新引入 `gui` / `ComponentExtends` / `Utils` 依赖；需要弹窗 / 飘字就在 `NuonuoApp` 里注入。
