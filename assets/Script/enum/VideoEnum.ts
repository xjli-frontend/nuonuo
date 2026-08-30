export namespace VideoEnum {

    export enum RewardedVideo {
        /** 道具 - 撤回（看广告 +3） */
        Prop_Undo = 0,
        /** 道具 - 刷新（看广告 +1） */
        Prop_Refresh = 1,
        /** 广告续命 - 步数耗尽加步（看广告 +5步） */
        Prop_Steps = 2,
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
