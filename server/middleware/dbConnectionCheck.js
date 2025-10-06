const mongoose = require('mongoose');

/**
 * Middleware to check database connection before processing requests
 */
const dbConnectionCheck = (req, res, next) => {
    // Skip check for health endpoint
    if (req.path === '/api/health') {
        return next();
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database connection not available. Please try again later.',
            error: 'DATABASE_UNAVAILABLE'
        });
    }

    next();
};

module.exports = dbConnectionCheck;