/**
 * 首页场景 - 深度还原《羊了个羊》版
 */
class MenuScene {
    constructor(game) {
        this.game = game;
        this.maxLevel = wx.getStorageSync('maxLevel') || 1;
        this.clouds = [
            { x: this.game.toPx(100), y: this.game.toPx(150), s: 0.8 },
            { x: this.game.toPx(500), y: this.game.toPx(100), s: 1.2 },
            { x: this.game.toPx(300), y: this.game.toPx(200), s: 0.6 }
        ];
    }

    onEnter() {
        this.maxLevel = wx.getStorageSync('maxLevel') || 1;
    }

    update(deltaTime) {
        // 云朵飘动微动画
        this.clouds.forEach(c => {
            c.x += 0.2;
            if (c.x > this.game.width + 100) c.x = -100;
        });
    }

    render(ctx) {
        const { width, height } = this.game;

        // 1. 设置背景：蓝天到白云的渐变
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);
        skyGradient.addColorStop(0, '#3498db');
        skyGradient.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height);

        // 2. 绘制远处的彩虹
        this.drawRainbow(ctx, width, height);

        // 3. 绘制星球
        this.drawPlanet(ctx, width * 0.5, height * 0.15);

        // 4. 绘制飘动的云朵
        this.clouds.forEach(c => this.drawCloud(ctx, c.x, c.y, this.game.toPx(30) * c.s));

        // 5. 绘制草地
        ctx.fillStyle = '#9ada5d';
        ctx.fillRect(0, height * 0.55, width, height * 0.45);

        // 6. 绘制白色围栏
        this.drawFence(ctx, height * 0.72);

        // 7. 绘制红房子 (Barn)
        this.drawBarn(ctx, width * 0.5, height * 0.5);

        // 8. 绘制DJ台和DJ猫 (使用emoji代替)
        this.drawDJ(ctx, width * 0.5, height * 0.52);

        // 9. 绘制侧边功能按钮
        this.drawSideButtons(ctx);

        // 10. 绘制"加入羊群"大按钮 - 下移到安全位置
        this.drawJoinButton(ctx, width * 0.5, height * 0.82);

        // 11. 绘制角落图标 (排行榜、收藏)
        this.drawBottomIcons(ctx);

        // 音乐开关
        this.drawMusicButton(ctx);
    }

    drawRainbow(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const colors = ['#ff7675', '#fab1a0', '#ffeaa7', '#55efc4', '#81ecec', '#a29bfe'];
        colors.forEach((color, i) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = this.game.toPx(12);
            ctx.arc(centerX, centerY, this.game.toPx(200 + i * 12), Math.PI, 0);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawPlanet(ctx, x, y) {
        ctx.save();
        const r = this.game.toPx(60);
        // 行星环
        ctx.strokeStyle = '#fd79a8';
        ctx.lineWidth = this.game.toPx(8);
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.5, r * 0.4, Math.PI / 8, 0, Math.PI * 2);
        ctx.stroke();
        // 行星本体
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        grad.addColorStop(0, '#74b9ff');
        grad.addColorStop(1, '#0984e3');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawCloud(ctx, x, y, size) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.7, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 1.4, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFence(ctx, y) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        const width = this.game.width;
        const fenceW = this.game.toPx(20);
        const fenceH = this.game.toPx(60);
        const gap = this.game.toPx(40);
        for (let x = 0; x < width; x += gap) {
            ctx.fillRect(x, y, fenceW, fenceH);
            ctx.strokeRect(x, y, fenceW, fenceH);
        }
        ctx.fillRect(0, y + fenceH * 0.3, width, fenceH * 0.15);
        ctx.fillRect(0, y + fenceH * 0.7, width, fenceH * 0.15);
        ctx.restore();
    }

    drawBarn(ctx, x, y) {
        ctx.save();
        const w = this.game.toPx(280);
        const h = this.game.toPx(200);
        // 屋顶
        ctx.fillStyle = '#4b3621'; // 深棕色屋顶
        ctx.beginPath();
        ctx.moveTo(x - w / 2 - 10, y + h * 0.3);
        ctx.lineTo(x, y);
        ctx.lineTo(x + w / 2 + 10, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        // 墙体
        ctx.fillStyle = '#d63031'; // 红色墙体
        ctx.fillRect(x - w / 2, y + h * 0.3, w, h * 0.7);
        // 门
        ctx.fillStyle = 'black';
        ctx.fillRect(x - w / 6, y + h * 0.6, w / 3, h * 0.4);
        // 装饰线
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2 + 10, y + h * 0.35, w - 20, h * 0.6);
        ctx.restore();
    }

    drawDJ(ctx, x, y) {
        ctx.save();
        // DJ台
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x - 30, y + 120, 60, 30);
        // 猫猫 (Emoji)
        ctx.font = `${this.game.toPx(50)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🐱', x, y + 130);
        ctx.restore();
    }

    drawSideButtons(ctx) {
        const xLeft = this.game.toPx(60);
        const xRight = this.game.width - this.game.toPx(60);
        const startY = this.game.toPx(280); // 下移按钮起始位置
        const gap = this.game.toPx(95);
        const radius = this.game.toPx(35);

        // 按钮配置：图标、名称、功能类型
        const leftButtons = [
            { icon: '📋', name: '每日任务', action: 'dailyTask' },
            { icon: '🌍', name: '世界排行', action: 'worldRank' },
            { icon: '🚀', name: '话题挑战', action: 'challenge' },
            { icon: '🎁', name: '领取奖励', action: 'reward' }
        ];
        const rightButtons = [
            { icon: '🎮', name: '小游戏', action: 'miniGame' },
            { icon: '🛌', name: '休息一下', action: 'rest' },
            { icon: '🛒', name: '道具商店', action: 'shop' },
            { icon: '🦌', name: '皮肤收藏', action: 'skins' }
        ];

        // 存储按钮区域信息用于点击检测
        this.sideButtons = [];

        leftButtons.forEach((btn, i) => {
            const y = startY + i * gap;
            this.drawCircleIcon(ctx, xLeft, y, btn.icon);
            this.sideButtons.push({
                x: xLeft - radius,
                y: y - radius,
                width: radius * 2,
                height: radius * 2,
                name: btn.name,
                action: btn.action
            });
        });

        rightButtons.forEach((btn, i) => {
            const y = startY + i * gap;
            this.drawCircleIcon(ctx, xRight, y, btn.icon);
            this.sideButtons.push({
                x: xRight - radius,
                y: y - radius,
                width: radius * 2,
                height: radius * 2,
                name: btn.name,
                action: btn.action
            });
        });
    }

    drawCircleIcon(ctx, x, y, icon) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, this.game.toPx(35), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = `${this.game.toPx(30)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x, y);
        ctx.restore();
    }

    drawJoinButton(ctx, x, y) {
        const w = this.game.toPx(420);
        const h = this.game.toPx(110);
        const r = h / 2;

        ctx.save();

        // 1. 外部发光效果
        ctx.shadowColor = 'rgba(255, 165, 0, 0.6)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 0;

        // 2. 绘制胶囊形状底层（3D厚度效果）
        ctx.fillStyle = '#cc6600';
        this.drawCapsule(ctx, x, y + 4, w, h, r);
        ctx.fill();

        // 3. 主体渐变背景
        const gradient = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
        gradient.addColorStop(0, '#FFD93D');
        gradient.addColorStop(0.5, '#FF9F1C');
        gradient.addColorStop(1, '#FF6B35');
        ctx.fillStyle = gradient;
        this.drawCapsule(ctx, x, y, w, h, r);
        ctx.fill();

        // 4. 顶部高光
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(x, y - h * 0.2, w * 0.35, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 5. 边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        this.drawCapsule(ctx, x, y, w, h, r);
        ctx.stroke();

        // 6. 文字阴影和主体
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.game.toPx(44)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐑 加入羊群', x, y);

        this.startButton = { x: x - w / 2, y: y - h / 2, width: w, height: h };
        ctx.restore();
    }

    // 绘制胶囊形状辅助函数
    drawCapsule(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + r, y - h / 2);
        ctx.lineTo(x + w / 2 - r, y - h / 2);
        ctx.arc(x + w / 2 - r, y, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(x - w / 2 + r, y + h / 2);
        ctx.arc(x - w / 2 + r, y, r, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
    }

    drawBottomIcons(ctx) {
        // 调整位置：放在按钮两侧，与按钮同一水平线
        const y = this.game.height * 0.82;
        const radius = this.game.toPx(35);
        const xLeft = this.game.toPx(65);
        const xRight = this.game.width - this.game.toPx(65);

        this.drawCircleIcon(ctx, xLeft, y, '📊');
        this.drawCircleIcon(ctx, xRight, y, '⭐');

        // 存储底部按钮区域用于点击检测
        this.bottomButtons = [
            { x: xLeft - radius, y: y - radius, width: radius * 2, height: radius * 2, name: '排行榜', action: 'leaderboard' },
            { x: xRight - radius, y: y - radius, width: radius * 2, height: radius * 2, name: '收藏', action: 'favorite' }
        ];
    }

    drawMusicButton(ctx) {
        // 与右侧按钮列对齐
        const x = this.game.width - this.game.toPx(60);
        const y = this.game.toPx(180); // 在侧边按钮上方
        const radius = this.game.toPx(35);
        this.drawCircleIcon(ctx, x, y, this.game.audioManager.isMusicOn ? '🔊' : '🔇');
        this.musicButton = { x: x - radius, y: y - radius, width: radius * 2, height: radius * 2 };
    }

    onTouchEnd(x, y) {
        // 1. 检测主按钮：加入羊群
        if (this.startButton && x >= this.startButton.x && x <= this.startButton.x + this.startButton.width &&
            y >= this.startButton.y && y <= this.startButton.y + this.startButton.height) {

            const TransitionScene = require('./TransitionScene.js');
            const GameScene = require('./GameScene.js');
            this.game.switchScene(new TransitionScene(this.game, 1, () => {
                this.game.switchScene(new GameScene(this.game, 1));
            }));
            return;
        }

        // 2. 检测音乐按钮
        if (this.musicButton && x >= this.musicButton.x && x <= this.musicButton.x + this.musicButton.width &&
            y >= this.musicButton.y && y <= this.musicButton.y + this.musicButton.height) {
            this.game.audioManager.toggleMusic();
            return;
        }

        // 3. 检测侧边功能按钮
        if (this.sideButtons) {
            for (const btn of this.sideButtons) {
                if (x >= btn.x && x <= btn.x + btn.width &&
                    y >= btn.y && y <= btn.y + btn.height) {
                    this.handleSideButtonClick(btn);
                    return;
                }
            }
        }

        // 4. 检测底部按钮（排行榜、收藏）
        if (this.bottomButtons) {
            for (const btn of this.bottomButtons) {
                if (x >= btn.x && x <= btn.x + btn.width &&
                    y >= btn.y && y <= btn.y + btn.height) {
                    this.handleBottomButtonClick(btn);
                    return;
                }
            }
        }
    }

    // 处理侧边按钮点击
    handleSideButtonClick(btn) {
        switch (btn.action) {
            case 'dailyTask':
                wx.showModal({
                    title: '📋 每日任务',
                    content: '今日任务：\n✅ 通关第1关 (+50金币)\n⬜ 通关第2关 (+100金币)\n⬜ 使用道具3次 (+30金币)',
                    showCancel: false,
                    confirmText: '知道了'
                });
                break;

            case 'worldRank':
                wx.showModal({
                    title: '🌍 世界排行榜',
                    content: '🥇 第1名: 小明 - 第99关\n🥈 第2名: 小红 - 第88关\n🥉 第3名: 小刚 - 第77关\n...\n📍 你的排名: 第' + (Math.floor(Math.random() * 1000) + 100) + '名',
                    showCancel: false,
                    confirmText: '冲榜!'
                });
                break;

            case 'challenge':
                wx.showModal({
                    title: '🚀 话题挑战赛',
                    content: '🔥 本周热门话题:\n「一命通关挑战」\n参与人数: 10,234\n奖励: 限定皮肤 + 500金币\n\n是否参与挑战?',
                    confirmText: '参加!',
                    cancelText: '下次吧',
                    success: (res) => {
                        if (res.confirm) {
                            wx.showToast({ title: '已报名成功', icon: 'success' });
                        }
                    }
                });
                break;

            case 'reward':
                wx.showModal({
                    title: '🎁 领取奖励',
                    content: '🎉 恭喜获得每日登录奖励!\n\n+100 金币\n+1 撤回道具\n+1 洗牌道具',
                    showCancel: false,
                    confirmText: '开心收下',
                    success: () => {
                        wx.showToast({ title: '+100金币', icon: 'success' });
                    }
                });
                break;

            case 'miniGame':
                wx.showModal({
                    title: '🎮 更多小游戏',
                    content: '推荐好玩的小游戏:\n\n🧩 合成大西瓜\n🎯 跳一跳\n🏃 天天跑酷\n\n是否跳转?',
                    confirmText: '去看看',
                    cancelText: '留在这',
                    success: (res) => {
                        if (res.confirm) {
                            wx.showToast({ title: '功能开发中', icon: 'none' });
                        }
                    }
                });
                break;

            case 'rest':
                wx.showModal({
                    title: '🛌 休息一下',
                    content: '你已经连续玩了 ' + Math.floor(Math.random() * 30 + 10) + ' 分钟\n\n适当休息，保护眼睛 👀\n\n设置休息提醒?',
                    confirmText: '设置提醒',
                    cancelText: '继续玩',
                    success: (res) => {
                        if (res.confirm) {
                            wx.showToast({ title: '已设置30分钟提醒', icon: 'success' });
                        }
                    }
                });
                break;

            case 'shop':
                wx.showModal({
                    title: '🛒 道具商店',
                    content: '热卖道具:\n\n🔙 撤回道具 x3 - 50金币\n🔀 洗牌道具 x3 - 80金币\n📤 移出道具 x3 - 100金币\n💎 无限道具包 - 648金币',
                    confirmText: '购买',
                    cancelText: '逛逛',
                    success: (res) => {
                        if (res.confirm) {
                            wx.showToast({ title: '功能开发中', icon: 'none' });
                        }
                    }
                });
                break;

            case 'skins':
                wx.showModal({
                    title: '🦌 皮肤收藏',
                    content: '已解锁皮肤:\n\n🐑 经典小羊 ✅\n🐑 圣诞小羊 🔒\n🐑 新年小羊 🔒\n🐑 黄金小羊 🔒\n\n通关更多关卡解锁皮肤!',
                    showCancel: false,
                    confirmText: '好的'
                });
                break;

            default:
                wx.showToast({ title: btn.name, icon: 'none' });
        }
    }

    // 处理底部按钮点击
    handleBottomButtonClick(btn) {
        switch (btn.action) {
            case 'leaderboard':
                // 排行榜功能
                wx.showModal({
                    title: '📊 好友排行榜',
                    content: '🥇 小明 - 第15关\n🥈 小红 - 第12关\n🥉 小刚 - 第10关\n4. 小美 - 第8关\n5. 小华 - 第6关\n...\n📍 你: 第' + (wx.getStorageSync('maxLevel') || 1) + '关',
                    showCancel: true,
                    confirmText: '分享炫耀',
                    cancelText: '知道了',
                    success: (res) => {
                        if (res.confirm) {
                            wx.shareAppMessage({
                                title: '我在羊了个羊已通关第' + (wx.getStorageSync('maxLevel') || 1) + '关，你能超过我吗？',
                                imageUrl: ''
                            });
                        }
                    }
                });
                break;

            case 'favorite':
                // 收藏功能
                wx.showModal({
                    title: '⭐ 收藏小程序',
                    content: '收藏后可在微信「发现-小程序」中快速找到本游戏哦！\n\n点击右上角「...」添加到「我的小程序」',
                    showCancel: false,
                    confirmText: '知道了'
                });
                break;

            default:
                wx.showToast({ title: btn.name, icon: 'none' });
        }
    }
}

module.exports = MenuScene;
