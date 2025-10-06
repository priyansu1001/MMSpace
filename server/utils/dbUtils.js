/**
 * Database utility functions with retry logic and error handling
 */

/**
 * Execute a database operation with retry logic
 * @param {Function} operation - The database operation to execute
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 200)
 * @returns {Promise} - Result of the operation
 */
const executeWithRetry = async (operation, maxRetries = 3, delay = 200) => {
    let retries = maxRetries;

    while (retries > 0) {
        try {
            return await operation();
        } catch (error) {
            retries--;

            // Check if it's a connection error that might be retryable
            const isRetryableError =
                error.name === 'MongoNetworkError' ||
                error.name === 'MongoTimeoutError' ||
                error.name === 'MongoServerSelectionError' ||
                error.message.includes('connection') ||
                error.message.includes('timeout');

            if (retries === 0 || !isRetryableError) {
                throw error;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));

            // Increase delay for next retry (exponential backoff)
            delay *= 1.5;
        }
    }
};

/**
 * Execute multiple database operations in parallel with retry logic
 * @param {Array} operations - Array of database operations
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} - Array of results
 */
const executeMultipleWithRetry = async (operations, maxRetries = 3) => {
    const promises = operations.map(operation =>
        executeWithRetry(operation, maxRetries)
    );

    return Promise.all(promises);
};

/**
 * Safe find operation with lean() for better performance
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Additional options
 * @returns {Promise} - Query result
 */
const safeFindOne = async (model, query, options = {}) => {
    return executeWithRetry(async () => {
        let queryBuilder = model.findOne(query);

        if (options.populate) {
            queryBuilder = queryBuilder.populate(options.populate);
        }

        if (options.select) {
            queryBuilder = queryBuilder.select(options.select);
        }

        return queryBuilder.lean();
    });
};

/**
 * Safe find operation with lean() for better performance
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Additional options
 * @returns {Promise} - Query result
 */
const safeFind = async (model, query, options = {}) => {
    return executeWithRetry(async () => {
        let queryBuilder = model.find(query);

        if (options.populate) {
            queryBuilder = queryBuilder.populate(options.populate);
        }

        if (options.select) {
            queryBuilder = queryBuilder.select(options.select);
        }

        if (options.sort) {
            queryBuilder = queryBuilder.sort(options.sort);
        }

        if (options.limit) {
            queryBuilder = queryBuilder.limit(options.limit);
        }

        if (options.skip) {
            queryBuilder = queryBuilder.skip(options.skip);
        }

        return queryBuilder.lean();
    });
};

/**
 * Safe count operation
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query object
 * @returns {Promise} - Count result
 */
const safeCount = async (model, query) => {
    return executeWithRetry(async () => {
        return model.countDocuments(query);
    });
};

/**
 * Safe save operation
 * @param {Document} document - Mongoose document
 * @returns {Promise} - Saved document
 */
const safeSave = async (document) => {
    return executeWithRetry(async () => {
        return document.save();
    });
};

/**
 * Safe update operation
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} update - Update object
 * @param {Object} options - Update options
 * @returns {Promise} - Update result
 */
const safeUpdate = async (model, query, update, options = {}) => {
    return executeWithRetry(async () => {
        return model.findOneAndUpdate(query, update, {
            new: true,
            ...options
        });
    });
};

module.exports = {
    executeWithRetry,
    executeMultipleWithRetry,
    safeFindOne,
    safeFind,
    safeCount,
    safeSave,
    safeUpdate
};