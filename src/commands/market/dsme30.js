const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stock = require('../../models/Stock');
const User = require('../../models/User');
const MarketLog = require('../../models/MarketLog');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dsme30')
        .setDescription('Show DSME 30 market index performance'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        
        try {
            const guildId = interaction.guildId;
            
            // Get current market data
            const stocks = await Stock.find({ guildId, isActive: true });
            
            if (!stocks || stocks.length === 0) {
                return interaction.editReply('❌ No active stocks found in the market.');
            }
            
            const totalPrice = stocks.reduce((sum, stock) => sum + stock.price, 0);
            const currentIndex = totalPrice / stocks.length;
            
            // Get previous day's data
            const istTime = helpers.getISTTime();
            const today = istTime.startOf('day').toDate();
            const marketLog = await MarketLog.findOne({ guildId, date: today });
            
            const previousIndex = marketLog ? marketLog.indexPrice : null;
            const change = previousIndex ? currentIndex - previousIndex : 0;
            const changePercent = previousIndex ? (change / previousIndex) * 100 : 0;
            
            // Get active players count
            const activePlayers = await User.countDocuments({ guildId });
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 DSME 30 Market Index')
                .setDescription(`Current Market Index: **${helpers.formatCurrency(currentIndex)}**`)
                .addFields(
                    { name: 'Daily Change', value: `${change >= 0 ? '🟢' : '🔴'} ${helpers.formatCurrency(change)} (${changePercent.toFixed(2)}%)`, inline: true },
                    { name: 'Total Stocks', value: `${stocks.length} active`, inline: true },
                    { name: 'Active Players', value: `${activePlayers}`, inline: true }
                );

            // Add top performers
            const sortedStocks = [...stocks].sort((a, b) => (b.dailyChangePercent || 0) - (a.dailyChangePercent || 0));
            const top5 = sortedStocks.slice(0, 5);
            const bottom5 = sortedStocks.slice(-5).reverse();
            
            let topPerformers = '';
            for (const stock of top5) {
                const changePct = stock.dailyChangePercent || 0;
                topPerformers += `🟢 **${stock.symbol}**: +${changePct.toFixed(2)}%\n`;
            }
            
            let bottomPerformers = '';
            for (const stock of bottom5) {
                const changePct = stock.dailyChangePercent || 0;
                bottomPerformers += `🔴 **${stock.symbol}**: ${changePct.toFixed(2)}%\n`;
            }
            
            if (topPerformers) embed.addFields({ name: '🏆 Top Performers', value: topPerformers || 'No data', inline: true });
            if (bottomPerformers) embed.addFields({ name: '📉 Bottom Performers', value: bottomPerformers || 'No data', inline: true });
            
            embed.setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in dsme30 command:', error);
            await interaction.editReply(`❌ An error occurred while fetching market data: ${error.message}`);
        }
    }
};