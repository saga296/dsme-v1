const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ['MEME', 'GROWTH', 'BLUE_CHIP'], required: true },
    
    basePrice: { type: Number, required: true },
    price: { type: Number, required: true },
    liquidityFactor: { type: Number, required: true },
    
    netSharesBought: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    
    dailyOpen: { type: Number, default: null },
    dailyChange: { type: Number, default: 0 },
    dailyChangePercent: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
    bankruptAt: { type: Date, default: null },
    
    dividendPool: { type: Number, default: 0 },
    lastDividendPaid: { type: Date, default: null },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

stockSchema.index({ guildId: 1, symbol: 1 });

stockSchema.methods.updatePrice = function() {
    this.price = this.basePrice * (1 + (this.netSharesBought / this.liquidityFactor));
    this.price = Math.max(0, this.price);
    return this.price;
};

stockSchema.methods.addDividend = function(amount) {
    this.dividendPool += amount;
    return this.dividendPool;
};

module.exports = mongoose.model('Stock', stockSchema);