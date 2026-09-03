const Stock = require('../models/Stock');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const config = require('../../config/config');

class DividendService {
    constructor(guildId) {
        this.guildId = guildId;
    }

    async payDividends() {
        try {
            const stocks = await Stock.find({ guildId: this.guildId, isActive: true });
            const dividendPayments = [];

            for (const stock of stocks) {
                const dividendRate = config.STOCK_TIERS[stock.tier].dividendRate;
                const dividendAmount = stock.price * dividendRate;
                
                // Find all users holding this stock
                const users = await User.find({ 
                    guildId: this.guildId,
                    [`stocks.${stock.symbol}`]: { $exists: true }
                });

                for (const user of users) {
                    const shares = user.stocks.get(stock.symbol) || 0;
                    if (shares > 0) {
                        const userDividend = dividendAmount * shares;
                        user.bank += userDividend;
                        await user.save();
                        
                        await Transaction.create({
                            guildId: this.guildId,
                            userId: user.userId,
                            username: user.username,
                            type: 'DIVIDEND',
                            symbol: stock.symbol,
                            quantity: shares,
                            amount: userDividend,
                            details: { dividendRate: dividendRate * 100 }
                        });
                        
                        dividendPayments.push({
                            userId: user.userId,
                            username: user.username,
                            symbol: stock.symbol,
                            shares,
                            amount: userDividend
                        });
                    }
                }
            }
            
            logger.info(`Paid dividends to ${dividendPayments.length} users`);
            return dividendPayments;
        } catch (error) {
            logger.error('Error paying dividends:', error);
            throw error;
        }
    }
}

module.exports = DividendService;