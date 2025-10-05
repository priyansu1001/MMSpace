const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.log('JWT verification failed:', jwtError.message);
            return res.status(401).json({ message: 'Token is not valid' });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('User not found for token:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            console.log('User account is inactive:', user.email);
            return res.status(401).json({ message: 'Account is inactive' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;