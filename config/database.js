const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

module.exports = {
    connect: async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI)
            logger.info('MongoDB connected successfully');
        } catch (error) {
            logger.error('MongoDB connection error:', error);
            process.exit(1);
        }
    }
};
