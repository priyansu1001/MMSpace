const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const Mentee = require('../models/Mentee');
const Mentor = require('../models/Mentor');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/leaves
// @desc    Submit leave request
// @access  Private (Mentee only)
router.post('/', auth, roleCheck(['mentee']), async (req, res) => {
    try {
        const mentee = await Mentee.findOne({ userId: req.user._id });
        const { leaveType, startDate, endDate, reason } = req.body;

        // Calculate days count
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leaveRequest = new LeaveRequest({
            menteeId: mentee._id,
            mentorId: mentee.mentorId,
            leaveType,
            startDate,
            endDate,
            daysCount,
            reason
        });

        await leaveRequest.save();
        await leaveRequest.populate('menteeId', 'fullName studentId');

        // Emit notification to mentor
        req.io.to(mentee.mentorId.toString()).emit('newLeaveRequest', leaveRequest);

        res.status(201).json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/leaves/mentee
// @desc    Get mentee's leave requests
// @access  Private (Mentee only)
router.get('/mentee', auth, roleCheck(['mentee']), async (req, res) => {
    try {
        const mentee = await Mentee.findOne({ userId: req.user._id });
        const leaves = await LeaveRequest.find({ menteeId: mentee._id })
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/leaves/mentor
// @desc    Get mentor's mentees leave requests
// @access  Private (Mentor only)
router.get('/mentor', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ userId: req.user._id });
        const { status } = req.query;

        let query = { mentorId: mentor._id };
        if (status) {
            query.status = status;
        }

        const leaves = await LeaveRequest.find(query)
            .populate('menteeId', 'fullName studentId class section')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve leave request
// @access  Private (Mentor only)
router.put('/:id/approve', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const { mentorComments } = req.body;

        const leaveRequest = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                mentorComments,
                reviewedAt: new Date()
            },
            { new: true }
        ).populate('menteeId', 'fullName studentId');

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Emit notification to mentee
        req.io.to(leaveRequest.menteeId._id.toString()).emit('leaveStatusUpdate', leaveRequest);

        res.json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/leaves/:id/reject
// @desc    Reject leave request
// @access  Private (Mentor only)
router.put('/:id/reject', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const { mentorComments } = req.body;

        const leaveRequest = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                mentorComments,
                reviewedAt: new Date()
            },
            { new: true }
        ).populate('menteeId', 'fullName studentId');

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Emit notification to mentee
        req.io.to(leaveRequest.menteeId._id.toString()).emit('leaveStatusUpdate', leaveRequest);

        res.json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;