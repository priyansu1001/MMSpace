const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            console.log('Auth failed: No Authorization header');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Auth failed: Invalid Authorization header format');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token || token.trim().length === 0) {
            console.log('Auth failed: Empty token');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            console.log('Token (first 20 chars):', token.substring(0, 20));
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Invalid token',
                    code: 'INVALID_TOKEN'
                });
            } else {
                return res.status(401).json({ 
                    message: 'Token verification failed',
                    code: 'TOKEN_VERIFICATION_FAILED'
                });
            }
        }

        if (!decoded.id) {
            console.log('Auth failed: Token missing user ID');
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        console.log(`Auth check for user ID: ${decoded.id}`);
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('User not found for token:', decoded.id);
            return res.status(401).json({ 
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            console.log('User account is inactive:', user.email);
            return res.status(401).json({ 
                message: 'Account is inactive',
                code: 'ACCOUNT_INACTIVE'
            });
        }

        // Add user info to request
        req.user = user;
        req.token = token;
        
        console.log(`Auth successful for user: ${user.email} (${user.role})`);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        console.error('Error stack:', error.stack);
        res.status(401).json({ 
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = auth;