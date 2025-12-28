/**
 * 游戏核心类
 */
const AudioManager = require('./AudioManager.js');

class Game {
    constructor(canvas, ctx, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        this.currentScene = null;
        this.isRunning = false;
        this.lastTime = 0;

        // 初始化音乐管理器
        this.audioManager = new AudioManager();
        this.audioManager.init();

        // 缩放计算 (基于750rpx设计稿)
        this.rpx2px = this.width / 750;

        this.registerTouchEvents();
    }

    /**
     * 将rpx转换为px
     */
    toPx(rpx) {
        return rpx * this.rpx2px;
    }

    registerTouchEvents() {
        // 核心修复：微信小游戏环境不使用 canvas.addEventListener
        // 应使用全局的 wx.onTouchStart/End 接口
        if (typeof wx !== 'undefined') {
            wx.onTouchStart((res) => {
                if (this.currentScene && this.currentScene.onTouchStart) {
                    const touch = res.touches[0];
                    this.currentScene.onTouchStart(touch.clientX, touch.clientY);
                }
            });

            wx.onTouchEnd((res) => {
                if (this.currentScene && this.currentScene.onTouchEnd) {
                    const touch = res.changedTouches[0];
                    this.currentScene.onTouchEnd(touch.clientX, touch.clientY);
                }
            });
        }
    }

    switchScene(scene) {
        if (this.currentScene && this.currentScene.onExit) {
            this.currentScene.onExit();
        }
        this.currentScene = scene;
        if (this.currentScene && this.currentScene.onEnter) {
            this.currentScene.onEnter();
        }
    }

    start() {
        this.isRunning = true;
        this.lastTime = 0; // 重置 lastTime

        const MenuScene = require('../scenes/MenuScene.js');
        this.switchScene(new MenuScene(this));
        this.gameLoop();
    }

    gameLoop(time) {
        if (!time) {
            time = (typeof performance !== 'undefined' && performance.now) ? performance.now() :
                (typeof wx !== 'undefined' && wx.getPerformance) ? wx.getPerformance().now() :
                    Date.now();
        }

        if (!this.isRunning) return;

        // 首帧特殊处理
        if (this.lastTime === 0) {
            this.lastTime = time;
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.currentScene.render(this.ctx);
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    stop() {
        this.isRunning = false;
    }
}

module.exports = Game;
