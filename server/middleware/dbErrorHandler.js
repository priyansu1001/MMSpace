/**
 * Database error handling middleware
 */

const dbErrorHandler = (error, req, res, next) => {
    console.error('Database Error:', error);

    // Handle specific MongoDB errors
    if (error.name === 'MongoNetworkError') {
        return res.status(503).json({
            message: 'Database connection error. Please try again.',
            error: 'SERVICE_UNAVAILABLE'
        });
    }

    if (error.name === 'MongoTimeoutError') {
        return res.status(504).json({
            message: 'Database operation timed out. Please try again.',
            error: 'TIMEOUT'
        });
    }

    if (error.name === 'MongoServerSelectionError') {
        return res.status(503).json({
            message: 'Database server unavailable. Please try again later.',
            error: 'SERVER_UNAVAILABLE'
        });
    }

    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            message: 'Validation error',
            errors
        });
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            message: `${field} already exists`,
            error: 'DUPLICATE_KEY'
        });
    }

    // Default error response
    next(error);
};

module.exports = dbErrorHandler;