/**
 * 羊了个羊核心逻辑工具库 - 难度适配增强版
 */

const EMOJIS = ['🐑', '🐮', '🐷', '🐔', '🐸', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨'];

/**
 * 关卡生成器
 * @param {number} level 关卡数
 * @returns {Array} 卡牌数组
 */
function generateLevel(level = 1) {
    const cards = [];

    // 第一关：新手教学，精致偏移堆叠布局 (18张卡片，3种类型，上下错位两层)
    if (level === 1) {
        const pool = [];
        const selectedTypes = EMOJIS.slice(0, 3);
        // 每种 6 张，总共 18 张 (满足两个九宫格组合)
        for (let type of selectedTypes) {
            for (let k = 0; k < 6; k++) {
                pool.push(type);
            }
        }
        shuffle(pool);

        // 布局参数：增大网格间距以提升关卡美感，保持紧凑的 Y 轴堆叠偏移
        const startX = 160; // 调整坐标以适配大间距居中
        const startY = 240;
        const gap = 145;    // 增大间距，告别拥挤
        const offset = 12;  // 保持精致的堆叠偏移

        for (let i = 0; i < 18; i++) {
            const layer = Math.floor(i / 9); // 0-8 是底层，9-17 是顶层
            const indexInLayer = i % 9;

            // 核心修正：底层（layer 0）向下偏移，顶层（layer 1）在原位坐标
            // 这样顶层卡牌叠在底层卡牌的偏上方位置
            const yOffset = (layer === 0) ? offset : 0;

            cards.push({
                id: i,
                type: pool[i],
                x: startX + (indexInLayer % 3) * gap,
                y: startY + Math.floor(indexInLayer / 3) * gap + yOffset,
                layer: layer,
                isCovered: false,
                state: 0
            });
        }
        return updateCoverState(cards);
    }

    // 第二关及以后：难度飙升！
    // 算法思路：在 3x3 到 6x6 的网格基础上增加随机偏移和多层深度
    let cardCount = 0;
    let typeCount = 10;

    if (level === 2) {
        cardCount = 66; // 增加到66张
        typeCount = 8;
    } else {
        cardCount = Math.min(150, 60 + (level - 2) * 21); // 每关增加21张（7组）
        typeCount = 12;
    }

    // 确保总数是3的倍数
    cardCount = Math.floor(cardCount / 3) * 3;

    const pool = [];
    const selectedTypes = EMOJIS.slice(0, typeCount);
    for (let i = 0; i < cardCount / 3; i++) {
        const type = selectedTypes[i % typeCount];
        pool.push(type, type, type);
    }
    shuffle(pool);

    // 随机堆叠布局
    const containerW = 750;
    const cardW = 80; // 适配后的px宽度基准
    const usableW = 550; // 游戏区域宽
    const startX = (containerW - usableW) / 2;
    const startY = 180;
    const usableH = 450;

    const maxLayers = Math.min(15, 6 + level * 2); // 极大的层级深度

    for (let i = 0; i < cardCount; i++) {
        // 生成具有“网格感”但带随机偏移的坐标，增加挑战
        const gridX = Math.floor(Math.random() * 6);
        const gridY = Math.floor(Math.random() * 6);
        const offsetX = (Math.random() - 0.5) * 40; // 40rpx的随机抖动
        const offsetY = (Math.random() - 0.5) * 40;

        cards.push({
            id: i,
            type: pool[i],
            x: startX + gridX * 90 + offsetX,
            y: startY + gridY * 80 + offsetY,
            layer: Math.floor(Math.random() * maxLayers),
            isCovered: false,
            state: 0
        });
    }

    return updateCoverState(cards);
}

/**
 * 更新所有卡牌的遮挡状态
 * @param {Array} cards 
 * @param {number} cardW 
 * @param {number} cardH 
 */
function updateCoverState(cards, cardW = 90, cardH = 110) {
    // 排序以确保计算结果稳定，但在生成时 layer 已经随机，不需要这里重排
    for (let i = 0; i < cards.length; i++) {
        const cardA = cards[i];
        if (cardA.state !== 0 && cardA.state !== 4) {
            cardA.isCovered = false;
            continue;
        }

        let isCovered = false;
        for (let j = 0; j < cards.length; j++) {
            const cardB = cards[j];
            if (i === j || (cardB.state !== 0 && cardB.state !== 4)) continue;

            // 只要层级高于它，且物理区域重叠
            if (cardB.layer > cardA.layer) {
                const aX = cardA.x, aY = cardA.y;
                const bX = cardB.x, bY = cardB.y;

                if (aX < bX + cardW - 5 && aX + cardW - 5 > bX &&
                    aY < bY + cardH - 5 && aY + cardH - 5 > bY) {
                    isCovered = true;
                    break;
                }
            }
        }
        cardA.isCovered = isCovered;
    }
    return cards;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    generateLevel,
    updateCoverState
};
