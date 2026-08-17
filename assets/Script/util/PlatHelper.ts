import { game, Game, Node } from "cc";
import { WeChatPlatHelper } from "./WeChatPlatHelper";
import { VideoEnum } from "../enum/VideoEnum";
import { PostMessageObj, ShareType } from "../enum/GameEnum";
import { ReportEnum } from "../enum/ReportEnum";
// 声明wx类型
declare const wx: any;

export class PlatHelper {

    static RegisterPlatAppEvent() {
        if (this.isWX) {
            WeChatPlatHelper.RegisterPlatAppEvent();
        } else {
            game.on(Game.EVENT_SHOW, () => {
                console.log(`onShow`)
            });

            // 游戏隐藏事件
            game.on(Game.EVENT_HIDE, () => {
                console.log(`onHide`)
            });
        }
    }

    static showShareMenu() {
        if (this.isWX) {
            WeChatPlatHelper.showShareMenu();
        } else {
        }
    }

    static share(shareType: ShareType, callback?: Function) {
        if (this.isWX) {
            return WeChatPlatHelper.share(shareType, (bool: boolean) => {
                callback && callback(bool);
            })
        }
        return true;
    }

    /**
     * 获取小游戏冷启动时的参数。
     */
    public static GetLaunchOptionsSync() {
        if (this.isWX) {
            var obj = wx.getLaunchOptionsSync()
            return obj;
        }
        return null;
    }

    static playVideo(callback: Function, videoEnum: VideoEnum.RewardedVideo) {
        if (this.isWX) {
            this.reportUserBehaviorBranchAnalytics(ReportEnum.RewardedVideo, 2, videoEnum);
            WeChatPlatHelper.playVideo((completed: boolean | number) => {
                if (!completed) {
                    callback && callback(false);
                    console.log("广告加载失败")
                }
                else if (completed == -1) {
                    callback && callback(false);
                    console.log("未看完广告，无法获得奖励")
                }
                else if (completed) {
                    callback && callback(true);
                    console.log("广告观看完成，获得奖励")
                }
            }, videoEnum)
        } else {
            callback && callback(true);
            console.log("广告观看完成，获得奖励")
        }
    }

    static showCustomAd(chil: Node, videoEnum: VideoEnum.CustomVideo, isCalcX?: boolean) {
        if (this.isWX) {
            WeChatPlatHelper.showCustomAd(chil, videoEnum, isCalcX);
        }
    }

    static hideCustomAd(videoEnum: VideoEnum.CustomVideo) {
        if (this.isWX) {
            WeChatPlatHelper.hideCustomAd(videoEnum);
        }
    }

    /** 震动 */
    static vibrateShort() {
        if (this.isWX) {
            WeChatPlatHelper.vibrateShort();
        }
    }

    /** 微信小游戏*/
    static get isWX(): boolean {
        return window["wx"] && !window["qq"] && !window["tt"];
    }

    /** 头条小游戏*/
    static get isTT(): boolean {
        return window["tt"];
    }

    static createGameClubButton(chil: Node, isshow: boolean) {
        if (this.isWX) {
            WeChatPlatHelper.createGameClubButton(chil, isshow)
        }
    }

    static GameClubButtonShowHide(isshow: boolean) {
        if (this.isWX) {
            WeChatPlatHelper.GameClubButtonShowHide(isshow)
        }
    }

    static postMessage(messageData: PostMessageObj, callback?: Function) {
        if (this.isWX) {
            WeChatPlatHelper.postMessage(messageData, callback);
        }
    }

    static reportUserBehaviorBranchAnalytics(reportEnum: ReportEnum, eventType: number, videoEnum: VideoEnum.RewardedVideo) {
        if (this.isWX) {
            WeChatPlatHelper.reportUserBehaviorBranchAnalytics(reportEnum, eventType, videoEnum);
        }
    }


}