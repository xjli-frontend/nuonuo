/**
 * 对象池（ObjectPool）
 * 
 * 【通俗说明】游戏里会频繁创建和销毁东西（敌人、特效等），
 * 每次都 new 一个然后扔掉会导致"内存碎片"，游戏越来越卡。
 * 
 * 对象池就像"碗筷回收站"：
 * - 不用的时候不扔掉，洗干净放回收站
 * - 需要的时候直接从回收站拿，不用重新造
 * - 用完再放回去，循环利用
 * 
 * 这是游戏性能优化的核心技巧之一。
 * 
 * 使用方法：
 *   const pool = new ObjectPool(() => new MyObject());
 *   const obj = pool.get();  // 获取一个对象
 *   // ... 使用 obj ...
 *   pool.release(obj);        // 用完还回去
 */

export class ObjectPool<T> {
  /** 工厂函数：当池子里没货时，用这个函数创建新对象 */
  private factory: () => T;

  /** 重置函数：对象还回池子前，重置它的状态（可选） */
  private reset: (obj: T) => void;

  /** 空闲对象列表 */
  private pool: T[] = [];

  /** 当前被借出去的对象集合（用于调试） */
  private active: Set<T> = new Set();

  /**
   * @param factory 工厂函数，用来创建新对象
   * @param reset 重置函数，对象还回来时调用（清空数据、归零状态等）
   */
  constructor(factory: () => T, reset: (obj: T) => void = () => {}) {
    this.factory = factory;
    this.reset = reset;
  }

  /**
   * 从池子里获取一个对象
   * 如果池子空了，就用工厂函数造一个新的
   */
  get(): T {
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    this.active.add(obj);
    return obj;
  }

  /**
   * 把对象还回池子
   * 先调用 reset 清空状态，再放入空闲列表
   */
  release(obj: T): void {
    this.reset(obj);
    this.active.delete(obj);
    this.pool.push(obj);
  }

  /** 获取当前空闲对象数量 */
  get freeCount(): number {
    return this.pool.length;
  }

  /** 获取当前被借出的对象数量 */
  get activeCount(): number {
    return this.active.size;
  }
}
