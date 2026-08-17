/** 微信分享相关类型（供 PlatHelper / WeChatPlatHelper 使用） */

export interface PostMessageObj {
    /** 通信事件 */
    event: string,
    /** 用于排序的键名 */
    key: string,
    /** 值 */
    data: Object,
}

export interface ShareObj {
    shareType: ShareType,
}

export enum ShareType {
    StrengthGet,
    Result,
    Other,
    Rank,
    Challenge
}
