const express = require('express');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Group = require('../models/Group');
const LeaveRequest = require('../models/LeaveRequest');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { safeFindOne, safeFind, safeCount, executeMultipleWithRetry } = require('../utils/dbUtils');

const router = express.Router();

// @route   GET /api/mentors/profile
// @desc    Get mentor profile
// @access  Private (Mentor only)
router.get('/profile', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await safeFindOne(Mentor, { userId: req.user._id });
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor profile not found' });
        }
        res.json(mentor);
    } catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({ message: 'Failed to fetch mentor profile' });
    }
});

// @route   GET /api/mentors/mentees
// @desc    Get all mentees assigned to mentor
// @access  Private (Mentor only)
router.get('/mentees', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await safeFindOne(Mentor, { userId: req.user._id });
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor profile not found' });
        }

        const mentees = await safeFind(Mentee, { mentorId: mentor._id }, {
            populate: 'userId'
        });

        res.json(mentees);
    } catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ message: 'Failed to fetch mentees' });
    }
});

// @route   GET /api/mentors/dashboard
// @desc    Get mentor dashboard data
// @access  Private (Mentor only)
router.get('/dashboard', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        let retries = 3;
        let mentor, totalMentees, totalGroups, pendingLeaves, recentLeaves, mentees;

        while (retries > 0) {
            try {
                mentor = await Mentor.findOne({ userId: req.user._id }).lean();

                if (!mentor) {
                    return res.status(404).json({ message: 'Mentor profile not found' });
                }

                // Execute all queries with proper error handling
                [totalMentees, totalGroups, pendingLeaves, recentLeaves, mentees] = await Promise.all([
                    Mentee.countDocuments({ mentorId: mentor._id }),
                    Group.countDocuments({ mentorId: mentor._id, isArchived: false }),
                    LeaveRequest.countDocuments({
                        mentorId: mentor._id,
                        status: 'pending'
                    }),
                    LeaveRequest.find({ mentorId: mentor._id })
                        .populate('menteeId', 'fullName studentId')
                        .sort({ createdAt: -1 })
                        .limit(5)
                        .lean(),
                    Mentee.find({ mentorId: mentor._id })
                        .populate('userId', 'email lastLogin')
                        .sort({ fullName: 1 })
                        .limit(10)
                        .lean()
                ]);

                break;
            } catch (dbError) {
                retries--;
                if (retries === 0) {
                    console.error('Database error in mentor dashboard:', dbError);
                    return res.status(500).json({ message: 'Database connection error' });
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

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
        console.error('Error in mentor dashboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;