/**
 * 引擎无关核心包统一出口
 * 纯 TypeScript，零 DOM / Canvas / Cocos 依赖。
 */
export * from './types/index';
export * from './core/EventCenter';
export * from './core/ObjectPool';
export * from './core/GameState';
export * from './core/Storage';
export * from './systems/Board';
export * from './systems/PathCalculator';
export * from './systems/CollisionSystem';
export * from './config/GameConfig';
export * from './config/LevelConfig';
export * from './utils/Utils';
