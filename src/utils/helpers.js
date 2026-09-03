const moment = require('moment-timezone');

module.exports = {
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    randomFloat: (min, max) => Math.random() * (max - min) + min,
    
    formatCurrency: (amount) => {
        return `Ð${amount.toFixed(2)}`;
    },
    
    calculateTax: (netWorth) => {
        const slabs = require('../../config/config').TAX_SLABS;
        for (const slab of slabs) {
            if (netWorth >= slab.min && netWorth <= slab.max) {
                return netWorth * slab.rate;
            }
        }
        return 0;
    },
    
    getISTTime: () => {
        return moment().tz('Asia/Kolkata');
    },
    
    isMidnightIST: () => {
        const now = moment().tz('Asia/Kolkata');
        return now.hour() === 0 && now.minute() === 0;
    },
    
    getStockSymbols: (tier) => {
        const constants = require('./constants');
        return constants.STOCK_NAMES[tier];
    },
    
    generateStockName: (tier, index) => {
        const symbols = module.exports.getStockSymbols(tier);
        return symbols[index % symbols.length];
    },
    
    colorizePercentage: (percent) => {
        if (percent > 0) return `🟢 +${percent.toFixed(2)}%`;
        if (percent < 0) return `🔴 ${percent.toFixed(2)}%`;
        return `⚪ ${percent.toFixed(2)}%`;
    },
    
    getRandomUser: async (collection, excludeId) => {
        const users = await collection.find({ userId: { $ne: excludeId } }).limit(10);
        if (users.length === 0) return null;
        return users[Math.floor(Math.random() * users.length)];
    },
    
    safeParseInt: (value) => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
    }
};