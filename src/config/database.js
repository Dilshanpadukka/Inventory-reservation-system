const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('MongoDB Connected...');
    } catch (err) {
        logger.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;