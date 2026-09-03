require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const database = require('../config/database');
const config = require('../config/config');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

// Initialize client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Command collection
client.commands = new Collection();

// Load commands
const loadCommands = () => {
    const commandFolders = ['economy', 'market', 'admin', 'utility'];
    
    for (const folder of commandFolders) {
        const commandPath = path.join(__dirname, 'commands', folder);
        if (!fs.existsSync(commandPath)) continue;
        
        const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandPath, file));
            if (command.data && command.data.name) {
                client.commands.set(command.data.name, command);
                logger.info(`Loaded command: ${command.data.name}`);
            }
        }
    }
};

// Load events
const loadEvents = () => {
    const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const event = require(path.join(__dirname, 'events', file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        logger.info(`Loaded event: ${event.name}`);
    }
};

// Connect to database and start bot
const start = async () => {
    try {
        // Connect to MongoDB
        await database.connect();
        
        // Load commands and events
        loadCommands();
        loadEvents();
        
        // Login to Discord
        await client.login(config.token);
        
        logger.info('🚀 DSME Bot started successfully!');
    } catch (error) {
        logger.error('Error starting bot:', error);
        process.exit(1);
    }
};

// Handle process errors
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
});

// Start the bot
start();