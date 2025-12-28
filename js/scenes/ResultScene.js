/**
 * 结算场景 - 独立透明叠加版
 */
class ResultScene {
    constructor(game, previousScene, isWin) {
        this.game = game;
        this.previousScene = previousScene;
        this.isWin = isWin;

        // 动效属性
        this.scale = 0.5;
        this.alpha = 0;
        this.animProgress = 0;
        this.isEntering = true;

        this.initButtons();
    }

    initButtons() {
        const { width, height } = this.game;
        const btnW = this.game.toPx(500);
        const btnH = this.game.toPx(100);

        // 主按钮：逻辑中心坐标 (0, Y_Offset) - 在 renderDialog 中相对于中心点绘制
        this.actionButton = {
            id: 'retry',
            width: btnW,
            height: btnH,
            relativeY: height * 0.15, // 位于中心点下方 15% 屏幕高度处
            text: this.isWin ? '进入下一关' : '重新挑战',
            color: this.isWin ? '#2ecc71' : '#f67280',
            hasIcon: !this.isWin
        };

        // 次按钮
        this.homeButton = {
            id: 'home',
            width: btnW,
            height: btnH,
            relativeY: height * 0.15 + btnH + this.game.toPx(30),
            text: '返回首页',
            color: 'transparent',
            borderColor: 'rgba(255,255,255,0.5)'
        };
    }

    update(deltaTime) {
        if (this.isEntering) {
            this.animProgress += deltaTime * 4;
            if (this.animProgress >= 1) {
                this.animProgress = 1;
                this.isEntering = false;
            }
            // 简单的平滑缓动
            this.scale = 0.5 + 0.5 * this.animProgress;
            this.alpha = this.animProgress;
        }
    }

    render(ctx) {
        // 1. 绘制底层场景 (营造透明叠加感)
        if (this.previousScene) {
            this.previousScene.render(ctx);
        }

        // 2. 全局遮罩
        ctx.fillStyle = `rgba(0,0,0,${0.6 * this.alpha})`;
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // 3. 结算弹窗
        ctx.save();
        ctx.translate(this.game.width / 2, this.game.height / 2);
        ctx.scale(this.scale, this.scale);
        this.renderDialog(ctx);
        ctx.restore();
    }

    renderDialog(ctx) {
        const { width, height } = this.game;

        // 1. Emoji 图标
        ctx.font = `${this.game.toPx(140)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.isWin ? '🥳' : '😫', 0, -height * 0.22);

        // 2. 标题文字 (强发光感)
        ctx.save();
        ctx.shadowColor = this.isWin ? 'rgba(46, 204, 113, 0.8)' : 'rgba(255, 118, 117, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.isWin ? '#2ecc71' : '#ff7675';
        ctx.font = `bold ${this.game.toPx(90)}px sans-serif`;
        ctx.fillText(this.isWin ? '挑战成功' : '挑战失败', 0, -height * 0.08);
        ctx.restore();

        // 3. 副标题
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `${this.game.toPx(46)}px sans-serif`;
        ctx.fillText(this.isWin ? '羊群欢迎你的加入' : '槽位已满', 0, 0);

        // 4. 关卡信息
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `${this.game.toPx(38)}px sans-serif`;
        ctx.fillText(`第 ${this.previousScene.currentLevel} 关`, 0, height * 0.07);

        // 5. 绘制按钮
        this.drawStyledButton(ctx, this.actionButton);
        this.drawStyledButton(ctx, this.homeButton);
    }

    drawStyledButton(ctx, btn) {
        const { width, height, text, color, borderColor, relativeY, hasIcon } = btn;
        const r = height / 2;

        ctx.save();
        // 直接使用相对于中心点的局部坐标偏移
        ctx.translate(0, relativeY);

        // 按钮背景
        if (color !== 'transparent') {
            ctx.fillStyle = color;
            this.roundRect(ctx, -width / 2, -height / 2, width, height, r);
            ctx.fill();
        } else if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1.5;
            this.roundRect(ctx, -width / 2, -height / 2, width, height, r);
            ctx.stroke();
        }

        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = `500 ${this.game.toPx(40)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let moveX = 0;
        if (hasIcon) {
            // 绘制精美的刷新图标
            this.drawRefreshIcon(ctx, -this.game.toPx(110), 0, this.game.toPx(18));
            moveX = this.game.toPx(35);
        }

        ctx.fillText(text, moveX, 0);
        ctx.restore();
    }

    drawRefreshIcon(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // 绘制圆环 (顺时针 3/4 圆)
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, -Math.PI * 0.2, Math.PI * 1.5);
        ctx.stroke();

        // 绘制箭头
        ctx.save();
        ctx.translate(size * 0.8 * Math.cos(-Math.PI * 0.2), size * 0.8 * Math.sin(-Math.PI * 0.2));
        ctx.rotate(-Math.PI * 0.25);
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, size * 0.4);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    drawPremiumButton(ctx, x, y, btn) {
        const w = btn.width;
        const h = btn.height;
        const r = h / 2;
        const depth = this.game.toPx(10);
        const color = btn.color;

        ctx.save();
        ctx.translate(x, y);

        // 1. 3D 厚度
        ctx.fillStyle = this.getDarkerColor(color);
        this.roundRect(ctx, -w / 2, -h / 2 + depth, w, h, r);
        ctx.fill();

        // 2. 按钮主体
        ctx.fillStyle = color;
        this.roundRect(ctx, -w / 2, -h / 2, w, h, r);
        ctx.fill();

        // 3. 顶部高光 (光感纹理)
        const grad = ctx.createLinearGradient(0, -h / 2, 0, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0.3)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        this.roundRect(ctx, -w / 2, -h / 2, w, h / 2, r);
        ctx.fill();

        // 4. 文字
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.game.toPx(40)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText(btn.text, 0, 0);

        ctx.restore();
    }

    onTouchEnd(x, y) {
        if (this.isEntering) return;

        // 检测“重新挑战”
        if (this.hitTest(this.actionButton, x, y)) {
            const GameScene = require('./GameScene.js');
            const TransitionScene = require('./TransitionScene.js');
            const nextLevel = this.isWin ? this.previousScene.currentLevel + 1 : this.previousScene.currentLevel;

            this.game.switchScene(new TransitionScene(this.game, nextLevel, () => {
                this.game.switchScene(new GameScene(this.game, nextLevel));
            }));
            return;
        }

        // 检测“返回首页”
        if (this.hitTest(this.homeButton, x, y)) {
            const MenuScene = require('./MenuScene.js');
            this.game.switchScene(new MenuScene(this.game));
        }
    }

    hitTest(btn, x, y) {
        // 由于布局是相对于中心点的，hitTest 需要将点转换回世界坐标
        const centerX = this.game.width / 2;
        const centerY = this.game.height / 2;

        // 算出按钮在屏幕上的绝对矩形
        const absX = centerX - btn.width / 2;
        const absY = centerY + btn.relativeY - btn.height / 2;

        return x >= absX && x <= absX + btn.width &&
            y >= absY && y <= absY + btn.height;
    }

    getDarkerColor(hex) {
        if (hex === '#2ecc71') return '#27ae60';
        if (hex === '#ff4757') return '#ee3f4d';
        return 'rgba(0,0,0,0.2)';
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
}

module.exports = ResultScene;
