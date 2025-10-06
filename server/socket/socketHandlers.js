const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log('Socket connection rejected: No token provided');
            return next(new Error('No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            console.log('Socket connection rejected: User not found for token');
            return next(new Error('User not found'));
        }

        if (!user.isActive) {
            console.log('Socket connection rejected: User account inactive');
            return next(new Error('Account inactive'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userEmail = user.email;
        
        console.log(`Socket authentication successful for user: ${user.email}`);
        next();
    } catch (err) {
        console.log('Socket authentication error:', err.message);
        next(new Error('Authentication failed'));
    }
};

module.exports = (io) => {
    // Authentication middleware
    io.use(socketAuth);
    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);

        // Join user to their personal room for notifications
        socket.join(socket.userId);

        // Join group rooms
        socket.on('joinGroup', (groupId) => {
            socket.join(groupId);
            console.log(`User ${socket.userId} joined group ${groupId}`);
        });

        // Leave group rooms
        socket.on('leaveGroup', (groupId) => {
            socket.leave(groupId);
            console.log(`User ${socket.userId} left group ${groupId}`);
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            socket.to(data.conversationId).emit('userTyping', {
                userId: socket.userId,
                isTyping: data.isTyping
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });
};