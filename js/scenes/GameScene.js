/**
 * 游戏场景 - UI完整还原版
 */
const Card = require('../entities/Card.js');
const levelUtil = require('../utils/level.js');

class GameScene {
    constructor(game, level) {
        this.game = game;
        this.currentLevel = level;
        this.cards = [];
        this.slotCards = [];
        this.holdingCards = []; // 移出的暂存卡牌
        this.maxSlot = 7;
        this.isGameOver = false;

        // 道具次数
        this.toolLimits = {
            undo: 2,
            shuffle: 2,
            remove: 2
        };

        this.lastCard = null; // 用于撤回的操作记录

        this.initGame();
    }

    initGame() {
        const cardsData = levelUtil.generateLevel(this.currentLevel);

        // 核心尺寸定义 (全部由rpx转换)
        this.cardWidth = this.game.toPx(90);
        this.cardHeight = this.game.toPx(110);

        this.cards = cardsData.map(data => {
            // 缩放初始坐标
            data.x = this.game.toPx(data.x);
            data.y = this.game.toPx(data.y);
            return new Card(data);
        });
        this.slotCards = [];
        this.isGameOver = false;
    }

    update(deltaTime) {
        this.cards.forEach(card => card.updateAnimation(deltaTime));
        this.holdingCards.forEach(card => card.updateAnimation(deltaTime)); // 暂存区卡牌也需要动画
    }

    render(ctx) {
        const { width, height } = this.game;

        // 1. 草地背景 (实色 + 随机草丛装饰)
        ctx.fillStyle = '#9ada5d';
        ctx.fillRect(0, 0, width, height);
        this.drawGrassTufts(ctx, width, height);

        // 2. 绘制顶部栏
        this.renderHeader(ctx);

        // 3. 绘制卡牌
        const sortedCards = [...this.cards].sort((a, b) => a.layer - b.layer);
        sortedCards.forEach(card => {
            if (card.state === 0 || card.state === 4) {
                card.render(ctx, this.cardWidth, this.cardHeight);
            }
        });

        // 4. 绘制底部区域
        this.renderFooter(ctx);

        // 4.5 绘制暂存区卡牌 (移出的卡牌)
        this.renderHoldingArea(ctx);
    }

    // 旧版结算逻辑已移除，由 ResultScene 独立处理

    drawGrassTufts(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = '#8bc34a';
        ctx.lineWidth = 2;
        // 固定种子画一些草丛
        const tufts = [
            { x: 0.2, y: 0.3 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.45 },
            { x: 0.15, y: 0.6 }, { x: 0.75, y: 0.55 }, { x: 0.4, y: 0.2 }
        ];
        tufts.forEach(t => {
            const x = t.x * width;
            const y = t.y * height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 5, y - 10);
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 12);
            ctx.moveTo(x, y);
            ctx.lineTo(x + 5, y - 10);
            ctx.stroke();
        });
        ctx.restore();
    }

    renderHeader(ctx) {
        const { width } = this.game;

        // 1. 顶部关卡标签 - 磨砂高级感
        const labelW = this.game.toPx(180);
        const labelH = this.game.toPx(60);
        const labelX = (width - labelW) / 2;
        const labelY = this.game.toPx(25);

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; // 深色半透明底
        this.roundRect(ctx, labelX, labelY, labelW, labelH, labelH / 2);
        ctx.fill();

        // 关卡文字
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${this.game.toPx(30)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`第 ${this.currentLevel} 关`, width / 2, labelY + labelH / 2);
        ctx.restore();

        // 2. 右上角返回图标 - 3D微动感
        const btnSize = this.game.toPx(64);
        const btnX = width - this.game.toPx(80);
        const btnY = this.game.toPx(55);
        this.drawCircleTool(ctx, btnX, btnY, btnSize, '↩', '#95a5a6', 0, false);
        this.backButton = { x: btnX - btnSize / 2, y: btnY - btnSize / 2, width: btnSize, height: btnSize };
    }

    renderFooter(ctx) {
        const { width, height } = this.game;
        // 底部槽位和道具 - 增加间距
        this.renderSlot(ctx, height - this.game.toPx(340)); // 槽位上移
        this.renderTools(ctx, height - this.game.toPx(100)); // 道具栏位置微调
    }

    renderTools(ctx, y) {
        const { width } = this.game;
        const toolSize = this.game.toPx(100);
        const gap = this.game.toPx(80);
        const startX = (width - (toolSize * 3 + gap * 2)) / 2;

        // 撤回 - 蓝色
        this.drawCircleTool(ctx, startX + toolSize / 2, y, toolSize, '↶', '#3498db', this.toolLimits.undo);
        this.undoButton = { x: startX, y: y - toolSize / 2, width: toolSize, height: toolSize };

        // 洗牌 - 绿色
        this.drawCircleTool(ctx, startX + toolSize + gap + toolSize / 2, y, toolSize, '🔀', '#2ecc71', this.toolLimits.shuffle);
        this.shuffleButton = { x: startX + toolSize + gap, y: y - toolSize / 2, width: toolSize, height: toolSize };

        // 移出 - 黄色
        this.drawCircleTool(ctx, startX + (toolSize + gap) * 2 + toolSize / 2, y, toolSize, '📤', '#f1c40f', this.toolLimits.remove);
        this.removeButton = { x: startX + (toolSize + gap) * 2, y: y - toolSize / 2, width: toolSize, height: toolSize };
    }

    drawCircleTool(ctx, x, y, size, icon, color, count, showBadge = true) {
        ctx.save();
        const r = size / 2;
        const isEnabled = count > 0 || !showBadge;
        const actualColor = isEnabled ? color : '#95a5a6';
        const depth = this.game.toPx(8);

        // 1. 底部厚度 (3D效果)
        ctx.fillStyle = this.getDarkerColor(actualColor);
        ctx.beginPath();
        ctx.arc(x, y + depth, r, 0, Math.PI * 2);
        ctx.fill();

        // 2. 按钮主体
        ctx.fillStyle = actualColor;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // 3. 顶部高光 (Specular Highlight)
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(x, y - r * 0.1, r * 0.85, Math.PI * 1.1, Math.PI * 1.9);
        ctx.fill();

        // 4. 白色描边
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.game.toPx(3);
        ctx.stroke();

        // 5. 图标 (带微弱投影) - 极致比例与重心纠正
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = 'white';
        // 极致比例 0.9，让图标视觉冲击力拉满
        ctx.font = `bold ${this.game.toPx(size * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 考虑 3D 厚度带来的视觉重心偏移，轻微向下修正 (约3px)
        ctx.fillText(icon, x, y + this.game.toPx(3));
        ctx.shadowBlur = 0;

        // 6. 次数标签 (漂亮的红底白字角标)
        if (showBadge) {
            const badgeR = r * 0.45;
            const badgeX = x + r * 0.75;
            const badgeY = y - r * 0.75;

            // 角标阴影
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY + 2, badgeR, 0, Math.PI * 2);
            ctx.fill();

            // 角标主体
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
            ctx.fill();

            // 角标描边
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.font = `bold ${this.game.toPx(22)}px sans-serif`;
            ctx.fillText(count, badgeX, badgeY);
        }

        ctx.restore();
    }

    getDarkerColor(hex) {
        // 简单的遮罩方式实现变暗
        if (hex.startsWith('rgba')) return hex;
        if (hex === '#3498db') return '#2980b9';
        if (hex === '#2ecc71') return '#27ae60';
        if (hex === '#f1c40f') return '#f39c12';
        if (hex === '#95a5a6') return '#7f8c8d';
        return 'rgba(0,0,0,0.3)';
    }

    renderSlot(ctx, y) {
        const { width } = this.game;
        const slotW = width - this.game.toPx(40);
        const slotH = this.game.toPx(160);
        const slotX = (width - slotW) / 2;
        const radius = this.game.toPx(20);

        // 1. 槽位背景 (原版是带波浪边的深木色或深绿色)
        ctx.save();
        ctx.fillStyle = '#4b3621'; // 深棕色木质感
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 10;
        this.roundRect(ctx, slotX, y, slotW, slotH, radius);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 2. 槽位内衬
        ctx.fillStyle = '#2d1e12';
        this.roundRect(ctx, slotX + 5, y + 5, slotW - 10, slotH - 10, radius - 5);
        ctx.fill();

        // 3. 槽位内卡牌位置
        const cardW = this.game.toPx(80);
        const cardGap = this.game.toPx(10);
        const innerStartX = slotX + (slotW - (7 * cardW + 6 * cardGap)) / 2;

        this.slotCards.forEach((card, i) => {
            // 修正判定：只要是槽位内的卡牌（state 1 或 待消除且未开飞的 state 2）
            // 且当前没有在执行动画（飞行或升空），就由槽位控制位置
            if ((card.state === 1 || card.state === 2) && !card.animating) {
                card.x = innerStartX + i * (cardW + cardGap);
                card.y = y + (slotH - this.cardHeight) / 2;
            }
            card.render(ctx, cardW, this.cardHeight);
        });
        ctx.restore();
    }

    drawButton(ctx, x, y, w, h, text, color = '#667eea', small = false) {
        ctx.save();
        const radius = this.game.toPx(40);
        const depth = this.game.toPx(8);

        // 1. 底部厚度
        ctx.fillStyle = this.getDarkerColor(color);
        this.roundRect(ctx, x - w / 2, y - h / 2 + depth, w, h, radius);
        ctx.fill();

        // 2. 按钮主体
        ctx.fillStyle = color;
        this.roundRect(ctx, x - w / 2, y - h / 2, w, h, radius);
        ctx.fill();

        // 3. 顶部微弱高光
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.roundRect(ctx, x - w / 2, y - h / 2, w, h / 2, radius);
        ctx.fill();

        // 4. 文字
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.font = `bold ${small ? this.game.toPx(24) : this.game.toPx(32)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

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

    /**
     * 实现道具：撤回
     */
    useUndo() {
        if (this.toolLimits.undo <= 0 || !this.lastCard) return;

        const { card, originX, originY } = this.lastCard;

        // 从槽位移除
        const idx = this.slotCards.indexOf(card);
        if (idx > -1) {
            this.slotCards.splice(idx, 1);

            // 还原状态
            card.state = 0;
            card.startFlyAnimation(originX, originY);

            this.toolLimits.undo--;
            this.lastCard = null; // 只能撤回一步

            // 立即刷新遮挡和槽位布局
            levelUtil.updateCoverState(this.cards, this.cardWidth, this.cardHeight);
            this.updateSlotLayout();
        }
    }

    /**
     * 实现道具：洗牌 (位置与花色双重随机化)
     */
    useShuffle() {
        if (this.toolLimits.shuffle <= 0) return;

        // 收集所有在场上的卡牌
        const activeCards = this.cards.filter(c => c.state === 0);
        if (activeCards.length === 0) return;

        // 提取所有原始位置和类型
        const positions = activeCards.map(c => ({ x: c.x, y: c.y }));
        const types = activeCards.map(c => c.type);

        // 打乱位置和类型
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }

        // 应用新位置、新类型并触发高级动画
        activeCards.forEach((c, i) => {
            const pos = positions[i];
            c.type = types[i];

            // 记录旧位置后的平滑移动+旋转动画
            c.startShuffleAnimation(pos.x, pos.y);
        });

        // 标记：动画期间可能需要暂停交互或在结束后刷新遮挡
        setTimeout(() => {
            levelUtil.updateCoverState(this.cards, this.cardWidth, this.cardHeight);
        }, 650); // 略多于动画时长

        this.toolLimits.shuffle--;
    }

    /**
     * 实现道具：移出
     */
    useRemove() {
        if (this.toolLimits.remove <= 0 || this.slotCards.length === 0) return;

        // 取出槽位前3张（不足3张则取全部）
        const toRemove = this.slotCards.splice(0, Math.min(3, this.slotCards.length));

        const removeY = this.game.height - this.game.toPx(450); // 暂存于道具栏上方
        const startX = (this.game.width - (toRemove.length * (this.cardWidth + 10))) / 2;

        toRemove.forEach((c, i) => {
            const tx = startX + i * (this.cardWidth + 10);
            c.state = 4; // 标记为暂存状态 (在 level.js 中已支持遮挡检测)
            c.startFlyAnimation(tx, removeY);
            this.holdingCards.push(c);
        });

        this.toolLimits.remove--;
        this.updateSlotLayout();
    }

    renderHoldingArea(ctx) {
        // 虽然在 handleCardClick 中处理了坐标，但这里可以绘制一个浅淡的基础区域
        if (this.holdingCards.length === 0) return;

        this.holdingCards.forEach(card => {
            card.render(ctx, this.cardWidth, this.cardHeight);
        });
    }

    onTouchEnd(x, y) {

        // 检测返回按钮
        if (this.backButton && this.hitTest(this.backButton, x, y)) {
            const MenuScene = require('./MenuScene.js');
            this.game.switchScene(new MenuScene(this.game));
            return;
        }

        // 检测道具按钮
        if (this.undoButton && this.hitTest(this.undoButton, x, y)) {
            this.useUndo();
            return;
        }
        if (this.shuffleButton && this.hitTest(this.shuffleButton, x, y)) {
            this.useShuffle();
            return;
        }
        if (this.removeButton && this.hitTest(this.removeButton, x, y)) {
            this.useRemove();
            return;
        }

        // 检测草地上的卡牌暂存区 (移出的卡牌也可点击)
        for (const card of this.holdingCards) {
            if (!card.isCovered && card.hitTest(x, y, this.cardWidth, this.cardHeight)) {
                // 从暂存区移除并处理点击
                const idx = this.holdingCards.indexOf(card);
                if (idx > -1) this.holdingCards.splice(idx, 1);
                this.handleCardClick(card);
                return;
            }
        }

        // 按层级从高到底层序检测点击 (确保点中视觉最上方的卡牌)
        const clickSortedCards = [...this.cards].sort((a, b) => b.layer - a.layer);

        for (const card of clickSortedCards) {
            // 只检测正在场上或在暂存区且未被遮盖的卡牌
            if ((card.state === 0 || card.state === 4) && !card.isCovered && card.hitTest(x, y, this.cardWidth, this.cardHeight)) {
                this.handleCardClick(card);
                return;
            }
        }
    }

    hitTest(rect, x, y) {
        return x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height;
    }

    handleCardClick(card) {
        // 【关键修复】如果槽位已满（包括正在飞的卡牌超过了限制），则不允许继续点击
        if (this.slotCards.length >= this.maxSlot) return;

        card.triggerClickEffect();

        const footerH = this.game.toPx(450);
        const footerY = this.game.height - footerH;
        const slotY = footerY + this.game.toPx(200);
        const slotH = this.game.toPx(200);
        const targetY = slotY + (slotH - this.cardHeight) / 2;

        // 【优化】计算插入位置：寻找同类卡牌并插入其后
        let insertionIndex = this.slotCards.length;
        const firstSameIndex = this.slotCards.findIndex(c => c.type === card.type);
        if (firstSameIndex > -1) {
            // 找到同类型的最后一项
            for (let i = firstSameIndex; i < this.slotCards.length; i++) {
                if (this.slotCards[i].type === card.type) {
                    insertionIndex = i + 1;
                } else {
                    break;
                }
            }
        }

        // 插入槽位
        this.slotCards.splice(insertionIndex, 0, card);
        card.state = 3; // 飞行中

        // 飞行终点
        const slotW = this.game.width - this.game.toPx(40);
        const slotX = (this.game.width - slotW) / 2;
        const cardSlotW = this.game.toPx(80);
        const cardGap = this.game.toPx(10);
        const innerStartX = slotX + (slotW - (7 * cardSlotW + 6 * cardGap)) / 2;
        const targetX = innerStartX + insertionIndex * (cardSlotW + cardGap);

        card.startFlyAnimation(targetX, targetY);

        // 立即更新桌面遮挡状态
        levelUtil.updateCoverState(this.cards, this.cardWidth, this.cardHeight);

        // 移出后通知其他卡牌补位
        this.updateSlotLayout();

        // 记录撤回信息：记录卡牌及其飞走前的坐标
        const originX = card.x;
        const originY = card.y;
        this.lastCard = { card, originX, originY };

        setTimeout(() => {
            card.state = 1; // 正式入槽
            this.checkMatch();
            this.checkGameStatus();
        }, 350);
    }

    /**
     * 更新槽位内卡牌的预期坐标，并触发受影响卡牌的平移
     */
    updateSlotLayout() {
        const footerH = this.game.toPx(450);
        const footerY = this.game.height - footerH;
        const slotY = footerY + this.game.toPx(200);
        const slotH = this.game.toPx(200);
        const targetY = slotY + (slotH - this.cardHeight) / 2;

        const slotW = this.game.width - this.game.toPx(40);
        const slotX = (this.game.width - slotW) / 2;
        const cardSlotW = this.game.toPx(80);
        const cardGap = this.game.toPx(10);
        const innerStartX = slotX + (slotW - (7 * cardSlotW + 6 * cardGap)) / 2;

        this.slotCards.forEach((card, i) => {
            const tx = innerStartX + i * (cardSlotW + cardGap);
            const ty = targetY;

            // 如果卡牌在槽位中（state 1），且目标位置发生了变化，则平滑移动
            if (card.state === 1 && !card.animating) {
                if (Math.abs(card.x - tx) > 1) {
                    card.startFlyAnimation(tx, ty); // 复用位移动画
                }
            }
        });
    }

    checkMatch() {
        if (this.slotCards.length < 3) return;

        const counts = {};
        this.slotCards.forEach(c => {
            // 【关键修复】只有已经完全落位（state === 1）的卡牌才参与匹配判定
            // 这样能确保匹配动画在最后一张牌稳定后再触发
            if (c.state === 1) {
                counts[c.type] = (counts[c.type] || 0) + 1;
            }
        });

        for (let type in counts) {
            if (counts[type] >= 3) {
                const matchedCards = this.slotCards.filter(c => c.type === type && c.state === 1).slice(0, 3);

                // 标记为正在处理消除
                matchedCards.forEach(c => { c.state = 2; });

                // 在最后一张牌落地后，稳稳地停顿一小会儿（200ms）
                setTimeout(() => {
                    // 【核心调整】锁定中间那张牌，并将目标设为其正上方 200px 处
                    const middleCard = matchedCards[1];
                    const targetX = middleCard.x;
                    const targetY = middleCard.y - this.game.toPx(200);

                    // 再次检查确认（防止异步状态变化）
                    matchedCards.forEach(c => {
                        c.startMatchAnimation(targetX, targetY);
                    });

                    setTimeout(() => {
                        matchedCards.forEach(c => {
                            const idx = this.slotCards.indexOf(c);
                            if (idx > -1) this.slotCards.splice(idx, 1);
                        });
                        this.updateSlotLayout();
                        this.checkWin(); // 关键补丁：消除后检查胜利
                        this.checkGameStatus();
                    }, 300);
                }, 200);

                return;
            }
        }
    }

    checkGameStatus() {
        // 只检查还在场上的原生卡牌
        const remaining = this.cards.filter(c => c.state === 0);
        if (remaining.length === 0 && this.slotCards.length === 0) {
            this.isGameOver = true;
            wx.setStorageSync('maxLevel', this.currentLevel + 1);
            // 移除自动跳转，由结算弹窗触发转场
        }

        // 失败判定：只有当所有卡牌都已就位，且槽位依然被占满时才判定失败
        // 1. 如果还有正在飞行的卡牌，暂时不判定失败
        const flyingCards = this.slotCards.filter(c => c.state === 3);
        if (flyingCards.length > 0) return;

        // 2. 统计已完全落位且未在消除中的卡牌
        const activeInSlot = this.slotCards.filter(c => c.state === 1);
        if (activeInSlot.length >= this.maxSlot) {
            // 最后双重检查：确保没有正在延迟消除中的卡牌
            const matchingCount = this.slotCards.filter(c => c.state === 2).length;
            if (matchingCount === 0) {
                const ResultScene = require('./ResultScene.js');
                this.game.switchScene(new ResultScene(this.game, this, false));
            }
        }
    }

    checkWin() {
        // 完成消除后主动调用
        const remaining = this.cards.filter(c => c.state === 0);
        if (remaining.length === 0 && this.slotCards.length === 0) {
            wx.setStorageSync('maxLevel', this.currentLevel + 1);
            const ResultScene = require('./ResultScene.js');
            this.game.switchScene(new ResultScene(this.game, this, true));
        }
    }
}

module.exports = GameScene;
