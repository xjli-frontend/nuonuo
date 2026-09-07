import { sys } from 'cc';
import { setStorageAdapter } from '../nuonuo/core/Storage';

// 注入 Cocos 的 localStorage 作为「挪挪」核心包的存储适配器。
// 必须在 GameState 单例首次加载前注入 —— GameState 模块导入即读取存档。
// 故把注入放到独立模块，由 Main 作为**首个 import** 引入（ESM 深度优先求值，
// 会先于任何可能拖入 gameState 的模块执行），从而保证适配器先于 GameState 生效。
setStorageAdapter({
    getItem: (k: string) => sys.localStorage.getItem(k),
    setItem: (k: string, v: string) => {
        // 存档落盘前合并进度：maxUnlockedLevel 只增不减。
        // 旧预览页/旧标签页里内存中的旧进度回写时（切开关、用道具都会触发保存），
        // 不会把新存档里已前进的进度覆盖回去。
        if (k === 'nuonuo_save') {
            try {
                const stored = sys.localStorage.getItem(k);
                if (stored) {
                    const cur = JSON.parse(stored);
                    const next = JSON.parse(v);
                    next.maxUnlockedLevel = Math.max(cur.maxUnlockedLevel ?? 1, next.maxUnlockedLevel ?? 1);
                    v = JSON.stringify(next);
                }
            } catch (e) { /* 旧存档损坏/不可读时按原值写入 */ }
        }
        sys.localStorage.setItem(k, v);
    },
});
