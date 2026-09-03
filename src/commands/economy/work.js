const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn some money (cooldown: 1 hour)'),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guildId;

            let user = await User.findOne({ userId, guildId });
            if (!user) {
                user = new User({
                    userId,
                    guildId,
                    username: interaction.user.username
                });
                await user.save();
            }

            // Check cooldown
            if (user.lastWork) {
                const timeSince = Date.now() - user.lastWork.getTime();
                if (timeSince < config.WORK_COOLDOWN) {
                    const remaining = Math.ceil((config.WORK_COOLDOWN - timeSince) / 60000);
                    return interaction.editReply(`⏰ You need to wait ${remaining} minutes before working again.`);
                }
            }

            const earnings = helpers.randomInt(config.WORK_MIN, config.WORK_MAX);
            user.cash += earnings;
            user.totalEarned += earnings;
            user.lastWork = new Date();
            await user.save();

            await Transaction.create({
                guildId,
                userId,
                username: interaction.user.username,
                type: 'WORK',
                amount: earnings,
                details: { earned: earnings }
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💼 Work Completed!')
                .setDescription(`You worked hard and earned **${helpers.formatCurrency(earnings)}**!`)
                .addFields(
                    { name: 'New Cash Balance', value: helpers.formatCurrency(user.cash), inline: true },
                    { name: 'Total Earned', value: helpers.formatCurrency(user.totalEarned), inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in work command:', error);
            await interaction.editReply('❌ An error occurred while working.');
        }
    }
};