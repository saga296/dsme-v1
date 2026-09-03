const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const config = require('../../config/config');

class InterestService {
    constructor(guildId) {
        this.guildId = guildId;
    }

    async payInterest() {
        try {
            const users = await User.find({ guildId: this.guildId });
            const interestPayments = [];

            for (const user of users) {
                if (user.bank > 0) {
                    const interestAmount = user.bank * config.INTEREST_RATE;
                    user.bank += interestAmount;
                    await user.save();
                    
                    await Transaction.create({
                        guildId: this.guildId,
                        userId: user.userId,
                        username: user.username,
                        type: 'INTEREST',
                        amount: interestAmount,
                        details: { bankBalance: user.bank }
                    });
                    
                    interestPayments.push({
                        userId: user.userId,
                        username: user.username,
                        amount: interestAmount
                    });
                }
            }
            
            logger.info(`Paid interest to ${interestPayments.length} users`);
            return interestPayments;
        } catch (error) {
            logger.error('Error paying interest:', error);
            throw error;
        }
    }
}

module.exports = InterestService;