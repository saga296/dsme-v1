const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Stock = require('../../models/Stock');
const Transaction = require('../../models/Transaction');
const MarketLog = require('../../models/MarketLog');
const logger = require('../../utils/logger');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('⚠️ Reset the entire economy (Admin only)'),

    async execute(interaction) {
        // Check if user has admin role
        if (!interaction.member.roles.cache.has(config.adminRoleId)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply();
        
        try {
            const guildId = interaction.guildId;

            // Delete all collections for this guild
            await User.deleteMany({ guildId });
            await Stock.deleteMany({ guildId });
            await Transaction.deleteMany({ guildId });
            await MarketLog.deleteMany({ guildId });

            // Reinitialize stocks
            const StockService = require('../../services/stockService');
            const stockService = new StockService(guildId);
            await stockService.initializeStocks();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Economy Reset')
                .setDescription('The entire economy has been reset by an admin.')
                .addFields(
                    { name: 'Reset by', value: interaction.user.username, inline: true },
                    { name: 'Time', value: new Date().toLocaleString(), inline: true }
                )
                .setFooter({ text: 'DSME • Admin Action' });

            await interaction.editReply({ embeds: [embed] });
            
            // Also send to announcements channel
            const announcementsChannel = interaction.guild.channels.cache.get(config.announcementsChannelId);
            if (announcementsChannel) {
                await announcementsChannel.send({ embeds: [embed] });
            }
            
            logger.info(`Economy reset by admin ${interaction.user.username} in guild ${guildId}`);
            
        } catch (error) {
            logger.error('Error in reset command:', error);
            await interaction.editReply('❌ An error occurred while resetting the economy.');
        }
    }
};