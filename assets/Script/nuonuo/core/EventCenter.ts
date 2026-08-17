/**
 * 事件总线（EventCenter）
 * 
 * 【通俗说明】这是游戏里"广播站"。
 * 
 * 为什么需要它？
 * - 比如「物品归位」这个事件，HUD 要知道（更新进度），音效系统要知道（播放音效），
 *   结算系统要知道（检查是否全部归位）。
 * - 如果让物品对象去一一通知它们，代码会像意大利面条一样缠在一起。
 * - 事件总线就像广播站：物品归位后发一条广播，谁关心谁自己来听。
 * 
 * 使用方法：
 *   发送事件：EventCenter.emit('事件名', 数据)
 *   监听事件：EventCenter.on('事件名', (数据) => { ... })
 *   取消监听：EventCenter.off('事件名', 那个函数)
 */

// 监听函数的类型：接收任意数据，无返回值
type EventHandler = (data?: any) => void;

export class EventCenter {
  /** 单例实例：整个游戏只有一个广播站 */
  private static instance: EventCenter;

  /** 
   * 事件映射表
   * 结构：{ '事件名A': [函数1, 函数2], '事件名B': [函数3] }
   * 每个事件名下存一组回调函数，事件触发时依次调用
   */
  private events: Map<string, EventHandler[]> = new Map();

  /** 私有构造函数，外部不能 new，必须通过 getInstance() 获取 */
  private constructor() {}

  /**
   * 获取单例实例
   * 如果还没创建就创建一个，已经存在就直接返回
   */
  static getInstance(): EventCenter {
    if (!EventCenter.instance) {
      EventCenter.instance = new EventCenter();
    }
    return EventCenter.instance;
  }

  /**
   * 监听事件（订阅）
   * @param eventName 事件名（建议用 GameEvent 枚举避免拼写错误）
   * @param handler 回调函数，事件触发时调用
   */
  on(eventName: string, handler: EventHandler): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(handler);
  }

  /**
   * 取消监听（取消订阅）
   * @param eventName 事件名
   * @param handler 要取消的那个回调函数（必须是 on 时传入的同一个函数引用）
   */
  off(eventName: string, handler: EventHandler): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 发送事件（广播）
   * @param eventName 事件名
   * @param data 附带的数据（可选）
   */
  emit(eventName: string, data?: any): void {
    const handlers = this.events.get(eventName);
    if (handlers) {
      // 用 slice() 复制一份，防止在回调中修改 handlers 导致遍历出错
      handlers.slice().forEach((handler) => {
        try {
          handler(data);
        } catch (e) {
          console.error(`[EventCenter] 事件 "${eventName}" 处理出错:`, e);
        }
      });
    }
  }

  /**
   * 清除所有事件监听
   * 用于场景切换时清理，防止内存泄漏
   */
  clear(): void {
    this.events.clear();
  }
}

// 导出单例快捷访问
export const eventCenter = EventCenter.getInstance();
