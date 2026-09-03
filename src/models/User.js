const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    username: { type: String, required: true },
    
    // Wallet and Bank
    cash: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    
    // Stocks owned { symbol: shares }
    stocks: { type: Map, of: Number, default: {} },
    
    // Cooldowns
    lastWork: { type: Date, default: null },
    lastCrime: { type: Date, default: null },
    lastRob: { type: Date, default: null },
    
    // Stats
    totalEarned: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ guildId: 1, userId: 1 });

userSchema.methods.getNetWorth = async function(Stock) {
    let stockValue = 0;
    const stockEntries = Array.from(this.stocks.entries());
    
    for (const [symbol, shares] of stockEntries) {
        const stock = await Stock.findOne({ symbol, guildId: this.guildId });
        if (stock) {
            stockValue += stock.price * shares;
        }
    }
    
    return this.cash + this.bank + stockValue;
};

userSchema.methods.getTotalStocks = function() {
    let total = 0;
    for (const shares of this.stocks.values()) {
        total += shares;
    }
    return total;
};

module.exports = mongoose.model('User', userSchema);