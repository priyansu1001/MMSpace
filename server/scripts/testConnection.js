/**
 * Database connection test script
 * Run with: node scripts/testConnection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing database connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 20,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 10000,
            maxIdleTimeMS: 30000,
            bufferCommands: true,
            retryWrites: true,
            retryReads: true,
        });

        console.log('✅ Database connected successfully!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('Ready State:', conn.connection.readyState);

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections found:', collections.length);

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Connection closed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        console.error('Name:', error.name);

        if (error.reason) {
            console.error('Reason:', error.reason);
        }

        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Closing database connection...');
    try {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error closing connection:', error);
    }
    process.exit(0);
});

testConnection();