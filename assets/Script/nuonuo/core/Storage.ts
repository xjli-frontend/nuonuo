/**
 * 存储适配器（Storage Adapter）
 *
 * 【通俗说明】核心包不直接依赖 localStorage（浏览器才有）或 sys.localStorage（微信/Cocos 才有），
 * 而是通过这个接口让宿主（浏览器 Canvas / 微信小游戏 / Cocos 原生）注入各自实现。
 *
 * 用法：
 *   // 浏览器 Canvas 版 main.ts
 *   setStorageAdapter({ getItem: k => localStorage.getItem(k), setItem: (k,v) => localStorage.setItem(k,v) });
 *
 *   // Cocos 版
 *   import { sys } from 'cc';
 *   setStorageAdapter({ getItem: k => sys.localStorage.getItem(k), setItem: (k,v) => sys.localStorage.setItem(k,v) });
 */

export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** 默认内存实现：保证核心包在任何环境都能独立运行（不持久化） */
class MemoryStorage implements IStorageAdapter {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

let adapter: IStorageAdapter = new MemoryStorage();

/** 宿主注入真实存储实现 */
export function setStorageAdapter(a: IStorageAdapter): void {
  adapter = a;
}

/** 获取当前存储实现（GameState 内部使用） */
export function getStorageAdapter(): IStorageAdapter {
  return adapter;
}
