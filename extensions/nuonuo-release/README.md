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
4. **已登录**：开发者工具里扫码登录过。登录态存在 **IDE 自己手里**，CLI 只是个 HTTP
   客户端（`127.0.0.1:<服务端口>`），上传请求最终由 IDE 带着登录身份发出去 ——
   没登录必然失败。另外上传是记在**登录那个账号**名下的，该账号还得是项目 AppID 的
   开发者，否则一样失败（报权限错误）。面板「环境」卡片的「登录」那一行就是查这个。

## 三个按钮

- **构建并上传** — 完整流程。
- **只构建，不上传** — 只跑构建，验证产物。
- **跳过构建，直接上传现有产物** — 复用 `build/wechatgame` 里已有的产物，重传用。

后两个勾选框互斥。三个勾选框都会存到本地，下次打开面板保持原样。

「只构建」不需要版本号，但**填了就会打进包里**（见下面第 8 条）；不填的包在游戏里显示「开发版」。

**上传前会先查一次登录态**（`cli.js islogin`），**放在构建之前** —— 没登录直接中止，
不用白等十几秒构建。只拦「明确查到没登录」这一种；查不出来（工具没装 / 超时 / 输出没读懂）
一律放行，让上传自己去报错。`buildOnly` 不查（它本来就不上传）。

环境卡片右上角还有一个 **打开产物文件夹**，直接在资源管理器里打开 `build/wechatgame`
（目录不存在时退到 `build/`）。实现就是不 `shell:true` 地 spawn 一下系统文件管理器
（win `explorer` / mac `open` / linux `xdg-open`），没走编辑器内部消息 ——
扫过所有内置包，没有现成的「打开文件夹」消息。

日志卡片右上角有一个 **复制日志** 按钮（挨着「清空面板」）。点一下会把主进程那侧的日志连同一段
**上下文头**塞进剪贴板：插件 / 编辑器版本、工程路径、面板设置、运行状态与上次结果、
**本次构建参数**（来源 taskMap key 和 `packages` 平台选项 —— **`separateEngine` / `appid`
就在这里面**）、环境探测结果，最后才是完整日志（构建、登录预检、微信 CLI 的原始输出、失败详情）。
贴给别人排查时不用再补「我用的是哪次构建、开了哪些开关」。

头部那份构建参数是 `runBuild` **开跑时记下来的**（`state.lastBuildPlan`），不是导出时现读
`builder.json` —— 构建一成功那里就会多一条新记录，现读会读到它，taskMap key 跟本次日志里那行
对不上（踩过一次）。这次没构建（跳过构建 / 只上传）时头部会标成「下次构建会用」。

剪贴板有三处兜底，因为面板 webview 里不保证写得进去：

- 主进程**每次都先落盘**：`temp/nuonuo-release/log-<时间戳>.log`，并覆盖一份**固定路径**的
  `temp/nuonuo-release/last.log`（和上传时 `-i` 的 `upload-info.json` 同一目录）。
  剪贴板失败时面板会把路径打出来，按固定路径去捞最近一次即可。
- 剪贴板写两次：先 `navigator.clipboard.writeText`，被拒再退到隐藏 textarea + `execCommand('copy')`。
- 连主进程都联系不上（`export-log` 不通）时，退而复制**面板上已经渲染出来的**那些行，
  并在日志里标明是「面板可见部分」。

日志本身是主进程的环形缓冲（`MAX_LOG_LINES = 800`），被 `shift()` 挤掉的旧行拿不回来 ——
导出的就是缓冲里现存的内容。

## 实现要点（改之前先看这几条）

### 0. 消息必须在 `contributions.messages` 里注册

面板通过 `Editor.Message.request('nuonuo-release', '<消息名>')` 调主进程，
**只有 `package.json` 的 `contributions.messages` 里注册过的消息名才可达**，
没注册的话 request 直接失败（面板上表现为「和主进程通信失败」）。

所以：新增一个面板 → 主进程的调用，要**同时**改三处 —— `package.json` 加一条 `"<消息名>": {"methods": ["<方法名>"]}`、`dist/main.js` 的 `exports.methods` 里实现该方法、面板里用那个消息名去 request。
注册的键名（kebab-case）和方法名（camelCase）是两回事，官方模板就是
`"open-panel": {"methods": ["openPanel"]}`。

**新增消息后必须重新加载扩展**：`contributions.messages` 只在**扩展加载时**读一次。
只重开面板不够 —— 面板 JS 会重新读（所以新按钮看得见、点得动），但消息在编辑器里还不存在，
点下去报的就是 `message does not exist`。做法：编辑器里重新加载该扩展，不行就**重启编辑器**。

判断到底有没有重载过：看控制台有没有新的 `[nuonuo-release] loaded`（`exports.load()` 每次加载
都会打一行），`temp/logs/project.log` 里也能翻到。**只出现一次就说明一直没重载** ——
这也是排查「新按钮点了没反应」最快的一步。

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

### 5.5 未登录也是「以 0 退出」的，得主动查

同一条 `r.error` 路径：CLI 源码里 `upload` 是
`try { … } catch (e) { spinner.fail(); r.error(e) }`，而 `r.error` **就是个
`console.log`**，后面没有任何 `process.exit` —— 所以**没登录、没权限这类失败也是退出码 0**，
光看退出码看不出来。

两道防线：

- **事前**：`checkLogin()` 跑 `cli.js islogin`，输出里那行 `{"login":true|false}` 就是答案
  （JSON 那行被 spinner 搅了的话用正则 `"login"\s*:\s*(true|false)` 兜底）。只在
  `login === false` 时拦，`null` 放行。
- **事后**：`classifyOutput()` 从失败输出里认出四类 —— 产物缺文件 / 模块找不到 / 没登录 / 没权限
  （前两类见 5.6），给能直接照做的提示，而不是笼统的「CLI 吞了错误」。
  **只在上传已确定失败后调用**（`-i` 没被写出来），避免误伤成功输出；
  宁可漏认也别错认，错认会把真实错误盖掉。

注意 `islogin` 在 IDE 没跑时**会把 IDE 拉起来**（打印 `IDE server has started`），
所以它的超时（60s）给得比上传宽松，而且它是**单独一条消息** `check-login`，
没并进 `probeEnv` —— 不能让这几秒拖住面板首次渲染。

一个 regex 坑：写权限判定时 `不是该小游戏?的开发者` 是**错的** ——
`戏?` 只让「戏」可选，匹配不到「小程序」。要写 `不是该(小游戏|小程序)的开发者`。

### 5.6 「产物和开发者工具对不上」这一族

`classifyOutput()` 里这两条**排在「没登录」前面**：特征串最具体，一旦命中就是文件层面的事实，
不该被后面那些语义模糊的中文关键词抢走。

- **`ENOENT ... no such file or directory, open '<产物里的文件>'`** —— 开发者工具去预编译
  （输出里的 `compile_start`）时按**上一版的产物清单**读文件。实测案例：从分离引擎切到非分离引擎
  之后，`cocos-js/` 里的引擎文件整套换名 —— 分离引擎是 `plugin:cocos/*` 加几个本地
  `./custom-pipeline.js` / `./physics-2d-builtin.js` / `./physics-2d-framework.js`，
  非分离引擎只剩一条 `./_virtual_cc-<hash>.js`（引擎自己的 `meta.json` 里
  `chunkDepGraph` 可以自证）。IDE 还拿着上一版 `cc.js` 的依赖数组，跳过 `plugin:` 这种
  非文件说明符、顺着第一个相对路径 `./custom-pipeline.js` 去读，就读到了空。
  **产物是好的，坏的是 IDE 缓存的文件清单。**
- **`module '<x>.js' is not defined, require args is '<y>'`** —— 开发者工具的模块加载器
  （栈里是 `WAGameSubContext`，插件的子上下文）找不到模块。典型是开着「分离引擎」时，
  项目根目录的 `./web-adapter` 不在插件子上下文的模块表里。

两条的处置是同一件事：**让开发者工具忘掉上一版** —— 完全退出工具（含后台进程）再重传；
不行就「工具 → 清除缓存 → 全部清除」，打开项目先编译一次确认能过，再重传。

推论（值得记）：**只要动过构建配置，尤其 `separateEngine`，产物目录里的引擎文件形态就整体换了**，
IDE 那边必须先重新编译，否则它按旧清单读新目录，就是这么个 `ENOENT`。也是因为这个，
插件构建和面板构建的参数必须对齐 —— 见第 7 条。

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
- **平台选项会被这条路丢掉，必须自己盯着**：`builder.json` 的 taskMap options 里
  `packages` 是空的 `{}`，而平台选项其实存在 `profiles/v2/packages/wechatgame.json` 的
  `builder.options` 和 `taskOptionsMap` 里。丢了就走平台默认值，其中最要命的是
  `separateEngine` 会变成 `false` —— 于是**面板构建和插件构建出来的产物是两套**
  （引擎文件形态完全不同，正是 5.6 那个 `ENOENT` 的来源）。
  实际踩过一次：面板一直是 `separateEngine: true`，插件是 `false`，两边产物先后落在同一个
  `build/wechatgame` 里，最后在开发者工具预编译时炸出来。
  现在 `wechatgame.json` 里的 `separateEngine` 已**全部对齐成 `false`**（`builder.options`
  加所有 `taskOptionsMap` 历史条目都改了）。要开回来就得两处一起改，并且记住 IDE 需要重新编译。
- **那个文件随时会被编辑器改写**：编辑器会把「上一次构建实际用的」平台选项回写进
  `wechatgame.json`，所以它可能在你没动它的时候变 —— **改之前先重新读一遍**，别拿旧内容覆盖。

### 8. 版本号：构建完注入产物的 `game.js`，游戏只认它

面板里填的版本号有两个去处：

| 去处 | 谁读 | 什么时候定的 |
| --- | --- | --- |
| 微信后台列表里的版本号 | 上传命令行的 `-v` 参数 | 点上传那一刻 |
| 游戏里（菜单 → 设置弹窗底部）显示的 | 构建完注入到产物 `game.js` 的 `GameGlobal.__NUONUO_VERSION__` | **构建那一刻** |

**不再写 `assets/Script/app/BuildVersion.ts` 那个编译期常量了** —— 那个文件现在是个空壳
（只有注释 + `export {}`），没有任何地方 import 它，可以连 `BuildVersion.ts.meta` 一起删掉。

为什么绕这一下：微信开发者工具会缓存**编译过的脚本 bundle**（`assets/main/index.js`），
改了那个常量它经常不重新编译 —— 「改了版本号、构建成功、游戏里还是上一个号」就是这么来的。
`game.js` 是入口脚本，每次都会被重新读取，所以版本号放它第一行最稳。

注入长这样（`build/wechatgame/game.js` 第一行）：

```js
;(function(v){try{if(typeof GameGlobal!=="undefined")GameGlobal.__NUONUO_VERSION__=v;
if(typeof window!=="undefined")window.__NUONUO_VERSION__=v;}catch(e){}})("1.0.10");/*__NUONUO_VERSION__*/
```

四条别踩：

- **幂等**：整行只有一条、带唯一标记 `__NUONUO_VERSION__`，重复构建按标记整行替换
  （`GAME_JS_INJECT_RE`），不会越插越多。
- **用 `GameGlobal` 而不是 `window`**：注入点在 `game.js` 最前面，那会儿 `web-adapter.js`
  还没跑，`window` 可能还不存在。两个都写，但 `GameGlobal` 是主力。
- **没填版本号 → 把上次注入的整行删掉**，别让包显示上一个版本的号。
- **写不进去就是真失败**：`runBuild` 直接返回失败，不让这次发版继续 —— 不然游戏显示的号跟
  你要发的对不上，宁可停下来。

游戏侧读法在 `NuonuoApp.resolveBuildVersion()`：**只读注入值，读不到就显示「开发版」**
（编辑器预览、编辑器自带构建、插件没填版本号都是这种情况）。所以「这一版是不是我发的、是哪个号」
在包里一眼就能确认 —— 不用开开发者工具、也不用清缓存。

「只构建」也会把版本号写进产物（面板会把输入框的值一起传过来），否则
「只构建 → 勾『跳过构建』再上传」会传上去一个显示「开发版」的包，后台却记着另一个版本号。
没填版本号就不写 —— 包显示「开发版」。

### 8.1 两个版本号对不上怎么排查

后台记的是**上传那一刻**你填的号，游戏显示的是**构建那一刻**注入进包的号。所以
「后台 `1.0.8`、游戏里 `1.0.13`」的意思是：**这次上传的那份包，是更早一次构建出来的**
（或者你看的不是这份包）。按这个顺序查：

1. 看 `build/wechatgame/game.js` **第一行**注入的号 —— 这才是游戏显示的那个（见第 8 条）。
2. 跟要发的号不一样 → 重新构建，插件会把新号写进 `game.js`。
3. 一样，但你打开的游戏里不是它 → 你看的不是这份包：开发者工具里跑的还是**缓存住的旧包**
   （插件构建完会自动刷，见第 9 条）、后台的**体验版**是指针（不会跟着最新开发版本走）、
   手机侧代码包缓存。
   要手动刷的话：**点「编译」经常是没用的**（Cocos 通病，见第 9 条），而
   **「清除缓存 → 全部清除」会连数据缓存一起清掉、把存档（`nuonuo_save` / `nuonuo_daily_reward`）
   也清了** —— 正确的手动做法是只清「编译」和「文件」那两项。

**上传守卫**：`buildAndUpload` 在**上传前无条件**读一次 `game.js` 里的注入值，对不上就**中止**：

- 注入值 ≠ 要发的号 → 「…对不上：game.js 里注入的是 <实际值>，这次要发的是 X」。
- **压根没有注入** → 「…的 game.js 里没有版本号注入 —— 游戏里会显示「开发版」，
  跟后台要记的 X 对不上」（插件之外的构建、老产物都是这种）。
- **构建那条路原来只 `log` 一句警告就照常上传** —— 于是「后台记新号、游戏里是旧号 / 开发版」
  能悄悄发出去（上传不可撤销，这种错只有进游戏看设置弹窗才发现）。现在两条路都拦。

「只构建」不上传，所以不受守卫影响。

### 9. 构建后「让开发者工具重新读产物」（**默认关着**，只在切换过构建配置时才勾）

背景：Cocos 每次构建都会把 `build/wechatgame` 里的文件重写，而开发者工具内部给项目建的文件
缓存 / 监听不跟着更新。表现就是：**构建完了，在工具里点「编译」还是旧代码**（改过的逻辑不生效），
有人只能靠「清缓存 → 全部清除」—— 而「全部清除」会连**数据缓存（Storage）**一起清掉，
单机游戏的存档就在里面（`nuonuo_save` / `nuonuo_daily_reward`），不能那么干。

这是 Cocos 侧的通病，社区里官方没给解法（[forum 166556](https://forum.cocos.org/t/topic/166556)
「构建微信小游戏后微信工具编译不是最新的」）。插件提供一条不碰存档的路，走**官方 HTTP 接口**：

| 接口 | 作用 |
| --- | --- |
| `GET /v2/resetfileutils?project=<产物目录>` | 重置工具内部文件缓存，**重新监听项目文件** |
| `GET /v2/cleancache?clean=compile&project=<产物目录>` | 清编译缓存 —— 编译过的脚本 bundle 卡在这儿 |
| `GET /v2/cleancache?clean=file&project=<产物目录>` | 清文件缓存 —— 模拟器里那份**代码包**卡在这儿 |

`clean` 的合法值是 `storage(数据) / file(文件) / seeion(登陆) / auth(授权) / network(网络) /
compile(编译) / all(所有)`（`seeion` 是官方文档的拼写，照抄）。**代码里绝对不要传 `storage`
或 `all`** —— 那就是在清存档。动这段之前先想清楚这一点。

#### 为什么改成「默认关着」

**它会清掉文件缓存，而那份缓存很可能正是工具解析 `require` 用的东西。** 代价实测过一次：
构建完自动清了 `file`，再启动游戏就报

```
Error: module 'web-adapter.js' is not defined, require args is './web-adapter'
    at __initApp (game.js:4)      ← 行号是新的，说明工具读的是新 game.js，不是没编译
```

游戏直接起不来。所以现在**只在面板「选项」里勾了「构建后让开发者工具重新读产物」才会执行**
（存本地，默认 `false`）。平时发版不用勾 —— 版本号已经走 `game.js` 注入了，工具重新读一次
`game.js` 就能显示新号，不需要清任何缓存。

**什么时候才该勾**：**切换过构建配置**之后（典型是开/关「分离引擎」：`cocos-js/` 里的引擎文件
从 `plugin:cocos/*` + 本地 `./custom-pipeline.js` 变成单独一条 `./_virtual_cc-<hash>.js`），
工具内部的项目状态会和磁盘对不上（表现就是 `ENOENT` 读一个已经不存在的 chunk，或者模块解析
失败）。勾上跑一次构建，然后**记得取消勾选**。

两个实现细节：

- **端口号**在 `%LOCALAPPDATA%\微信开发者工具\User Data\<productHash>\Default\.ide` 里
  （内容就是数字），和 `.ide-status`（`On` / `Off`）同一个目录 —— `<productHash>` 按第 3 条
  扫目录拿，别自己算。
- HTTP 失败一律**不致命**：工具没在跑（`.ide-status` 不为 `On`）就直接跳过并说明原因，
  请求超时 15s，构建流程不受影响。日志里会打
  `[工具] 已让开发者工具重新读产物（重置文件监听 + 清了编译/文件缓存，存档没动）`。

## 设置 / 本地缓存

`<工程>/profiles/nuonuo-release.json`（`profiles/` 已在 `.gitignore` 里，本机私有），存：

| 键 | 来源 |
| --- | --- |
| `lastVersion` / `lastDesc` | 版本号、描述输入框（改完就存，**打开面板时读回来**） |
| `lastUploadedVersion` | 上传成功后写入，用来显示「上次上传：x.y.z」 |
| `skipBuild` / `buildOnly` / `allowEnablePort` | 三个勾选框（勾/取消就存） |

所以**关掉面板再打开，三个勾选框不会回到默认值**。

`rememberSettings` 是**逐字段**写的：面板改了哪个就只发哪个，不会把没发的字段冲掉
（版本号输入框和勾选框是两条独立的保存路径，无脑整体覆盖会互相清空）。

**版本号填多少就是多少，上传成功后不再自动 +1** —— 原来是会的，去掉了：自动 +1 会造成
「输入框 +1 了、包里还是上一个号」的错觉，和「跳过构建」混着用时更容易发错版本。

### 打开版本号文件

版本卡片右上角有个 **打开版本号文件**：在文件管理器里定位并选中 `profiles/nuonuo-release.json`
（win 用 `explorer /select,<路径>`、mac 用 `open -R`、linux 直接开目录）。**故意不走 `cmd`**
（路径含中文时 cmd 的代码页会乱码）、也不依赖 `.json` 有没有关联编辑器 —— 选中之后回车就能用
默认编辑器打开。文件不存在时先按当前值写一份出来，免得打开看到个 `{}` 不知道改哪儿。

**手改完这个文件，回面板点一下「重新检测」（或关掉面板重开）把新值读回来** ——
不然面板还拿着旧值，一点「构建并上传」就把它又写回去了。两个入口都会调 `applySettings()`，
而它对**正在编辑的那个输入框**做了保护（`document.activeElement` 判断），
所以不会出现「字打到一半被面板冲掉」。`probeEnv` 也顺带返回 `settings`，就是为了这条。

## 命令行入口

不想开编辑器时用仓库根目录的脚本，复用同一份 `dist/wechat-upload.js`：

```bash
node scripts/wechat-upload.mjs --check                    # 只探测环境（含登录态）
node scripts/wechat-upload.mjs -v 1.0.1 -d "修复闪退"      # 上传
```

两条路的判定完全一致：脚本也会在传之前查一次登录态，查到没登录就退出码 1 中止，
查不出来只提示不拦。`--check` 把登录态算进成败（`login === false` 才算失败）。

## 文件

| 文件 | 作用 |
| --- | --- |
| `dist/main.js` | 主进程：编排构建 → 上传，持有状态与日志（`logs` + 只增不减的 `logSeq`） |
| `dist/panels/default/index.js` | 面板：模板 / 样式内联，事件绑定，轮询 `get-state` 拉状态与日志 |
| `dist/wechat-upload.js` | 微信 CLI 封装（探测 + spawn + 成败判定），被 `scripts/wechat-upload.mjs` 复用 |

面板的日志和状态由主进程持有（一次运行一份，`logs` + 只增不减的 `logSeq`），
所以关掉面板再打开不会丢历史 —— 任务在主进程里继续跑，面板重开就靠轮询全部捞回来。
