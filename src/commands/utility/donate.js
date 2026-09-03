const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Support the developer'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('☕ Support the Developer')
            .setDescription('If you enjoy using DSME, consider buying the developer a coffee!')
            .addFields(
                { name: 'Ko-Fi', value: '[Buy me a coffee](https://ko-fi.com/saga296)', inline: true }
            )
            .setFooter({ text: 'DSME • Thank you for your support!' });

        await interaction.reply({ embeds: [embed] });
    }
};