export namespace VideoEnum {

    /**
     * 激励视频广告位。
     * 【重要】枚举值 = `WeChatPlatHelper.ts` 底部 `videoIds` 数组的下标，一一对应；
     * 增删广告位必须两边同步改，否则会指到别的广告位上。
     *
     * 已下线的广告位（微信后台已删除，故不再占位）：
     * - 刷新道具（原 1）：底部刷新按钮随源工程 9.21 版去掉，广告逻辑一并移除
     * - 广告续命加步数（原 2）：续命改为消耗金币，见 GameConfig.STEP_RESCUE_COSTS
     */
    export enum RewardedVideo {
        /** 道具 - 撤回（看广告 +3） */
        Prop_Undo = 0,
        /** 道具 - 破冰锤（看广告 +1） */
        Prop_Hammer = 1,
        /** 结算 - 通关金币翻倍（看广告再发一份，对齐源工程 REWARDED_AD_UNIT_ID_COIN_DOUBLE） */
        Coin_Double = 2,
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
