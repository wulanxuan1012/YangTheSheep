// 微信小游戏入口文件
const Game = require('./js/core/Game.js');

// 获取Canvas
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 获取屏幕信息
const systemInfo = wx.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;
const screenHeight = systemInfo.screenHeight;
const dpr = systemInfo.pixelRatio;

// 设置Canvas尺寸
canvas.width = screenWidth * dpr;
canvas.height = screenHeight * dpr;
ctx.scale(dpr, dpr);

// 创建游戏实例
const game = new Game(canvas, ctx, screenWidth, screenHeight);

// 启动游戏
game.start();
