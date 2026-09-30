import { game, Game, Node } from "cc";
import { WeChatPlatHelper } from "./WeChatPlatHelper";
import { VideoEnum } from "../enum/VideoEnum";
import { PostMessageObj, ShareType } from "../enum/GameEnum";
import { ReportEnum } from "../enum/ReportEnum";
import { gameState } from "../nuonuo/core/GameState";
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
            // 非微信环境（编辑器预览 / 浏览器 / 头条等）：没有激励视频可放，直接放发。
            //
            // 这条日志是刻意留的诊断信息 —— 道具按钮上的「看广告」图标只由数量为 0 决定
            // （见 NuonuoApp 的 applyPropVisual），跟运行环境无关，所以**看到广告图标不代表
            // 跑在微信里**。排查「点了广告没看就直接发奖」时：控制台只有这一句、没有任何
            // `激励广告…`（微信分支才会打），就说明 isWX 判成了 false，走的是这条分支。
            console.log("非微信环境（isWX=false），跳过激励视频直接发奖");
            callback && callback(true);
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

    /** 短震动（轻震：回弹/归位/敲冰等轻微反馈；震动开关关闭时不震，对齐源工程 VibrationManager） */
    static vibrateShort() {
        if (!gameState.vibrationEnabled) return;
        if (this.isWX) {
            WeChatPlatHelper.vibrateShort();
        }
    }

    /** 长震动（重震：通关等重要事件；震动开关关闭时不震） */
    static vibrateLong() {
        if (!gameState.vibrationEnabled) return;
        if (this.isWX) {
            WeChatPlatHelper.vibrateLong();
        }
    }

    static postMessage(messageData: PostMessageObj, callback?: Function) {
        if (this.isWX) {
            WeChatPlatHelper.postMessage(messageData, callback);
        }
    }

    static reportUserBehaviorBranchAnalytics(reportEnum: ReportEnum, eventType: number, videoEnum: VideoEnum.RewardedVideo) {
        if (this.isWX) {
            return;
            WeChatPlatHelper.reportUserBehaviorBranchAnalytics(reportEnum, eventType, videoEnum);
        }
    }


}