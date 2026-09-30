/**
 * 【已废弃，没人用了】原来是 `export const BUILD_VERSION = '1.0.9'` 这种构建版本号常量。
 *
 * 旧的流程：extensions/nuonuo-release 构建前把版本号写进这个文件、构建后还原成空串，
 * 游戏设置弹窗读它显示版本号。
 *
 * 现在改成**构建完往产物的 `game.js` 里注入** `GameGlobal.__NUONUO_VERSION__`
 * （读法见 `NuonuoApp.resolveBuildVersion()`，玩法见插件 README 第 8 条）——
 * 微信开发者工具会缓存**编译过的脚本 bundle**，改这个常量它经常不重新编译，
 * 结果就是「改了版本号、构建也成功、游戏里还是上一个号」。
 *
 * 现在没有任何地方 import 它了，**可以连同 `BuildVersion.ts.meta` 一起删掉**。
 */
export {};
