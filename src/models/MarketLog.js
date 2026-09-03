const mongoose = require('mongoose');

const marketLogSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    date: { type: Date, required: true },
    
    stocks: { type: Map, of: {
        price: Number,
        dailyChange: Number,
        dailyChangePercent: Number
    }, default: {} },
    
    indexPrice: { type: Number, required: true },
    indexChange: { type: Number, default: 0 },
    indexChangePercent: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

marketLogSchema.index({ guildId: 1, date: -1 });

module.exports = mongoose.model('MarketLog', marketLogSchema);