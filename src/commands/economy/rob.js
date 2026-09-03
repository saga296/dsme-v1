const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Try to rob another player (cooldown: 3 hours)'),

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
            if (user.lastRob) {
                const timeSince = Date.now() - user.lastRob.getTime();
                if (timeSince < config.ROB_COOLDOWN) {
                    const remaining = Math.ceil((config.ROB_COOLDOWN - timeSince) / 3600000);
                    return interaction.editReply(`⏰ You need to wait ${remaining} hours before trying to rob again.`);
                }
            }

            // Find a random target with money
            const target = await helpers.getRandomUser(User, userId);
            if (!target || target.cash < 10) {
                return interaction.editReply('❌ No eligible targets found with enough cash.');
            }

            const success = Math.random() > config.ROB_FAILURE_RATE;
            let resultMessage = '';

            if (success) {
                const stealAmount = target.cash * config.ROB_STEAL_PERCENTAGE;
                target.cash -= stealAmount;
                user.cash += stealAmount;
                user.totalEarned += stealAmount;
                await target.save();
                await user.save();
                
                resultMessage = `✅ Robbery successful! You stole **${helpers.formatCurrency(stealAmount)}** from ${target.username}!`;
            } else {
                const loss = Math.max(user.cash * config.ROB_BAIL_PERCENTAGE, config.ROB_FLAT_BAIL);
                user.cash = Math.max(0, user.cash - loss);
                await user.save();
                resultMessage = `❌ Robbery failed! You had to pay **${helpers.formatCurrency(loss)}** for bail.`;
            }

            user.lastRob = new Date();
            await user.save();

            await Transaction.create({
                guildId,
                userId,
                username: interaction.user.username,
                type: 'ROB',
                amount: success ? user.cash : 0,
                status: success ? 'SUCCESS' : 'FAILED',
                details: { 
                    success, 
                    target: target.username,
                    amount: success ? target.cash * config.ROB_STEAL_PERCENTAGE : 0
                }
            });

            const embed = new EmbedBuilder()
                .setColor(success ? '#00ff00' : '#ff0000')
                .setTitle('🥷 Robbery Attempt')
                .setDescription(resultMessage)
                .addFields(
                    { name: 'New Cash Balance', value: helpers.formatCurrency(user.cash), inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in rob command:', error);
            await interaction.editReply('❌ An error occurred during your robbery attempt.');
        }
    }
};