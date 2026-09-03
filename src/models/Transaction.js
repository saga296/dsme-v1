const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    
    type: { type: String, enum: ['BUY', 'SELL', 'WORK', 'CRIME', 'ROB', 'DEPOSIT', 'WITHDRAW', 'DIVIDEND', 'INTEREST', 'TAX'], required: true },
    
    symbol: { type: String, default: null },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    
    createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ guildId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);