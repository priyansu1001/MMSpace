const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');

        // Simplified connection options to avoid parsing errors
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 20, // Increased pool size
            minPoolSize: 5, // Minimum connections to maintain
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 60000, // Increased socket timeout
            connectTimeoutMS: 10000, // Connection timeout
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            retryWrites: true, // Enable retryable writes
            retryReads: true, // Enable retryable reads
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);

        // Enhanced connection event handling
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

        mongoose.connection.on('connecting', () => {
            console.log('MongoDB connecting...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        });

        return conn;

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = connectDB;