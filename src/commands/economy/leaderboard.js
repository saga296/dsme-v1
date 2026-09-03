const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Stock = require('../../models/Stock');
const helpers = require('../../utils/helpers');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top 10 richest players'),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const guildId = interaction.guildId;
            
            const users = await User.find({ guildId });
            const leaderboard = [];

            for (const user of users) {
                const netWorth = await user.getNetWorth(Stock);
                leaderboard.push({
                    userId: user.userId,
                    username: user.username,
                    netWorth,
                    cash: user.cash,
                    bank: user.bank,
                    stocks: user.getTotalStocks()
                });
            }

            leaderboard.sort((a, b) => b.netWorth - a.netWorth);
            const top10 = leaderboard.slice(0, 10);

            let leaderboardText = '';
            const medals = ['🥇', '🥈', '🥉'];
            
            for (let i = 0; i < top10.length; i++) {
                const user = top10[i];
                const medal = i < 3 ? medals[i] : `${i + 1}.`;
                leaderboardText += `${medal} **${user.username}** - ${helpers.formatCurrency(user.netWorth)}\n`;
                leaderboardText += `   💰 ${helpers.formatCurrency(user.cash)} | 🏦 ${helpers.formatCurrency(user.bank)} | 📈 ${user.stocks} shares\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('🏆 Top 10 Richest Players')
                .setDescription(leaderboardText || 'No players found.')
                .setFooter({ text: `DSME • ${new Date().toLocaleString()}` });

            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error in leaderboard command:', error);
            await interaction.editReply('❌ An error occurred while fetching the leaderboard.');
        }
    }
};