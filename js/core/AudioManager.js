/**
 * 音乐管理器
 */
class AudioManager {
    constructor() {
        this.bgm = null;
        this.isMusicOn = true;
    }

    /**
     * 初始化背景音乐
     */
    init() {
        // 使用微信小游戏音频API
        this.bgm = wx.createInnerAudioContext();

        // 使用维基百科托管的稳定外链（无防盗链限制）
        this.bgm.src = 'https://upload.wikimedia.org/wikipedia/commons/2/27/Fluffing_a_Duck_%28ISRC_USUAN1100768%29.mp3';
        this.bgm.loop = true;
        this.bgm.volume = 0.5;

        // 自动播放
        this.bgm.onCanplay(() => {
            if (this.isMusicOn) {
                this.bgm.play();
            }
        });

        // 错误处理
        this.bgm.onError((err) => {
            console.log('音乐加载失败:', err);
        });
    }

    /**
     * 播放音乐
     */
    play() {
        if (this.bgm && this.isMusicOn) {
            this.bgm.play();
        }
    }

    /**
     * 暂停音乐
     */
    pause() {
        if (this.bgm) {
            this.bgm.pause();
        }
    }

    /**
     * 切换音乐开关
     */
    toggleMusic() {
        this.isMusicOn = !this.isMusicOn;

        if (this.isMusicOn) {
            this.play();
        } else {
            this.pause();
        }

        return this.isMusicOn;
    }
}

module.exports = AudioManager;
