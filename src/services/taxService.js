const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../../config/config');

class TaxService {
    constructor(guildId) {
        this.guildId = guildId;
    }

    async collectTaxes() {
        try {
            const users = await User.find({ guildId: this.guildId });
            const totalTaxCollected = [];
            
            for (const user of users) {
                const netWorth = await user.getNetWorth(Stock);
                const taxAmount = helpers.calculateTax(netWorth);
                
                if (taxAmount > 0) {
                    // Deduct tax from bank first, then cash
                    if (user.bank >= taxAmount) {
                        user.bank -= taxAmount;
                    } else {
                        const remainingTax = taxAmount - user.bank;
                        user.bank = 0;
                        user.cash = Math.max(0, user.cash - remainingTax);
                    }
                    
                    await user.save();
                    
                    await Transaction.create({
                        guildId: this.guildId,
                        userId: user.userId,
                        username: user.username,
                        type: 'TAX',
                        amount: taxAmount,
                        details: { netWorth, taxAmount }
                    });
                    
                    totalTaxCollected.push({
                        userId: user.userId,
                        username: user.username,
                        amount: taxAmount
                    });
                }
            }
            
            logger.info(`Collected taxes from ${totalTaxCollected.length} users`);
            return totalTaxCollected;
        } catch (error) {
            logger.error('Error collecting taxes:', error);
            throw error;
        }
    }
}

module.exports = TaxService;