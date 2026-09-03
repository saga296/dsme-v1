const logger = require('../utils/logger');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error(`Error executing ${interaction.commandName}:`, error);
            
            const errorMessage = '❌ There was an error executing this command.';
            if (interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else if (interaction.replied) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};