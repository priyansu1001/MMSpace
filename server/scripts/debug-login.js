const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const debugLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check all users and their status
        const users = await User.find({});
        console.log('\n=== ALL USERS ===');
        for (const user of users) {
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Active: ${user.isActive}`);
            console.log(`Created: ${user.createdAt}`);
            console.log(`Last Login: ${user.lastLogin || 'Never'}`);
            
            // Test password verification
            try {
                const testPassword = 'password123'; // Common test password
                const isMatch = await user.comparePassword(testPassword);
                console.log(`Password '${testPassword}' matches: ${isMatch}`);
            } catch (err) {
                console.log(`Password comparison error: ${err.message}`);
            }
            
            // Check if user has profile
            let profile = null;
            if (user.role === 'mentor') {
                profile = await Mentor.findOne({ userId: user._id });
            } else if (user.role === 'mentee') {
                profile = await Mentee.findOne({ userId: user._id });
            }
            console.log(`Has Profile: ${profile ? 'Yes' : 'No'}`);
            console.log('---');
        }

        // Check for common issues
        console.log('\n=== POTENTIAL ISSUES ===');
        
        // Check for inactive users
        const inactiveUsers = await User.find({ isActive: false });
        if (inactiveUsers.length > 0) {
            console.log(`⚠️  Found ${inactiveUsers.length} inactive users:`);
            inactiveUsers.forEach(user => console.log(`  - ${user.email}`));
        }

        // Check for users without profiles
        const mentors = await User.find({ role: 'mentor' });
        const mentees = await User.find({ role: 'mentee' });
        
        for (const mentor of mentors) {
            const profile = await Mentor.findOne({ userId: mentor._id });
            if (!profile) {
                console.log(`⚠️  Mentor ${mentor.email} has no profile`);
            }
        }
        
        for (const mentee of mentees) {
            const profile = await Mentee.findOne({ userId: mentee._id });
            if (!profile) {
                console.log(`⚠️  Mentee ${mentee.email} has no profile`);
            }
        }

        // Test JWT secret
        console.log(`\n=== JWT CONFIGURATION ===`);
        console.log(`JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
        console.log(`JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0}`);

        mongoose.disconnect();
        console.log('\nLogin debug completed');
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

debugLogin();
