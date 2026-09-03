const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const StockService = require('../../services/stockService');
const User = require('../../models/User');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy shares of a stock')
        .addStringOption(option =>
            option.setName('symbol')
                .setDescription('Stock symbol (e.g., DOGE, AAPL)')
                .setRequired(true)
                .setMaxLength(10))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('Number of shares to buy')
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
            
            // Check if stock exists
            const stock = await stockService.getStock(symbol);
            if (!stock) {
                return interaction.editReply('❌ Stock not found or has been delisted.');
            }

            // Get user
            const user = await User.findOne({ userId, guildId });
            if (!user) {
                return interaction.editReply('❌ You need to register first. Use any economy command to register.');
            }

            // Check if user has enough cash
            const totalCost = stock.price * quantity;
            const fee = totalCost * 0.02; // 2% trading fee
            const totalAmount = totalCost + fee;

            if (user.cash < totalAmount) {
                return interaction.editReply(`❌ Insufficient funds. You need ${helpers.formatCurrency(totalAmount)} (${helpers.formatCurrency(totalCost)} + ${helpers.formatCurrency(fee)} fee).`);
            }

            // Process trade
            try {
                // Deduct money
                user.cash -= totalAmount;
                
                // Update user's stocks
                const currentShares = user.stocks.get(symbol) || 0;
                user.stocks.set(symbol, currentShares + quantity);
                user.totalTrades += 1;
                await user.save();

                // Update stock
                stock.netSharesBought += quantity;
                stock.totalShares += quantity;
                const newPrice = stock.updatePrice();
                await stock.save();

                // Create transaction
                const Transaction = require('../../models/Transaction');
                await Transaction.create({
                    guildId,
                    userId,
                    username: interaction.user.username,
                    type: 'BUY',
                    symbol,
                    quantity,
                    price: stock.price,
                    amount: totalCost,
                    fee,
                    details: { totalAmount }
                });

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Stock Purchase Successful')
                    .setDescription(`You bought **${quantity}** shares of **${symbol}**`)
                    .addFields(
                        { name: 'Price per share', value: helpers.formatCurrency(stock.price), inline: true },
                        { name: 'Total cost', value: helpers.formatCurrency(totalCost), inline: true },
                        { name: 'Trading fee (2%)', value: helpers.formatCurrency(fee), inline: true },
                        { name: 'Total paid', value: helpers.formatCurrency(totalAmount), inline: true },
                        { name: 'New share balance', value: `${user.stocks.get(symbol) || 0} shares`, inline: true },
                        { name: 'Remaining cash', value: helpers.formatCurrency(user.cash), inline: true }
                    )
                    .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

                await interaction.editReply({ embeds: [embed] });
            } catch (tradeError) {
                logger.error('Trade processing error:', tradeError);
                return interaction.editReply('❌ Error processing trade. Please try again.');
            }
            
        } catch (error) {
            logger.error('Error in buy command:', error);
            await interaction.editReply(`❌ An error occurred while processing your purchase: ${error.message}`);
        }
    }
};