const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help and documentation'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📚 DSME Help & Documentation')
            .setDescription('Welcome to DSME (Discord Stock Market Economy)!')
            .addFields(
                { name: '📖 Documentation', value: '[Click here for full documentation](https://github.com/saga296/dsme-v1)', inline: false },
                { name: '💼 Economy Commands', value: '`/buy`, `/sell`, `/portfolio`, `/work`, `/crime`, `/rob`, `/deposit`, `/withdraw`', inline: false },
                { name: '📊 Market Commands', value: '`/dsme30`, `/speculate`', inline: false },
                { name: '🏆 Utility Commands', value: '`/leaderboard`, `/help`, `/donate`', inline: false },
                { name: '🔒 Admin Commands', value: '`/reset` (Admin only)', inline: false }
            )
            .setFooter({ text: 'DSME • Version 1.0.0' });

        await interaction.reply({ embeds: [embed] });
    }
};