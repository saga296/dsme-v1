const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Stock = require('../../models/Stock');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('speculate')
        .setDescription('View stock performance')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('Stock symbol (e.g., DOGE, AAPL)')
                .setRequired(true)
                .setMaxLength(10)),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const symbol = interaction.options.getString('symbol').toUpperCase();
            const guildId = interaction.guildId;

            const stock = await Stock.findOne({ guildId, symbol, isActive: true });
            if (!stock) {
                return interaction.editReply(`❌ Stock ${symbol} not found or has been delisted.`);
            }

            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle(`📈 ${symbol} Stock Analysis`)
                .addFields(
                    { name: 'Current Price', value: helpers.formatCurrency(stock.price), inline: true },
                    { name: 'Base Price', value: helpers.formatCurrency(stock.basePrice), inline: true },
                    { name: 'Tier', value: stock.tier, inline: true },
                    { name: 'Daily Change', value: helpers.colorizePercentage(stock.dailyChangePercent), inline: true },
                    { name: 'Total Shares Traded', value: `${Math.floor(stock.totalShares)}`, inline: true },
                    { name: 'Net Shares Bought', value: `${Math.floor(stock.netSharesBought)}`, inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in speculate command:', error);
            await interaction.editReply('❌ An error occurred while fetching stock data.');
        }
    }
};