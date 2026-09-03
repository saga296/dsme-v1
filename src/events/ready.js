const { REST, Routes } = require('discord.js');
const StockService = require('../services/stockService');
const MarketService = require('../services/marketService');
const TaxService = require('../services/taxService');
const DividendService = require('../services/dividendService');
const InterestService = require('../services/interestService');
const config = require('../../config/config');
const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.info(`🤖 ${client.user.tag} is online!`);
        
        // Register slash commands
        const commands = [];
        const commandFolders = ['economy', 'market', 'admin', 'utility'];
        
        for (const folder of commandFolders) {
            const commandFiles = require('fs').readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                commands.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '10' }).setToken(config.token);
        
        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: commands }
            );
            logger.info('✅ Slash commands registered!');
        } catch (error) {
            logger.error('Error registering slash commands:', error);
        }

        // Initialize stocks for the guild
        const stockService = new StockService(config.guildId);
        await stockService.initializeStocks();

        // Start background tasks
        const marketService = new MarketService(config.guildId);
        const taxService = new TaxService(config.guildId);
        const dividendService = new DividendService(config.guildId);
        const interestService = new InterestService(config.guildId);

        // Market noise every minute
        setInterval(async () => {
            try {
                await marketService.applyMarketNoise();
                await marketService.checkBankruptcy();
            } catch (error) {
                logger.error('Error in market noise job:', error);
            }
        }, config.MARKET_NOISE_INTERVAL);

        // Daily tasks at midnight IST
        const checkDailyTasks = async () => {
            try {
                const now = new Date();
                const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                
                if (istNow.getHours() === 0 && istNow.getMinutes() === 0 && istNow.getSeconds() === 0) {
                    logger.info('Running daily tasks...');
                    
                    // Record market snapshot
                    await marketService.recordDailyMarketSnapshot();
                    await marketService.resetDailyOpenPrices();
                    
                    // Pay dividends
                    const dividends = await dividendService.payDividends();
                    
                    // Pay interest
                    const interest = await interestService.payInterest();
                    
                    // Collect taxes
                    const taxes = await taxService.collectTaxes();
                    
                    // Send announcements
                    const announcementsChannel = client.channels.cache.get(config.announcementsChannelId);
                    if (announcementsChannel) {
                        let announcement = '📊 **Daily Market Update**\n';
                        if (dividends.length > 0) {
                            const totalDividends = dividends.reduce((sum, d) => sum + d.amount, 0);
                            announcement += `\n💎 Dividends Paid: ${totalDividends.toFixed(2)} Ð`;
                        }
                        if (interest.length > 0) {
                            const totalInterest = interest.reduce((sum, i) => sum + i.amount, 0);
                            announcement += `\n🏦 Interest Paid: ${totalInterest.toFixed(2)} Ð`;
                        }
                        if (taxes.length > 0) {
                            const totalTax = taxes.reduce((sum, t) => sum + t.amount, 0);
                            announcement += `\n📊 Taxes Collected: ${totalTax.toFixed(2)} Ð`;
                        }
                        await announcementsChannel.send(announcement);
                    }
                    
                    logger.info('Daily tasks completed');
                }
            } catch (error) {
                logger.error('Error in daily tasks:', error);
            }
        };

        // Check every 10 seconds for midnight
        setInterval(checkDailyTasks, 10000);
        checkDailyTasks(); // Initial check
    }
};