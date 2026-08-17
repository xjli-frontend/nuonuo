/**
 * 通用工具函数
 * 
 * 【通俗说明】放一些到处都会用到的小工具函数，
 * 比如"判断两个坐标是否相同"、"限制数字范围"等。
 * 不涉及游戏逻辑，纯数学/数据处理。
 */

/**
 * 判断两个坐标是否相同
 * @param a 第一个坐标 [row, col]
 * @param b 第二个坐标 [row, col]
 */
export function posEqual(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * 限制数值范围（夹逼函数）
 * 如果 value 小于 min 返回 min，大于 max 返回 max，否则返回 value
 * @param value 原始值
 * @param min 最小值
 * @param max 最大值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 生成 [min, max) 范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 判断一个值是否在数组中
 * 不使用 Array.includes 是因为需要严格类型比较
 */
export function inArray<T>(value: T, arr: T[]): boolean {
  return arr.indexOf(value) !== -1;
}

/**
 * 深拷贝一个对象（用于撤销记录等场景）
 * 注意：只支持 JSON 兼容的数据类型
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 格式化进度显示文字
 * @param placed 已归位数量
 * @param total 总数量
 */
export function formatProgress(placed: number, total: number): string {
  return `${placed} / ${total}`;
}

/**
 * 说明：screenToCanvas 依赖 DOM 的 getBoundingClientRect，属于渲染/适配层，
 * 不放入引擎无关核心包。由宿主在渲染层自行实现：
 * - 原生 Canvas 版：用 canvas.getBoundingClientRect()
 * - Cocos 版：用 UITransform.convertToNodeSpaceAR 等坐标转换
 */
