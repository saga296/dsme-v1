const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');
const config = require('../../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Try your luck at crime (cooldown: 2 hours)'),

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
            if (user.lastCrime) {
                const timeSince = Date.now() - user.lastCrime.getTime();
                if (timeSince < config.CRIME_COOLDOWN) {
                    const remaining = Math.ceil((config.CRIME_COOLDOWN - timeSince) / 3600000);
                    return interaction.editReply(`⏰ You need to wait ${remaining} hours before committing another crime.`);
                }
            }

            const success = Math.random() > config.CRIME_FAILURE_RATE;
            let resultMessage = '';
            let amount = 0;

            if (success) {
                amount = helpers.randomInt(config.CRIME_MIN, config.CRIME_MAX);
                user.cash += amount;
                user.totalEarned += amount;
                resultMessage = `✅ Success! You pulled off a crime and earned **${helpers.formatCurrency(amount)}**!`;
            } else {
                const loseMoney = Math.random() > 0.5;
                if (loseMoney) {
                    const loss = config.CRIME_BRIBE_AMOUNT;
                    user.cash = Math.max(0, user.cash - loss);
                    resultMessage = `❌ Failure! You had to bribe an officer with **${helpers.formatCurrency(loss)}** to escape.`;
                } else {
                    resultMessage = '❌ Failure! Your crime attempt was wasted, but at least you didn\'t lose any money.';
                }
            }

            user.lastCrime = new Date();
            await user.save();

            await Transaction.create({
                guildId,
                userId,
                username: interaction.user.username,
                type: 'CRIME',
                amount: success ? amount : 0,
                status: success ? 'SUCCESS' : 'FAILED',
                details: { success, amount: success ? amount : 0 }
            });

            const embed = new EmbedBuilder()
                .setColor(success ? '#00ff00' : '#ff0000')
                .setTitle('🔫 Crime Attempt')
                .setDescription(resultMessage)
                .addFields(
                    { name: 'New Cash Balance', value: helpers.formatCurrency(user.cash), inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in crime command:', error);
            await interaction.editReply('❌ An error occurred during your crime attempt.');
        }
    }
};