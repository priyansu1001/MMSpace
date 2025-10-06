const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const auth = require('../middleware/auth');

const router = express.Router();

// More lenient rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased limit to 50 login attempts per windowMs
    message: { message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks and in development
        return process.env.NODE_ENV === 'development' || req.path === '/health';
    }
});

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'mentor', 'mentee']),
    body('fullName').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, fullName, ...profileData } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        user = new User({ email, password, role });
        await user.save();

        // Create profile based on role
        if (role === 'admin') {
            const admin = new Admin({
                userId: user._id,
                fullName,
                employeeId: profileData.employeeId || `ADM${Date.now()}`,
                department: profileData.department || 'Administration',
                phone: profileData.phone || '',
                position: profileData.position || 'System Administrator'
            });
            await admin.save();
        } else if (role === 'mentor') {
            const mentor = new Mentor({
                userId: user._id,
                fullName,
                employeeId: profileData.employeeId || `EMP${Date.now()}`,
                department: profileData.department || 'General',
                phone: profileData.phone || '',
                subjects: profileData.subjects || []
            });
            await mentor.save();
        } else {
            // For mentees, we'll assign them to the first available mentor for now
            // In a real system, this would be handled by an admin
            const firstMentor = await Mentor.findOne();

            const mentee = new Mentee({
                userId: user._id,
                mentorId: firstMentor ? firstMentor._id : null,
                fullName,
                studentId: profileData.studentId || `STU${Date.now()}`,
                phone: profileData.phone || '',
                class: profileData.class || '',
                section: profileData.section || '',
                academicYear: profileData.academicYear || new Date().getFullYear().toString()
            });
            await mentee.save();
        }

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    const startTime = Date.now();
    try {
        console.log(`[${new Date().toISOString()}] Login request received`);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Login validation errors:', errors.array());
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email} from IP: ${req.ip}`);

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User not found for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log(`User found: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);

        // Check if user is active
        if (!user.isActive) {
            console.log(`Login failed: User account is inactive for email: ${email}`);
            return res.status(400).json({ message: 'Account is inactive' });
        }

        // Check password
        console.log('Verifying password...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: Invalid password for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('Password verified successfully');

        // Update last login with retry mechanism
        try {
            user.lastLogin = new Date();
            await user.save();
            console.log('Last login updated successfully');
        } catch (saveError) {
            console.error('Error updating last login:', saveError);
            // Don't fail the login if we can't update lastLogin
        }

        // Generate token
        console.log('Generating JWT token...');
        const token = generateToken(user._id);
        
        const loginTime = Date.now() - startTime;
        console.log(`Login successful for email: ${email} (took ${loginTime}ms)`);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        const loginTime = Date.now() - startTime;
        console.error(`Login error after ${loginTime}ms:`, error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        console.log('GET /auth/me - User:', req.user.email, 'Role:', req.user.role);
        let profile;

        if (req.user.role === 'admin') {
            profile = await Admin.findOne({ userId: req.user._id });
        } else if (req.user.role === 'mentor') {
            profile = await Mentor.findOne({ userId: req.user._id });
            console.log('Mentor profile found:', profile ? profile._id : 'null');
        } else {
            profile = await Mentee.findOne({ userId: req.user._id }).populate('mentorId');
        }

        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            },
            profile
        });
    } catch (error) {
        console.error('Error in /auth/me:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;