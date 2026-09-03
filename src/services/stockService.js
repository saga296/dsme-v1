const Stock = require('../models/Stock');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const config = require('../../config/config');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

class StockService {
    constructor(guildId) {
        this.guildId = guildId;
    }

    async initializeStocks() {
        try {
            const existingStocks = await Stock.find({ guildId: this.guildId });
            if (existingStocks.length > 0) {
                logger.info(`Stocks already exist for guild ${this.guildId}`);
                return;
            }

            const stocks = [];
            const tiers = config.STOCK_TIERS;

            // Meme Stocks
            const memeSymbols = constants.STOCK_NAMES.MEME;
            for (let i = 0; i < Math.min(tiers.MEME.count, memeSymbols.length); i++) {
                const basePrice = helpers.randomInt(tiers.MEME.basePriceMin, tiers.MEME.basePriceMax);
                const symbol = memeSymbols[i];
                stocks.push({
                    guildId: this.guildId,
                    symbol,
                    name: symbol,
                    tier: 'MEME',
                    basePrice,
                    price: basePrice,
                    liquidityFactor: tiers.MEME.liquidityFactor,
                    netSharesBought: 0,
                    totalShares: 0
                });
            }

            // Growth Stocks
            const growthSymbols = constants.STOCK_NAMES.GROWTH;
            for (let i = 0; i < Math.min(tiers.GROWTH.count, growthSymbols.length); i++) {
                const basePrice = helpers.randomInt(tiers.GROWTH.basePriceMin, tiers.GROWTH.basePriceMax);
                const symbol = growthSymbols[i];
                stocks.push({
                    guildId: this.guildId,
                    symbol,
                    name: symbol,
                    tier: 'GROWTH',
                    basePrice,
                    price: basePrice,
                    liquidityFactor: tiers.GROWTH.liquidityFactor,
                    netSharesBought: 0,
                    totalShares: 0
                });
            }

            // Blue Chip Stocks
            const blueChipSymbols = constants.STOCK_NAMES.BLUE_CHIP;
            for (let i = 0; i < Math.min(tiers.BLUE_CHIP.count, blueChipSymbols.length); i++) {
                const basePrice = helpers.randomInt(tiers.BLUE_CHIP.basePriceMin, tiers.BLUE_CHIP.basePriceMax);
                const symbol = blueChipSymbols[i];
                stocks.push({
                    guildId: this.guildId,
                    symbol,
                    name: symbol,
                    tier: 'BLUE_CHIP',
                    basePrice,
                    price: basePrice,
                    liquidityFactor: tiers.BLUE_CHIP.liquidityFactor,
                    netSharesBought: 0,
                    totalShares: 0
                });
            }

            if (stocks.length > 0) {
                await Stock.insertMany(stocks);
                logger.info(`✅ Initialized ${stocks.length} stocks for guild ${this.guildId}`);
            } else {
                logger.warn(`No stocks were created for guild ${this.guildId}`);
            }
        } catch (error) {
            logger.error('Error initializing stocks:', error);
            throw error;
        }
    }

    async getStock(symbol) {
        return await Stock.findOne({ guildId: this.guildId, symbol, isActive: true });
    }

    async getAllStocks() {
        return await Stock.find({ guildId: this.guildId, isActive: true });
    }

    async getMarketIndex() {
        const stocks = await this.getAllStocks();
        if (stocks.length === 0) return 0;
        const totalPrice = stocks.reduce((sum, stock) => sum + stock.price, 0);
        return totalPrice / stocks.length;
    }
}

module.exports = StockService;