/**
 * 转场场景 - 实现难度飙升动画
 */
class TransitionScene {
    constructor(game, nextLevel, onComplete) {
        this.game = game;
        this.nextLevel = nextLevel;
        this.onComplete = onComplete;

        // 动画属性
        this.progress = 0;
        this.duration = 2.0; // 总时长统一定制为 2.0s
        this.bannerX = this.game.width; // 从右侧开始

        // 状态：0-滑入，1-停留，2-滑出
        this.state = 0;
        this.timer = 0;
    }

    onEnter() {
        // 可以播放转场音效
    }

    update(deltaTime) {
        this.timer += deltaTime;

        // 【优化】子阶段时长分配，总计 2.0s
        const inDuration = 0.5;
        const stayDuration = 1.0;
        const outDuration = 0.5;

        if (this.timer < inDuration) {
            this.state = 0;
            const t = this.timer / inDuration;
            const easeIn = 1 - Math.pow(1 - t, 3); // Cubic out
            this.bannerX = this.game.width - (this.game.width + 100) / 2 * easeIn;
            // 目标是中间 (用 Banner 中心对准屏中心，简化逻辑)
            this.bannerX = this.game.width - (this.game.width) * 0.5 * easeIn;
        } else if (this.timer < inDuration + stayDuration) {
            this.state = 1;
            this.bannerX = this.game.width * 0.5;
        } else if (this.timer < inDuration + stayDuration + outDuration) {
            this.state = 2;
            const t = (this.timer - inDuration - stayDuration) / outDuration;
            const easeOut = Math.pow(t, 3); // Cubic in
            this.bannerX = (this.game.width * 0.5) - (this.game.width * 0.6) * easeOut;
        } else {
            // 动画结束
            if (this.onComplete) this.onComplete();
        }
    }

    render(ctx) {
        const { width, height } = this.game;

        // 依然保留草地背景，增加连贯感
        ctx.fillStyle = '#9ada5d';
        ctx.fillRect(0, 0, width, height);

        // 绘制转场横幅
        const bannerH = this.game.toPx(180);
        const bannerY = height * 0.45;

        ctx.save();
        ctx.translate(this.bannerX, bannerY);

        // 黑色底带
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(-width / 2, -bannerH / 2, width, bannerH);

        // 装饰黄条
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-width / 2, -bannerH / 2, width, 10);
        ctx.fillRect(-width / 2, bannerH / 2 - 10, width, 10);

        // 文字内容
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 判定是否显示难度飙升 (第一关不显示)
        const isDifficultySpike = this.nextLevel > 1;

        if (isDifficultySpike) {
            // 关卡文字
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${this.game.toPx(36)}px sans-serif`;
            ctx.fillText(`第 ${this.nextLevel} 关`, 0, -this.game.toPx(25));

            // 警告文字
            ctx.fillStyle = '#e74c3c';
            ctx.font = `bold ${this.game.toPx(50)}px sans-serif`;
            ctx.fillText('! 难度飙升 !', 0, this.game.toPx(35));
        } else {
            // 第一关文案居中且优雅
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${this.game.toPx(50)}px sans-serif`;
            ctx.fillText(`第 ${this.nextLevel} 关`, 0, 0);

            ctx.fillStyle = '#2ecc71';
            ctx.font = `bold ${this.game.toPx(24)}px sans-serif`;
            ctx.fillText('新手入门', 0, this.game.toPx(55));
        }

        ctx.restore();
    }

    onTouchEnd() {
        // 转场中途不允许跳过，除非有特殊需求
    }
}

module.exports = TransitionScene;
