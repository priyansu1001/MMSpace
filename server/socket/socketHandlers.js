const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error('Authentication error'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
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