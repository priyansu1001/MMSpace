const express = require('express');
const Group = require('../models/Group');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Mentor only)
router.post('/', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] Group creation request from user: ${req.user.email}`);
        console.log('Request body:', req.body);

        // Validate required fields
        const { name, description, color, menteeIds } = req.body;
        
        if (!name || name.trim().length === 0) {
            console.log('Group creation failed: Missing or empty name');
            return res.status(400).json({ 
                message: 'Group name is required',
                field: 'name'
            });
        }

        if (name.trim().length > 100) {
            console.log('Group creation failed: Name too long');
            return res.status(400).json({ 
                message: 'Group name must be less than 100 characters',
                field: 'name'
            });
        }

        console.log('Finding mentor profile...');
        const mentor = await Mentor.findOne({ userId: req.user._id });
        
        if (!mentor) {
            console.log('Group creation failed: No mentor profile found for user:', req.user._id);
            return res.status(404).json({ 
                message: 'Mentor profile not found. Please contact administrator.',
                code: 'MENTOR_PROFILE_MISSING'
            });
        }

        console.log(`Found mentor: ${mentor.fullName} (${mentor._id})`);

        // Validate menteeIds if provided
        if (menteeIds && Array.isArray(menteeIds)) {
            console.log(`Validating ${menteeIds.length} mentee IDs...`);
            
            // Check if all menteeIds are valid ObjectIds
            const mongoose = require('mongoose');
            const invalidIds = menteeIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
            
            if (invalidIds.length > 0) {
                console.log('Group creation failed: Invalid mentee IDs:', invalidIds);
                return res.status(400).json({ 
                    message: 'Invalid mentee IDs provided',
                    invalidIds: invalidIds
                });
            }

            // Verify mentees exist and belong to this mentor
            const Mentee = require('../models/Mentee');
            const mentees = await Mentee.find({ 
                _id: { $in: menteeIds },
                mentorId: mentor._id 
            });

            if (mentees.length !== menteeIds.length) {
                console.log('Group creation failed: Some mentees not found or not assigned to this mentor');
                return res.status(400).json({ 
                    message: 'Some mentees are not found or not assigned to you',
                    found: mentees.length,
                    requested: menteeIds.length
                });
            }
        }

        console.log('Creating group...');
        const group = new Group({
            name: name.trim(),
            mentorId: mentor._id,
            description: description ? description.trim() : '',
            color: color || '#3B82F6',
            menteeIds: menteeIds || []
        });

        console.log('Saving group to database...');
        await group.save();
        console.log('Group saved successfully with ID:', group._id);

        console.log('Populating group data...');
        await group.populate('menteeIds', 'fullName studentId class section');

        console.log('Group creation completed successfully');
        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        console.error('Error stack:', error.stack);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'A group with this name already exists',
                code: 'DUPLICATE_NAME'
            });
        }

        res.status(500).json({ 
            message: 'Server error while creating group',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/groups
// @desc    Get all groups for mentor
// @access  Private (Mentor only)
router.get('/', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        console.log('GET /api/groups - User:', req.user.email, 'Role:', req.user.role);
        
        const mentor = await Mentor.findOne({ userId: req.user._id });
        console.log('Found mentor:', mentor ? mentor._id : 'null');
        
        if (!mentor) {
            console.log('No mentor profile found for user:', req.user._id);
            return res.status(404).json({ message: 'Mentor profile not found' });
        }
        
        const groups = await Group.find({
            mentorId: mentor._id,
            isArchived: false
        }).populate('menteeIds', 'fullName studentId class section');
        
        console.log('Found groups:', groups.length);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/groups/mentee
// @desc    Get groups for mentee (groups where mentee is a member)
// @access  Private (Mentee only)
router.get('/mentee', auth, roleCheck(['mentee']), async (req, res) => {
    try {
        console.log('GET /api/groups/mentee - User:', req.user.email, 'Role:', req.user.role);
        
        const mentee = await Mentee.findOne({ userId: req.user._id });
        console.log('Found mentee:', mentee ? mentee._id : 'null');
        
        if (!mentee) {
            console.log('No mentee profile found for user:', req.user._id);
            return res.status(404).json({ message: 'Mentee profile not found' });
        }
        
        const groups = await Group.find({
            menteeIds: mentee._id,
            isArchived: false
        }).populate('mentorId', 'fullName department')
          .populate('menteeIds', 'fullName studentId class section');
        
        console.log('Found groups for mentee:', groups.length);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching mentee groups:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/groups/:id
// @desc    Get group details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('menteeIds', 'fullName studentId class section phone')
            .populate('mentorId', 'fullName department');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/groups/:id/details
// @desc    Get detailed group information with members
// @access  Private
router.get('/:id/details', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('menteeIds', 'fullName studentId class section phone email')
            .populate('mentorId', 'fullName department email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Format the response for the details modal
        const groupDetails = {
            _id: group._id,
            name: group.name,
            description: group.description,
            color: group.color,
            createdAt: group.createdAt,
            members: group.menteeIds,
            mentor: group.mentorId
        };

        res.json(groupDetails);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private (Mentor only)
router.put('/:id', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const { name, description, color, menteeIds } = req.body;

        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { name, description, color, menteeIds },
            { new: true }
        ).populate('menteeIds', 'fullName studentId class section');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/groups/:id
// @desc    Archive group
// @access  Private (Mentor only)
router.delete('/:id', auth, roleCheck(['mentor']), async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group archived successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;