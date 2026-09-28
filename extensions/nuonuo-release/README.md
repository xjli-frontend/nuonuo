# nuonuo-release

在 Cocos Creator 里把「构建微信小游戏」和「上传到微信后台」合成一次点击。

编辑器**菜单栏顶级的「自动化构建」**（和 扩展 / 开发者 / 面板 同一层级，一眼能看到）
→ 「构建并上传微信」打开面板：填版本号 / 描述 → 点「构建并上传」→
插件先调编辑器 builder 构建，再调微信开发者工具 CLI 上传，全程日志实时回显。

> 插件 id（= 目录名 = `Editor.Panel.open()` 的参数 = 消息前缀）仍然是 `nuonuo-release`，
> **只有显示名是「自动化构建」**。菜单位置由 i18n key `menu_title` 决定，改名不用动代码。
> `path` 写**单段**（`i18n:nuonuo-release.menu_title`）就是顶级菜单；写成
> `i18n:menu.panel/xxx` 那种带 `/` 的才会挂到内置菜单下面。

零第三方依赖，只用 Node 内置模块，**不需要 `npm install`**。

## 前置条件

1. **微信开发者工具**已安装。插件会自动找 `%ProgramFiles(x86)%\Tencent\微信web开发者工具`、
   `%ProgramFiles%\Tencent\微信开发者工具` 等常见位置；装在别处就设环境变量
   `WECHAT_DEVTOOLS_HOME` 指向安装目录（目录下要同时有 `node.exe` 和 `cli.js`）。
2. **服务端口**已开启：开发者工具 → 设置 → 安全设置 → 服务端口。
   这是安全设置，插件默认**不替你改**；面板上勾「允许自动开启服务端口」才会让 CLI 自己拉起。
3. **构建产物**存在：`build/wechatgame/project.config.json`（第一次先构建一次，或者直接用插件的构建功能）。

## 三个按钮

- **构建并上传** — 完整流程。
- **只构建，不上传** — 只跑构建，验证产物。
- **跳过构建，直接上传现有产物** — 复用 `build/wechatgame` 里已有的产物，重传用。

后两个勾选框互斥。三个勾选框都会存到本地，下次打开面板保持原样。

环境卡片右上角还有一个 **打开产物文件夹**，直接在资源管理器里打开 `build/wechatgame`
（目录不存在时退到 `build/`）。实现就是不 `shell:true` 地 spawn 一下系统文件管理器
（win `explorer` / mac `open` / linux `xdg-open`），没走编辑器内部消息 ——
扫过所有内置包，没有现成的「打开文件夹」消息。

## 实现要点（改之前先看这几条）

### 0. 消息必须在 `contributions.messages` 里注册

面板通过 `Editor.Message.request('nuonuo-release', '<消息名>')` 调主进程，
**只有 `package.json` 的 `contributions.messages` 里注册过的消息名才可达**，
没注册的话 request 直接失败（面板上表现为「和主进程通信失败」）。

所以：新增一个面板 → 主进程的调用，要**同时**改三处 —— `package.json` 加一条 `"<消息名>": {"methods": ["<方法名>"]}`、`dist/main.js` 的 `exports.methods` 里实现该方法、面板里用那个消息名去 request。
注册的键名（kebab-case）和方法名（camelCase）是两回事，官方模板就是
`"open-panel": {"methods": ["openPanel"]}`。

状态和日志**只走轮询 `get-state`，不用 broadcast**：面板关掉再打开时 broadcast
没有 backlog，还得再补一条拉取路径；统一轮询就只有一条路径要维护。
日志增量同步靠主进程的 `state.logSeq`（只增不减的累计行数），
**不能靠 `logs.length`** —— 环形缓冲满了之后会 `shift()`，length 就卡住不再增长了。

### 1. 不走 `cli.bat`

`cli.bat` 的内容就是 `<install>\node.exe <install>\cli.js %*`。所以直接 `spawn` 这两个文件、
`shell: false`、参数逐个放进数组 —— 描述里的空格 / 中文 / 引号 / `&` 全都不需要转义，
既没有 cmd.exe 的代码页乱码问题，也没有命令注入面。

### 2. 必须用开发者工具自带的那个 `node.exe`

`cli.js` 内部用 `installPath = dirname(process.execPath)` 算 `productHash` → `userDirPath`
→ 再去读 `.ide-status`。换成系统 node 或编辑器内置 node，`execPath` 一变 hash 就变，
它会以为服务端口没开、或者连不上已经开着的 IDE。

### 3. 服务端口状态别自己算 hash

状态在 `%LOCALAPPDATA%\微信开发者工具\User Data\<productHash>\Default\.ide-status`，
内容为 `On` 才算开。`<productHash> = md5(installPath + nwVersion)` —— **不要去算它**，
算错就永远查不到。扫目录，任一为 `On` 即视为已开启。

### 4. stdin 必须写一个答案再 EOF

服务端口没开时 CLI 会走 inquirer 的 `prompt({type:'confirm'})` 交互式等 `y`。
不写也不关的话它会**永久挂起**。所以管道建好后立刻写一个答案再 `end()`
（`allowEnablePort` 为真写 `y`，否则 `n`）。多写的两个字节无害，少了就是卡死。

### 5. 上传成败不能只看退出码

CLI 的 v2 命令 catch 住错误后照样以 0 退出。判定顺序：

1. `-i` 那个 JSON 有没有被重新写出来（上传前先删掉，能读出来 `size.packages` 就是成功，这是产物本身）；
2. 退出码非 0 → 失败；
3. 输出里匹配 `✔ upload` / `upload success` → 成功；
4. 都不满足 → 明确报「CLI 吞了错误」，把完整输出留在面板日志里。

退出码 `-10` / `4294967286` 是「服务端口没开」（`IDE_SERVICE_PORT_DISABLED`），单独识别。

### 6. 上传命令用 `--project` 而不是 `--projectpath`

v2 的 `upload` 命令（`n(660) → n(26)`，WS remote 模块）收的是 `--project`；
`projectpath` 那套是 v1 的 `-u "version@path" --upload-desc "..."` 老语法。
写法：`upload --project <目录> -v <版本> -d <描述> [-i <info.json>]`，`-v` / `-d` 必填，**没有 robot 参数**。

### 7. 构建参数复用

读 `profiles/v2/packages/builder.json`（没有就退到 `settings/v2/packages/builder.json`）里
`BuildTaskManager.taskMap` **最近一次成功任务**的 `options` 当模板。注意：

- 别按 `time` 字符串排序（`"2026-9-7"` 和 `"2026-10-7"` 会排错），taskMap 的 key 本身就是毫秒时间戳，按它降序。
- 要剥掉 `logDest`（上次那次带空格和中文的日志路径）和 `id` / `taskId`（会让它复用旧槽位）。
- `profiles/` 在 `.gitignore` 里，换机器就是空的 —— 这时候插件会明确提示「先手动构建一次」，而不是拿一份瞎编的 options 去跑。
- `add-task` 的返回值是 `BuildExitCode`，成功是 **36**；`TaskAddResult.BUSY === 0` 是 falsy，**不能写 `if (result)`**。

## 设置 / 本地缓存

`<工程>/profiles/nuonuo-release.json`（`profiles/` 已在 `.gitignore` 里，本机私有），存：

| 键 | 来源 |
| --- | --- |
| `lastVersion` / `lastDesc` | 版本号、描述输入框（改完就存） |
| `lastUploadedVersion` | 上传成功后写入，用来显示「上次上传：x.y.z」 |
| `skipBuild` / `buildOnly` / `allowEnablePort` | 三个勾选框（勾/取消就存） |

所以**关掉面板再打开，三个勾选框不会回到默认值**。

`rememberSettings` 是**逐字段**写的：面板改了哪个就只发哪个，不会把没发的字段冲掉
（版本号输入框和勾选框是两条独立的保存路径，无脑整体覆盖会互相清空）。
上传成功后版本号自动 +1 填回输入框。

## 命令行入口

不想开编辑器时用仓库根目录的脚本，复用同一份 `dist/wechat-upload.js`：

```bash
node scripts/wechat-upload.mjs --check                    # 只探测环境
node scripts/wechat-upload.mjs -v 1.0.1 -d "修复闪退"      # 上传
```

## 文件

| 文件 | 作用 |
| --- | --- |
| `dist/main.js` | 主进程：编排构建 → 上传，持有状态与日志（`logs` + 只增不减的 `logSeq`） |
| `dist/panels/default/index.js` | 面板：模板 / 样式内联，事件绑定，轮询 `get-state` 拉状态与日志 |
| `dist/wechat-upload.js` | 微信 CLI 封装（探测 + spawn + 成败判定），被 `scripts/wechat-upload.mjs` 复用 |

面板的日志和状态由主进程持有（一次运行一份，`logs` + 只增不减的 `logSeq`），
所以关掉面板再打开不会丢历史 —— 任务在主进程里继续跑，面板重开就靠轮询全部捞回来。
