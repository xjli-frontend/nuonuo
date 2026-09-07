import { AudioClip, AudioSource, Node, resources } from "cc";
import { gameState } from "../nuonuo/core/GameState";

/**
 * 音频管理器（Cocos 运行时实现，对齐源工程 AudioManager 的行为）
 *
 * - 音效：resources/audio/sfx_<name>.mp3 懒加载，每个音效一个 AudioSource（重复播放会重头播放）
 * - BGM：单一 AudioSource 循环播放，全场景统一 bgm_theme（源工程「当前全场景统一使用主题曲」）
 * - 开关：读取 gameState.sfxEnabled / musicEnabled；关闭音效时不播，关闭音乐时停 BGM
 * - 音量：BGM 0.45 / SFX 0.85（与源工程一致）
 *
 * 宿主在 boot 时调 init(parent) 挂载宿主节点（零 prefab，运行时构建）。
 */
export type SfxName =
    | 'ui_tap'        // 通用按钮点击
    | 'ui_popup'      // 弹窗打开
    | 'toggle_on'     // 开关打开
    | 'toggle_off'    // 开关关闭
    | 'pick'          // 拿起物品
    | 'drop'          // 放下物品（普通移动落位）
    | 'invalid'       // 非法放置回弹
    | 'match'         // 物品归位成功
    | 'undo'          // 撤销一步
    | 'refresh'       // 刷新重排
    | 'teleport'      // 传送门传送
    | 'ice'           // 破冰/结冰
    | 'switch'        // 机关按钮 / 活动墙桥
    | 'win'           // 通关胜利
    | 'fail'          // 关卡失败
    | 'reward'        // 领取每日奖励
    | 'ad_reward'     // 广告奖励到账
    | 'step_low'      // 步数告急
    | 'level_start';  // 进入关卡

export type BgmName = 'theme';

export class SoundManager {
    private static _inst: SoundManager;

    private static readonly BGM_VOLUME = 0.45;
    private static readonly SFX_VOLUME = 0.85;

    private host: Node | null = null;
    private bgmSource: AudioSource | null = null;
    private sfxSources: Map<string, AudioSource> = new Map();
    /** 当前应播放的 BGM（可能因开关关闭而尚未真正播放） */
    private wantedBgm: BgmName | null = null;

    static get instance(): SoundManager {
        if (!SoundManager._inst) SoundManager._inst = new SoundManager();
        return SoundManager._inst;
    }

    /** 挂载宿主节点（boot 时调用一次；重复调用会重建宿主） */
    init(parent: Node): void {
        if (this.host && this.host.isValid) this.host.destroy();
        this.sfxSources.clear();
        const host = new Node("soundManager");
        host.layer = parent.layer;
        parent.addChild(host);
        this.host = host;
        // BGM 专用 AudioSource（clip 懒加载，见 playBgm）
        this.bgmSource = host.addComponent(AudioSource);
        this.bgmSource.loop = true;
        this.bgmSource.volume = SoundManager.BGM_VOLUME;
    }

    /** 播放音效（音效开关关闭时不播） */
    playSfx(name: SfxName): void {
        if (!gameState.sfxEnabled) return;
        if (!this.host) return;
        const existing = this.sfxSources.get(name);
        if (existing) {
            existing.play();
            return;
        }
        resources.load(`audio/sfx_${name}`, AudioClip, (err, clip) => {
            if (err || !clip) {
                console.warn('[SoundManager] 音效缺失:', name, err);
                return;
            }
            if (!this.host || !this.host.isValid) return;
            const src = this.sfxSources.get(name);
            if (src) {
                src.play();
                return;
            }
            const n = new Node(`sfx_${name}`);
            n.layer = this.host.layer;
            this.host.addChild(n);
            const audio = n.addComponent(AudioSource);
            audio.clip = clip;
            audio.volume = SoundManager.SFX_VOLUME;
            audio.play();
            this.sfxSources.set(name, audio);
        });
    }

    /** 播放背景音乐（循环；已在播同名时不重复触发，切换会停掉上一首） */
    playBgm(name: BgmName): void {
        this.wantedBgm = name;
        if (!this.bgmSource || !this.host) return;
        if (!gameState.musicEnabled) {
            this.bgmSource.stop();
            return;
        }
        if (this.bgmSource.clip && this.bgmSource.clip.name === `bgm_${name}`) {
            // clip 已加载过（含被音乐开关 stop 过的情况）：没在播就续播，不重复触发加载
            if (!this.bgmSource.playing) this.bgmSource.play();
            return;
        }
        resources.load(`audio/bgm_${name}`, AudioClip, (err, clip) => {
            if (err || !clip || !this.bgmSource || !this.bgmSource.isValid) {
                console.warn('[SoundManager] BGM 缺失:', name, err);
                return;
            }
            this.bgmSource.stop();
            this.bgmSource.clip = clip;
            this.bgmSource.play();
        });
    }

    /** 音乐开关变化后调用：开 → 续播 wantedBgm；关 → 停 BGM */
    onMusicToggle(): void {
        if (gameState.musicEnabled && this.wantedBgm) {
            this.playBgm(this.wantedBgm);
        } else if (this.bgmSource) {
            this.bgmSource.stop();
        }
    }
}
