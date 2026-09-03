const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stock = require('../../models/Stock');
const User = require('../../models/User');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('View your investment portfolio'),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guildId;

            const user = await User.findOne({ userId, guildId });
            if (!user) {
                return interaction.editReply('❌ You need to register first.');
            }

            const totalNetWorth = await user.getNetWorth(Stock);
            const totalStocks = user.getTotalStocks();

            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle(`📊 Portfolio of ${interaction.user.username}`)
                .addFields(
                    { name: '💰 Cash', value: helpers.formatCurrency(user.cash), inline: true },
                    { name: '🏦 Bank', value: helpers.formatCurrency(user.bank), inline: true },
                    { name: '📈 Total Net Worth', value: helpers.formatCurrency(totalNetWorth), inline: true },
                    { name: '📊 Total Shares Owned', value: `${totalStocks} shares`, inline: true },
                    { name: '📈 Total Trades', value: `${user.totalTrades}`, inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            // Add stock holdings
            const stockEntries = Array.from(user.stocks.entries());
            if (stockEntries.length > 0) {
                let stocksField = '';
                for (const [symbol, shares] of stockEntries) {
                    const stock = await Stock.findOne({ guildId, symbol, isActive: true });
                    if (stock) {
                        const value = stock.price * shares;
                        stocksField += `**${symbol}**: ${shares} shares (${helpers.formatCurrency(value)})\n`;
                    }
                }
                embed.addFields({ name: '📈 Stock Holdings', value: stocksField || 'No active stocks', inline: false });
            } else {
                embed.addFields({ name: '📈 Stock Holdings', value: 'No stocks owned', inline: false });
            }

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in portfolio command:', error);
            await interaction.editReply('❌ An error occurred while fetching your portfolio.');
        }
    }
};