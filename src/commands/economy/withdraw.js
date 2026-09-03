const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw cash from your bank account')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount to withdraw')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const amount = interaction.options.getInteger('amount');
            const userId = interaction.user.id;
            const guildId = interaction.guildId;

            const user = await User.findOne({ userId, guildId });
            if (!user) {
                return interaction.editReply('❌ You need to register first.');
            }

            if (user.bank < amount) {
                return interaction.editReply(`❌ You only have ${helpers.formatCurrency(user.bank)} in your bank.`);
            }

            user.bank -= amount;
            user.cash += amount;
            await user.save();

            await Transaction.create({
                guildId,
                userId,
                username: interaction.user.username,
                type: 'WITHDRAW',
                amount,
                details: { from: 'bank', to: 'cash' }
            });

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🏦 Withdrawal Successful')
                .setDescription(`You withdrew **${helpers.formatCurrency(amount)}** from your bank account.`)
                .addFields(
                    { name: 'New Cash Balance', value: helpers.formatCurrency(user.cash), inline: true },
                    { name: 'New Bank Balance', value: helpers.formatCurrency(user.bank), inline: true }
                )
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in withdraw command:', error);
            await interaction.editReply('❌ An error occurred while withdrawing.');
        }
    }
};