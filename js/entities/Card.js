/**
 * 卡牌实体类 - 深度还原动效增强版
 */
class Card {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.layer = data.layer;
        this.state = data.state; // 0: 场上, 1: 槽位, 2: 已消除, 3: 飞行中, 4: 待定
        this.isCovered = data.isCovered;

        // 动效属性
        this.scale = 1.0;
        this.rotation = 0;
        this.alpha = 1.0;

        // 动画控制
        this.animating = false;
        this.animType = ''; // 'fly', 'match', 'click'
        this.animStartX = 0;
        this.animStartY = 0;
        this.animTargetX = 0;
        this.animTargetY = 0;
        this.animProgress = 0;
        this.animDuration = 0.3;
    }

    /**
     * 开始飞向槽位的动画
     */
    startFlyAnimation(targetX, targetY) {
        this.animating = true;
        this.animType = 'fly';
        this.animStartX = this.x;
        this.animStartY = this.y;
        this.animTargetX = targetX;
        this.animTargetY = targetY;
        this.animProgress = 0;
        this.animDuration = 0.35; // 稍微长一点，让动作更圆滑
    }

    /**
     * 开始洗牌动画 (包含位置随机化、旋转与缩放)
     */
    startShuffleAnimation(targetX, targetY) {
        this.animating = true;
        this.animType = 'shuffle';
        this.animStartX = this.x;
        this.animStartY = this.y;
        this.animTargetX = targetX;
        this.animTargetY = targetY;
        this.animProgress = 0;
        this.animDuration = 0.6; // 洗牌动画稍长
    }

    /**
     * 开始消除动画 (向中心点汇聚并升空)
     */
    startMatchAnimation(targetX, targetY) {
        this.animating = true;
        this.animType = 'match';
        this.animProgress = 0;
        this.animDuration = 0.3;
        this.animStartX = this.x;
        this.animStartY = this.y;
        this.animTargetX = targetX;
        this.animTargetY = targetY;
    }

    /**
     * 点击时的微缩放反馈
     */
    triggerClickEffect() {
        this.scale = 1.15;
        // 自动回弹
    }

    updateAnimation(deltaTime) {
        // 1. 回弹效果处理 (针对点击或简单的状态恢复)
        if (!this.animating && this.scale > 1.0) {
            this.scale -= deltaTime * 2;
            if (this.scale < 1.0) this.scale = 1.0;
        }

        if (!this.animating) return false;

        this.animProgress += deltaTime / this.animDuration;
        if (this.animProgress >= 1) {
            this.animProgress = 1;
            this.animating = false;
        }

        const t = this.animProgress;

        if (this.animType === 'fly') {
            // 飞行动画：平滑移动 + 抛物线感 (通过Y轴加成) + 缩放
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            this.x = this.animStartX + (this.animTargetX - this.animStartX) * ease;

            // 添加一个向上拱起的抛物线效果
            const jumpHeight = -40 * Math.sin(Math.PI * t);
            this.y = this.animStartY + (this.animTargetY - this.animStartY) * ease + jumpHeight;

            // 飞行中稍微缩小一点，增加空间感
            this.scale = 1.1 - 0.1 * Math.sin(Math.PI * t);

        } else if (this.animType === 'match') {
            // 消除动画：向指定的中心点（中间卡牌上方）同步汇聚并升空消失
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            this.x = this.animStartX + (this.animTargetX - this.animStartX) * ease;
            this.y = this.animStartY + (this.animTargetY - this.animStartY) * ease;

            // 动效调优：前 50% 保持比例以展现位移，后 50% 快速缩小
            this.scale = t < 0.5 ? 1.0 : Math.max(0, 1.0 - (t - 0.5) * 2);
            this.alpha = 1.0 - t * t;
        } else if (this.animType === 'shuffle') {
            // 洗牌动画：平滑移动 + 360度旋转 + 缩放起伏
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // Cubic ease
            this.x = this.animStartX + (this.animTargetX - this.animStartX) * ease;
            this.y = this.animStartY + (this.animTargetY - this.animStartY) * ease;

            // 旋转 360 度
            this.rotation = Math.PI * 2 * t;

            // 缩放：先变小再恢复
            this.scale = 1.0 - Math.sin(Math.PI * t) * 0.4;
        }

        return !this.animating;
    }

    render(ctx, cardW, cardH) {
        if (this.alpha <= 0) return;

        ctx.save();

        // 移动到卡牌中心进行变换
        ctx.translate(this.x + cardW / 2, this.y + cardH / 2);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        // 回到左上角进行绘制
        const drawX = -cardW / 2;
        const drawY = -cardH / 2;

        const radius = cardW * 0.12;
        const depth = cardH * 0.08;

        // 3. 底部微厚度 (加深颜色，消除白影感)
        ctx.fillStyle = '#cccccc';
        this.roundRect(ctx, drawX, drawY + 4, cardW, cardH, radius);
        ctx.fill();

        // 4. 正面主体 (优化阴影色调)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; // 强化阴影对比
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;

        // 保持表面微细渐变
        const gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + cardH);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f8f8f8');
        ctx.fillStyle = gradient;

        this.roundRect(ctx, drawX, drawY, cardW, cardH, radius);
        ctx.fill();
        ctx.restore();

        // 5. 描边优化
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 1.2;
        this.roundRect(ctx, drawX, drawY, cardW, cardH, radius);
        ctx.stroke();

        // 5. 遮挡状态
        if (this.isCovered && this.state === 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            this.roundRect(ctx, drawX, drawY, cardW, cardH, radius);
            ctx.fill();
        }

        // 6. Emoji 图标
        ctx.fillStyle = '#333';
        const fontSize = Math.floor(cardW * 0.65);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, 0, 0);

        ctx.restore();
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    hitTest(touchX, touchY, cardW, cardH) {
        if (this.alpha <= 0 || this.state === 2) return false;
        return touchX >= this.x && touchX <= this.x + cardW &&
            touchY >= this.y && touchY <= this.y + cardH;
    }
}

module.exports = Card;
