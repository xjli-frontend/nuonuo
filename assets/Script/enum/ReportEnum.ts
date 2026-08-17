export enum ReportEnum {
    RewardedVideo = 0
}

export interface ReportObj {
    /** 事件ID */
    eventID: string,
    /** 关卡ID */
    levelID: number,
    /** 关卡名称 */
    levelName: string,
    /** 关卡类型 */
    levelAction: number,
    /** 关卡动作 */
    levelResult: number,            // 关卡动作 - 1:成功，2:失败，3:重试，4:复活，5:进入，6:退出，7:使用道具，8:广告激励，9:分享
    /** 关卡用时 */
    levelTime?: number,             // 关卡用时 - 单位秒（前台时间，不含广告及跳出游戏的时间），仅LevelResult=1成功上报有效
    /** 关卡进度 */
    levelProgress?: number,
    /** 关卡进入次数 */
    loginCount?: number,
    /** 游戏版本号 */
    gameVersion: number,
}