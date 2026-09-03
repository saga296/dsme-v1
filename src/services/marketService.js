const Stock = require('../models/Stock');
const MarketLog = require('../models/MarketLog');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../../config/config');

class MarketService {
    constructor(guildId) {
        this.guildId = guildId;
    }

    async applyMarketNoise() {
        try {
            const stocks = await Stock.find({ guildId: this.guildId, isActive: true });
            
            for (const stock of stocks) {
                const noise = helpers.randomFloat(-1.5, 1.5) / 100;
                const priceChange = stock.price * noise;
                stock.price = Math.max(0, stock.price + priceChange);
                stock.netSharesBought += priceChange * 10; // Simulate volume
                stock.updatePrice();
                await stock.save();
            }
            
            logger.info(`Market noise applied to ${stocks.length} stocks`);
        } catch (error) {
            logger.error('Error applying market noise:', error);
        }
    }

    async recordDailyMarketSnapshot() {
        try {
            const stocks = await Stock.find({ guildId: this.guildId, isActive: true });
            const istTime = helpers.getISTTime();
            const date = istTime.startOf('day').toDate();

            // Update daily open if not set
            for (const stock of stocks) {
                if (!stock.dailyOpen) {
                    stock.dailyOpen = stock.price;
                    await stock.save();
                }
                // Update daily change
                stock.dailyChange = stock.price - stock.dailyOpen;
                stock.dailyChangePercent = (stock.dailyChange / stock.dailyOpen) * 100;
                await stock.save();
            }

            // Calculate index
            const totalPrice = stocks.reduce((sum, stock) => sum + stock.price, 0);
            const indexPrice = totalPrice / stocks.length;
            
            const existingLog = await MarketLog.findOne({ guildId: this.guildId, date });
            
            const stockData = new Map();
            for (const stock of stocks) {
                stockData.set(stock.symbol, {
                    price: stock.price,
                    dailyChange: stock.dailyChange,
                    dailyChangePercent: stock.dailyChangePercent
                });
            }

            if (existingLog) {
                existingLog.stocks = stockData;
                existingLog.indexPrice = indexPrice;
                // Calculate index change from previous day
                if (existingLog.indexPrice) {
                    existingLog.indexChange = indexPrice - existingLog.indexPrice;
                    existingLog.indexChangePercent = (existingLog.indexChange / existingLog.indexPrice) * 100;
                }
                await existingLog.save();
            } else {
                await MarketLog.create({
                    guildId: this.guildId,
                    date,
                    stocks: stockData,
                    indexPrice,
                    indexChange: 0,
                    indexChangePercent: 0
                });
            }

            logger.info(`Daily market snapshot recorded for ${stocks.length} stocks`);
        } catch (error) {
            logger.error('Error recording market snapshot:', error);
        }
    }

    async resetDailyOpenPrices() {
        try {
            const stocks = await Stock.find({ guildId: this.guildId, isActive: true });
            for (const stock of stocks) {
                stock.dailyOpen = stock.price;
                stock.dailyChange = 0;
                stock.dailyChangePercent = 0;
                await stock.save();
            }
            logger.info('Daily open prices reset');
        } catch (error) {
            logger.error('Error resetting daily open prices:', error);
        }
    }

    async checkBankruptcy() {
        try {
            const stocks = await Stock.find({ guildId: this.guildId, isActive: true });
            const bankruptStocks = stocks.filter(stock => stock.price <= 0);
            
            for (const stock of bankruptStocks) {
                stock.isActive = false;
                stock.bankruptAt = new Date();
                await stock.save();
                logger.info(`Stock ${stock.symbol} declared bankrupt`);
            }
            
            return bankruptStocks;
        } catch (error) {
            logger.error('Error checking bankruptcy:', error);
            return [];
        }
    }
}

module.exports = MarketService;