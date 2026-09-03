require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    mongoURI: process.env.MONGODB_URI,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    announcementsChannelId: process.env.ANNOUNCEMENTS_CHANNEL_ID,
    adminRoleId: process.env.ADMIN_ROLE_ID,

    // Economy Constants
    WORK_MIN: 10,
    WORK_MAX: 50,
    WORK_COOLDOWN: 3600000, // 1 hour in ms
    
    CRIME_MIN: 120,
    CRIME_MAX: 180,
    CRIME_FAILURE_RATE: 0.6,
    CRIME_COOLDOWN: 7200000, // 2 hours in ms
    CRIME_BRIBE_AMOUNT: 100,
    
    ROB_FAILURE_RATE: 0.8,
    ROB_COOLDOWN: 10800000, // 3 hours in ms
    ROB_STEAL_PERCENTAGE: 0.3,
    ROB_BAIL_PERCENTAGE: 0.1,
    ROB_FLAT_BAIL: 500,
    
    TRADING_FEE: 0.02, // 2%
    
    INTEREST_RATE: 0.001, // 0.1%
    
    // Stock Tiers
    STOCK_TIERS: {
        MEME: {
            basePriceMin: 100,
            basePriceMax: 500,
            liquidityFactor: 2500,
            dividendRate: 0.02,
            count: 15
        },
        GROWTH: {
            basePriceMin: 501,
            basePriceMax: 2500,
            liquidityFactor: 25000,
            dividendRate: 0.01,
            count: 10
        },
        BLUE_CHIP: {
            basePriceMin: 2501,
            basePriceMax: 5000,
            liquidityFactor: 100000,
            dividendRate: 0.005,
            count: 5
        }
    },
    
    // Tax Slabs
    TAX_SLABS: [
        { min: 0, max: 10000, rate: 0 },
        { min: 10001, max: 50000, rate: 0.05 },
        { min: 50001, max: 100000, rate: 0.12 },
        { min: 100001, max: 500000, rate: 0.18 },
        { min: 500001, max: Infinity, rate: 0.28 }
    ],
    
    MARKET_NOISE_INTERVAL: 60000, // 1 minute
    DAILY_RESET_HOUR: 0, // 12 AM IST (midnight)
    DAILY_RESET_MINUTE: 0,
    TIMEZONE: 'Asia/Kolkata'
};