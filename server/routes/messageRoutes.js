const express = require('express');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { conversationType, conversationId, content } = req.body;

        const message = new Message({
            conversationType,
            conversationId,
            senderId: req.user._id,
            senderRole: req.user.role,
            content,
            readBy: [{ userId: req.user._id }]
        });

        await message.save();

        // Populate sender information for real-time messaging
        await message.populate('senderId', 'email role');

        // Emit socket event for real-time messaging
        if (conversationType === 'group') {
            // For group messages, emit to all group members
            const group = await Group.findById(conversationId).populate('menteeIds', '_id');
            if (group) {
                // Emit to group room
                req.io.to(conversationId.toString()).emit('newMessage', message);

                // Also emit to each mentee's personal room for notifications
                group.menteeIds.forEach(mentee => {
                    req.io.to(mentee._id.toString()).emit('newMessage', message);
                });

                // Emit to mentor's personal room
                req.io.to(group.mentorId.toString()).emit('newMessage', message);
            }
        } else {
            // For individual chats, emit to both users' individual rooms
            req.io.to(conversationId.toString()).emit('newMessage', message);
            req.io.to(req.user._id.toString()).emit('newMessage', message);
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/messages/group/:groupId
// @desc    Get group messages
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({
            conversationType: 'group',
            conversationId: req.params.groupId
        })
            .populate('senderId', 'email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/messages/individual/:conversationId
// @desc    Get individual messages
// @access  Private
router.get('/individual/:conversationId', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({
            conversationType: 'individual',
            conversationId: req.params.conversationId
        })
            .populate('senderId', 'email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already marked as read
        const alreadyRead = message.readBy.some(
            read => read.userId.toString() === req.user._id.toString()
        );

        if (!alreadyRead) {
            message.readBy.push({ userId: req.user._id });
            await message.save();
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/messages/conversation/:type/:id
// @desc    Delete all messages in a conversation
// @access  Private
router.delete('/conversation/:type/:id', auth, async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!['group', 'individual'].includes(type)) {
            return res.status(400).json({ message: 'Invalid conversation type' });
        }

        let isAuthorized = false;

        if (type === 'group') {
            const group = await Group.findById(id).select('mentorId menteeIds');
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }

            if (req.user.role === 'mentor') {
                const mentorProfile = await Mentor.findOne({ userId: req.user._id }).select('_id');
                if (mentorProfile && group.mentorId?.toString() === mentorProfile._id.toString()) {
                    isAuthorized = true;
                }
            }

            if (!isAuthorized && req.user.role === 'mentee') {
                const menteeProfile = await Mentee.findOne({ userId: req.user._id }).select('_id');
                if (menteeProfile && group.menteeIds.some(menteeId => menteeId.toString() === menteeProfile._id.toString())) {
                    isAuthorized = true;
                }
            }
        } else {
            const mentee = await Mentee.findById(id).select('mentorId userId');
            if (!mentee) {
                return res.status(404).json({ message: 'Conversation not found' });
            }

            if (req.user.role === 'mentor') {
                const mentorProfile = await Mentor.findOne({ userId: req.user._id }).select('_id');
                if (mentorProfile && mentee.mentorId?.toString() === mentorProfile._id.toString()) {
                    isAuthorized = true;
                }
            }

            if (!isAuthorized && req.user.role === 'mentee') {
                if (mentee.userId?.toString() === req.user._id.toString()) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to delete this conversation' });
        }

        await Message.deleteMany({ conversationType: type, conversationId: id });

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;