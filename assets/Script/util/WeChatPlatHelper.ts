import { Node, size, UITransform, v3, view } from "cc";
import { VideoEnum } from "../enum/VideoEnum";
import { PostMessageObj, ShareType } from "../enum/GameEnum";
import Main from "../common/Main";
import { ReportEnum } from "../enum/ReportEnum";
// 声明wx类型
declare const wx: any;
export class WeChatPlatHelper {

    /** 震动 */
    static vibrateShort() {
        wx.vibrateShort && wx.vibrateShort({
            type: "medium"
        })
    }

    static calcPosSize(targetNode: Node) {
        let targetWp = targetNode.getComponent(UITransform).convertToWorldSpaceAR(v3(0, 0, 0));
        let targetSpace = Main.mainCamera.getComponent(UITransform).convertToNodeSpaceAR(targetWp);
        const imgsize = this.getSize(targetNode);
        var x = targetWp.x;
        var y = targetWp.y;
        const windowSize = view.getVisibleSize();
        const sysInfo = wx.getSystemInfoSync();
        const radio = sysInfo.windowWidth / windowSize.width;
        const leftPos = (windowSize.width - x) * radio - imgsize.width / 2;
        const topPos = (windowSize.height - y) * radio - imgsize.height / 2;

        // console.log("分辨率倍数 ： ", view.getScaleY());
        // console.log("小程序提供的屏幕范围 ", sysInfo.windowWidth, sysInfo.windowHeight)
        // console.log("引擎提供的屏幕范围 ", windowSize.width, windowSize.height)
        // console.log("设备像素比 ", sysInfo.pixelRatio)
        console.log("leftPos ", leftPos, "topPos ", topPos, "imgsize", imgsize)
        return { leftPos: leftPos, topPos: topPos, imgsize }
    }

    static getSize(targetNode: Node) {
        const uITransform = targetNode.getComponent(UITransform);
        const imgsize = size(uITransform.contentSize.width * targetNode.scale.x, uITransform.contentSize.height * targetNode.scale.y)
        let sysInfo = wx.getSystemInfoSync();
        let windowSize = view.getVisibleSize();
        const radio = sysInfo.windowWidth / windowSize.width;
        const realSize = size(imgsize.width * radio, imgsize.height * radio)
        return realSize;
    }

    static _clubButton = null;
    /**
     *  创建游戏圈按钮
     * @param chil 节点位置
     * @param imgsize 图片大小
     * @param isshow 是否隐藏   true  隐藏   false 不隐藏
     * @returns 
     */
    public static createGameClubButton(targetNode: Node, isshow) {
        if (!this._clubButton) {
            const { leftPos, topPos, imgsize } = this.calcPosSize(targetNode);
            this._clubButton = wx.createGameClubButton({
                type: 'text',
                // icon: 'light',
                style: {
                    left: leftPos,// 之所以要减20，是因为clubButton的锚点在左上角
                    top: topPos, // 之所以要减20，是因为clubButton的锚点在左上角 
                    width: imgsize.width,
                    height: imgsize.height,
                    backgroundColor: "#FF0000"
                },
                text: "",
            });
        }
        this.GameClubButtonShowHide(isshow);
    }

    /**
    *  显示或隐藏游戏圈按钮
    * @param isshow 是否隐藏   true  隐藏   false 不隐藏
    * @returns 
    */
    public static GameClubButtonShowHide(isshow) {
        if (this._clubButton) {
            if (isshow) {
                this._clubButton.show();
            } else {
                this._clubButton.hide();
            }
        }
    }

    static videoAdInstance = null;
    /** 注册广告实例 */
    static RegisterViewAdInstance(videoEnum: VideoEnum.RewardedVideo) {
        const adId = videoIds[videoEnum];
        const self = this;
        console.log('RegisterViewAdInstance', "AdunitId =====》", adId)
        if (this.videoAdInstance) {
            this.videoAdInstance.destory();
        }
        let videoAdInstance = wx.createRewardedVideoAd({
            adUnitId: adId,
            multiton: true
        });
        const listenerOnLoad = (res) => {
            console.log('激励广告回调onLoad', "AdunitId =====》", adId, "加载成功")
        }
        const listenerOnError = (err) => {
            console.log('激励广告回调onError', "AdunitId =====》", adId, "加载失败", err)
        }
        const listenerOnClose = (res) => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            var completed = null;
            if ((res && res.isEnded) || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                completed = true;
            }
            else {
                // 播放中途退出，不下发游戏奖励
                completed = -1;
            }
            console.log('激励广告回调listenerOnClose', "AdunitId =====》", adId, res)
            self.showVideoResult(completed);
        }
        // videoAdInstance.offLoad()
        videoAdInstance.onLoad(listenerOnLoad);
        // videoAdInstance.offError()
        videoAdInstance.onError(listenerOnError);
        // videoAdInstance.offClose()
        videoAdInstance.onClose(listenerOnClose)
        console.log(`激励广告注册`, "AdunitId =====》", adId)
        return {
            videoAdInstance: videoAdInstance,
            videoEnum: videoEnum
        };
    }

    static initVideo(rewardedVideo: VideoEnum.RewardedVideo) {
        if (typeof (wx) == "undefined") {
            return
        }
        const { videoAdInstance, videoEnum } = this.RegisterViewAdInstance(rewardedVideo);
        this.videoAdInstance = videoAdInstance;
        this.curVideoEnum = videoEnum;
    }

    private static videoCallback = null;
    private static showVideoResult(completed: any) {
        if (this.videoCallback) {
            this.videoCallback(completed);
            this.videoCallback = null;
        }
    }

    static curVideoEnum: VideoEnum.RewardedVideo = null;
    static playVideo(callback: Function, videoEnum: VideoEnum.RewardedVideo = VideoEnum.RewardedVideo.Revive_Time) {
        let self = this;
        self.videoCallback = callback;
        if (videoEnum != this.curVideoEnum) {
            this.initVideo(videoEnum);
        }
        if (self.videoAdInstance) {
            self.videoAdInstance.load()
                .then(() => {
                    self.videoAdInstance.show({
                        branchId: reportIds[0],
                        branchDim: `${videoEnum}`, // 自定义维度(可选)：类型String，取值[1,100]，必须为整数，当上传类型不符时不统计
                    }).then(() => {
                        console.log("激励广告showVideo", "AdunitId =====》", videoEnum, "激励广告显示成功");
                    }).catch(err => {
                        console.log("激励广告showVideo", "AdunitId =====》", videoEnum, "激励广告显示失败")
                        self.showVideoResult(false);
                    });
                })
                .catch(err => {
                    console.log("激励广告showVideo", "AdunitId =====》", videoEnum, "激励广告加载失败")
                    self.showVideoResult(false);
                });
        } else {
            console.log("激励广告showVideo", "AdunitId =====》", videoEnum, "激励广告实例未初始化")
            self.showVideoResult(false);
        }
    }

    static customAdArr: Array<any> = [];
    static showCustomAd(targetNode: Node, videoEnum: VideoEnum.CustomVideo = VideoEnum.CustomVideo.Result, isCalcX?: boolean) {
        if (this.customAdArr[videoEnum]) {
            this.customAdArr[videoEnum].destory();
        }
        const customAdId = customAdIds[videoEnum];
        const { leftPos, topPos, imgsize } = this.calcPosSize(targetNode);
        const windowSize = view.getVisibleSize();
        const sysInfo = wx.getSystemInfoSync();
        const radio = sysInfo.windowWidth / windowSize.width;
        let posX = 0;
        if (isCalcX) {
            posX = (windowSize.width - targetNode.getComponent(UITransform).width) / 2 * radio
        }
        console.log("创建 原生模板 广告实例", "customAdId", customAdId)
        let customAd = wx.createCustomAd({
            adUnitId: customAdId,
            style: {
                left: posX,
                top: topPos,
                width: sysInfo.windowWidth,
                // height: imgsize.height
            }
        })
        this.customAdArr[videoEnum] = customAd;
        const listenerOnLoad = (res) => {
            console.log('原生模板 广告 回调onLoad', "加载成功")
        }
        const listenerOnError = (res) => {
            console.log('原生模板 广告 回调onError', "加载失败")
        }
        customAd.onError(listenerOnError)
        customAd.onLoad(listenerOnLoad)
        customAd.show()
            .then(() => {
            })
            .catch(err => {
            });;
    }

    static hideCustomAd(videoEnum: VideoEnum.CustomVideo) {
        const customAd = this.customAdArr[videoEnum];
        if (customAd) {
            customAd.hide();
        }
    }

    static postMessage(messageData: PostMessageObj, callback: Function) {
        if (typeof wx === 'undefined') {
            console.log('当前不是微信环境，无法显示排行榜');
            return;
        }
        try {
            // 获取开放数据域对象
            const openDataContext = wx.getOpenDataContext();

            // 确保获取了开放数据域对象
            if (!openDataContext) {
                console.error('获取开放数据域对象失败');
                return;
            }

            // 向开放数据域发送消息，请求加载好友排行榜数据
            openDataContext.postMessage(messageData);
            callback && callback(true);

        } catch (error) {
            callback && callback(false, error);
        }
    }

    /**
     * 游戏分享功能
     * @param share 分享参数   title 标题   imagerUrl 图片链接   query 透传参数 必须是 key1=val1&key2=val2 的格式。 imageUrlId 微信后台图片id
     * @param callback 回调方法
     * @returns 
     */
    public static share(shareType: ShareType, callback?: Function): boolean {
        const shareObj = this.getShareObj(shareType);
        wx.shareAppMessage(shareObj);
        console.log("分享出去的参数: ", shareObj);
        callback && callback()
        return true;  //小程序默认分享成功
    }

    public static getShareObj(shareType: ShareType) {
        const title = [
            "我发现个奇怪又好玩的收纳游戏，拖拽归位，解压又治愈！快来试试！",
            "我又挑战成功了一关，你能行？",
            "我发现个奇怪又好玩的收纳游戏，拖拽归位，解压又治愈！快来试试！",
            "收纳加解压，有没有搞头？脑洞大开的游戏，几分钟玩一把，速来！",
            "收纳王者谁最强！舍我其谁！不服？你来！"
        ][shareType]
        const imageUrlIds = [
            ["lHiZ7ZoyTW+d2OnSt7etkg==", "0ign3VT/T+694lx22TyMyQ=="],
            ["tOwDqF3ZTLaeyl05g/HTxw==", "8m4F9pZnT/6G14iiI9z9/A=="],
            ["0ign3VT/T+694lx22TyMyQ==", "cz0PtobASuOULV+8RUIO2w=="],
            ["0ign3VT/T+694lx22TyMyQ==", "lHiZ7ZoyTW+d2OnSt7etkg=="],
            ["lHiZ7ZoyTW+d2OnSt7etkg==", "0ign3VT/T+694lx22TyMyQ=="],
        ]
        const imageUrls = [
            [
                "https://mmocgame.qpic.cn/wechatgame/DobnMLnVSGic2ZU0b1ob1CPkpJXwBTNYItdKoMZsHV56WKy9O0szJ554nCckBMSIS/0",
                "https://mmocgame.qpic.cn/wechatgame/CAGsHtBIdf7ZLP3fQ2OVbvIBFZdKY3tDrYhMvgibh7gPlwqrk0icQwpfxia3Truiaiacv/0"],
            [
                "https://mmocgame.qpic.cn/wechatgame/bZQRLlglYibNQh2EkRA3hibdr8DM4Wu3ojjjK5fMa4NhsAdQYgOcSFudL9xsa49iaAy/0",
                "https://mmocgame.qpic.cn/wechatgame/G4OtLph8nCTmZUWVwV2owOfYTyDBaQ5Uia3icxVvnrlpibj8fqr7Yuy7nMHhauERa4r/0"
            ],
            [
                "https://mmocgame.qpic.cn/wechatgame/CAGsHtBIdf7ZLP3fQ2OVbvIBFZdKY3tDrYhMvgibh7gPlwqrk0icQwpfxia3Truiaiacv/0",
                "https://mmocgame.qpic.cn/wechatgame/SeCxPvibqPatzPrPibAQcKWRz1icSiaP6Twlw0vI6lgVibY0nt5tMDMOkop4rJaads5MB/0"
            ],
            [
                "https://mmocgame.qpic.cn/wechatgame/CAGsHtBIdf7ZLP3fQ2OVbvIBFZdKY3tDrYhMvgibh7gPlwqrk0icQwpfxia3Truiaiacv/0",
                "https://mmocgame.qpic.cn/wechatgame/DobnMLnVSGic2ZU0b1ob1CPkpJXwBTNYItdKoMZsHV56WKy9O0szJ554nCckBMSIS/0"
            ],
            [
                "https://mmocgame.qpic.cn/wechatgame/DobnMLnVSGic2ZU0b1ob1CPkpJXwBTNYItdKoMZsHV56WKy9O0szJ554nCckBMSIS/0",
                "https://mmocgame.qpic.cn/wechatgame/CAGsHtBIdf7ZLP3fQ2OVbvIBFZdKY3tDrYhMvgibh7gPlwqrk0icQwpfxia3Truiaiacv/0"
            ],
        ]
        const imageUrlTypeIds = imageUrlIds[shareType];
        const randomIndex = Math.floor(Math.random() * imageUrlTypeIds.length)
        const imageUrlId = imageUrlTypeIds[randomIndex]
        const imageUrl = imageUrls[randomIndex]
        return { title, query: shareType, imageUrlId, imageUrl };
    }

    public static RegisterPlatAppEvent() {
        wx.offShow()
        wx.offHide()

        wx.onShow((data) => {
            console.log(`微信onShow`, data)
        })

        wx.onHide(() => {
            console.log(`微信onHide`)
        })

    }

    public static showShareMenu() {
        wx.showShareMenu({
            menus: ['shareAppMessage', 'shareTimeline']
        })

        wx.onShareAppMessage(() => {
            const shareObj = this.getShareObj(ShareType.Other);
            // 用户点击了“转发”按钮
            return shareObj;
        })
    }

    /** 1：曝光； 2：点击 */
    public static reportUserBehaviorBranchAnalytics(reportEnum: ReportEnum, eventType: number, videoEnum: VideoEnum.RewardedVideo) {
        // step1. 广告前场景-曝光上报
        // step2. 广告前场景-点击上报
        // 将以下代码片段埋入如观看广告按钮的曝光
        wx.reportUserBehaviorBranchAnalytics({
            branchId: reportIds[reportEnum],
            branchDim: `${videoEnum}`, // 自定义维度(可选)：类型String，取值[1,100]，必须为整数，当上传类型不符时不统计
            eventType: eventType // 1：曝光； 2：点击
        });
    }

    static logReport() {
        const logger = wx.getMiniReportManager({ debug: true, eventList: ['10000003'] });
        logger.report({
            eventID: '10000003',       // 事件ID
            levelID: 1,                // 关卡ID - 对应每个关卡/节点唯一ID
            levelName: '第三关',        // 关卡名称 - 如：第1关、第2关、第3关等
            levelAction: 1,            // 关卡类型 - 1:主线关卡，2:自定义（开发者可新增，可以是副玩法）
            levelResult: 2,            // 关卡动作 - 1:成功，2:失败，3:重试，4:复活，5:进入，6:退出，7:使用道具，8:广告激励，9:分享
            levelTime: 40,             // 关卡用时 - 单位秒（前台时间，不含广告及跳出游戏的时间），仅LevelResult=1成功上报有效
            levelProgress: 75,         // 关卡进度 - 0-100
            loginCount: 1,             // 关卡进入次数 - 每次进入累计上报，仅LevelResult=5进入上报有效，首次进入上报1
            gameVersion: 3,            // 游戏版本号
            success(res) {
                console.log('上报成功:', res)
            },
            fail(res) {
                console.log('上报失败:', res)
            },
            complete(res) {
                console.log('上报完成:', res)
            }
        });
    }
}

const reportIds = ["BCBgAAoXHx5d1QpzuGCJR1"];


const videoIds = [
    "adunit-27790c1980b36ebb",
    "adunit-ea1f4d5ea4698881",
    "adunit-94b1deddc4689650",
    "adunit-85885df196e097a0",
    "adunit-6beb292287902fad",
    "adunit-98f8212883af1898",
    "adunit-b921c252bea4f926",
    "adunit-a0b27bcd2add250d"
]


const customAdIds = [
    "adunit-3cce8d7856c13e1e",
    "adunit-82063a7096d5b174",
    "adunit-56ca3a1607e068a8",
]


