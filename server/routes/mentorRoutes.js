const express = require('express');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Group = require('../models/Group');
const LeaveRequest = require('../models/LeaveRequest');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/mentors/profile
// @desc    Get mentor profile
// @access  Private (Mentor only)
router.get('/profile', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ userId: req.user._id });
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor profile not found' });
        }
        res.json(mentor);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/mentors/mentees
// @desc    Get all mentees assigned to mentor
// @access  Private (Mentor only)
router.get('/mentees', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ userId: req.user._id });
        const mentees = await Mentee.find({ mentorId: mentor._id }).populate('userId', 'email');
        res.json(mentees);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/mentors/dashboard
// @desc    Get mentor dashboard data
// @access  Private (Mentor only)
router.get('/dashboard', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ userId: req.user._id });

        const totalMentees = await Mentee.countDocuments({ mentorId: mentor._id });
        const totalGroups = await Group.countDocuments({ mentorId: mentor._id, isArchived: false });
        const pendingLeaves = await LeaveRequest.countDocuments({
            mentorId: mentor._id,
            status: 'pending'
        });

        // Get recent leave requests
        const recentLeaves = await LeaveRequest.find({ mentorId: mentor._id })
            .populate('menteeId', 'fullName studentId')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get all mentees with detailed information
        const mentees = await Mentee.find({ mentorId: mentor._id })
            .populate('userId', 'email lastLogin')
            .sort({ fullName: 1 })
            .limit(10);

        res.json({
            stats: {
                totalMentees,
                totalGroups,
                pendingLeaves
            },
            recentLeaves,
            mentees
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;