const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ message: 'Token has been invalidated' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired' });
            }
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Add retry logic for database queries
        let user;
        let retries = 3;

        while (retries > 0) {
            try {
                user = await User.findById(decoded.id).lean(); // Use lean() for better performance
                break;
            } catch (dbError) {
                retries--;
                if (retries === 0) {
                    console.error('Database error in auth middleware:', dbError);
                    return res.status(500).json({ message: 'Database connection error' });
                }
                // Wait 100ms before retry
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        if (!user) {
            console.log('User not found for token:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            console.log('User account is inactive:', user.email);
            return res.status(401).json({ message: 'Account is inactive' });
        }

        // Store token for potential blacklisting
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication service error' });
    }
};

// Function to blacklist a token
const blacklistToken = (token) => {
    tokenBlacklist.add(token);

    // Clean up expired tokens periodically (every hour)
    if (tokenBlacklist.size > 1000) {
        // In production, implement proper cleanup based on token expiry
        console.log('Token blacklist size:', tokenBlacklist.size);
    }
};

module.exports = { auth, blacklistToken };