const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StockService = require('../../services/stockService');
const User = require('../../models/User');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell shares of a stock')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('Stock symbol (e.g., DOGE, AAPL)')
                .setRequired(true)
                .setMaxLength(10))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('Number of shares to sell')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        
        try {
            const symbol = interaction.options.getString('symbol').toUpperCase();
            const quantity = interaction.options.getInteger('quantity');
            const userId = interaction.user.id;
            const guildId = interaction.guildId;

            const stockService = new StockService(guildId);
            
            // Check if stock exists and is active
            const stock = await stockService.getStock(symbol);
            if (!stock) {
                return interaction.editReply('❌ Stock not found or has been delisted.');
            }

            // Get user
            const user = await User.findOne({ userId, guildId });
            if (!user) {
                return interaction.editReply('❌ You need to register first.');
            }

            // Check if user owns enough shares
            const currentShares = user.stocks.get(symbol) || 0;
            if (currentShares < quantity) {
                return interaction.editReply(`❌ You only own ${currentShares} shares of ${symbol}.`);
            }

            // Process trade
            try {
                const totalRevenue = stock.price * quantity;
                const fee = totalRevenue * 0.02;
                const totalAmount = totalRevenue - fee;

                // Update user
                user.cash += totalAmount;
                user.stocks.set(symbol, currentShares - quantity);
                if (user.stocks.get(symbol) === 0) user.stocks.delete(symbol);
                user.totalTrades += 1;
                await user.save();

                // Update stock
                stock.netSharesBought -= quantity;
                stock.totalShares -= quantity;
                stock.updatePrice();
                await stock.save();

                // Create transaction
                const Transaction = require('../../models/Transaction');
                await Transaction.create({
                    guildId,
                    userId,
                    username: interaction.user.username,
                    type: 'SELL',
                    symbol,
                    quantity,
                    price: stock.price,
                    amount: totalRevenue,
                    fee,
                    details: { totalAmount }
                });

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('✅ Stock Sale Successful')
                    .setDescription(`You sold **${quantity}** shares of **${symbol}**`)
                    .addFields(
                        { name: 'Price per share', value: helpers.formatCurrency(stock.price), inline: true },
                        { name: 'Total revenue', value: helpers.formatCurrency(totalRevenue), inline: true },
                        { name: 'Trading fee (2%)', value: helpers.formatCurrency(fee), inline: true },
                        { name: 'Total received', value: helpers.formatCurrency(totalAmount), inline: true },
                        { name: 'Remaining shares', value: `${user.stocks.get(symbol) || 0} shares`, inline: true },
                        { name: 'New cash balance', value: helpers.formatCurrency(user.cash), inline: true }
                    )
                    .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

                await interaction.editReply({ embeds: [embed] });
            } catch (tradeError) {
                logger.error('Trade processing error:', tradeError);
                return interaction.editReply('❌ Error processing trade. Please try again.');
            }
            
        } catch (error) {
            logger.error('Error in sell command:', error);
            await interaction.editReply(`❌ An error occurred while processing your sale: ${error.message}`);
        }
    }
};