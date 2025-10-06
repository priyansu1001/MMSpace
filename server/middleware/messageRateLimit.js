const rateLimit = require('express-rate-limit');

// Create a rate limiter specifically for messages
const messageRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // Limit each user to 10 messages per minute
    message: {
        message: 'Too many messages sent. Please slow down and try again in a minute.',
        code: 'MESSAGE_RATE_LIMIT_EXCEEDED',
        retryAfter: 60
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
    // Custom key generator to rate limit per user
    keyGenerator: (req) => {
        return req.user?.id || req.ip; // Use user ID if available, otherwise IP
    },
    
    // Custom handler for when rate limit is exceeded
    handler: (req, res) => {
        console.log(`Message rate limit exceeded for user: ${req.user?.email || req.ip}`);
        console.log(`User attempted to send message: "${req.body?.content?.substring(0, 50)}..."`);
        
        res.status(429).json({
            message: 'Too many messages sent. Please slow down and try again in a minute.',
            code: 'MESSAGE_RATE_LIMIT_EXCEEDED',
            retryAfter: 60,
            maxRequests: 10,
            windowMs: 60000
        });
    },
    
    // Skip rate limiting for certain conditions
    skip: (req) => {
        // Skip rate limiting in development for testing
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_MESSAGE_RATE_LIMIT === 'true') {
            return true;
        }
        
        // Skip for health checks or system messages
        if (req.path === '/health' || req.body?.isSystemMessage) {
            return true;
        }
        
        return false;
    }
});

// Burst protection - stricter limits for very rapid requests
const messageBurstLimit = rateLimit({
    windowMs: 10 * 1000, // 10 second window
    max: 3, // Maximum 3 messages per 10 seconds
    message: {
        message: 'Messages sent too quickly. Please wait a moment before sending another message.',
        code: 'MESSAGE_BURST_LIMIT_EXCEEDED',
        retryAfter: 10
    },
    
    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    },
    
    handler: (req, res) => {
        console.log(`Message burst limit exceeded for user: ${req.user?.email || req.ip}`);
        
        res.status(429).json({
            message: 'Messages sent too quickly. Please wait a moment before sending another message.',
            code: 'MESSAGE_BURST_LIMIT_EXCEEDED',
            retryAfter: 10,
            maxRequests: 3,
            windowMs: 10000
        });
    },
    
    skip: (req) => {
        return process.env.NODE_ENV === 'development' && process.env.SKIP_MESSAGE_RATE_LIMIT === 'true';
    }
});

// Spam detection middleware
const spamDetection = (req, res, next) => {
    const content = req.body?.content;
    
    if (!content || typeof content !== 'string') {
        return next();
    }
    
    // Check for spam patterns
    const spamPatterns = [
        /(.)\1{10,}/, // Repeated characters (11+ times)
        /^(.{1,10})\1{5,}$/, // Repeated short strings
        /[A-Z]{20,}/, // Excessive caps
        /(.{1,3})\1{10,}/, // Repeated short patterns
    ];
    
    const isSpam = spamPatterns.some(pattern => pattern.test(content));
    
    if (isSpam) {
        console.log(`Spam detected from user: ${req.user?.email || req.ip}`);
        console.log(`Spam content: "${content.substring(0, 100)}..."`);
        
        return res.status(400).json({
            message: 'Message appears to be spam. Please send meaningful messages.',
            code: 'SPAM_DETECTED'
        });
    }
    
    // Check message length
    if (content.length > 1000) {
        return res.status(400).json({
            message: 'Message is too long. Please keep messages under 1000 characters.',
            code: 'MESSAGE_TOO_LONG'
        });
    }
    
    // Check for empty or whitespace-only messages
    if (content.trim().length === 0) {
        return res.status(400).json({
            message: 'Message cannot be empty.',
            code: 'EMPTY_MESSAGE'
        });
    }
    
    next();
};

module.exports = {
    messageRateLimit,
    messageBurstLimit,
    spamDetection
};
