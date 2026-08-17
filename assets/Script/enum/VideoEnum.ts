export namespace VideoEnum {

    export enum RewardedVideo {
        /** 关卡复活-时间0 */
        Revive_Time = 0,
        /** 获得30分钟无限体力 */
        Infinite_Strength = 1,
        /** 获得1点体力 */
        One_Strength = 2,
        /** 头衔挑战 */
        Title_Challenge = 3,
        /** 段位奖励再领取 */
        Rank_Get = 4,
        /** 关卡复活-血量0 */
        Revive_Hp = 5,
        /** 结算界面 双倍段位经验 */
        Double_Exp_Result = 6,
        /** 开始游戏界面 双倍段位经验 */
        Double_Exp_Start = 7,
    }

    export enum CustomVideo {
        /** 结算界面下方 */
        Result = 0,
        /** 关卡终点木板 */
        Final = 1,
        /** 关卡中间木板 */
        Center = 2,
    }

}
