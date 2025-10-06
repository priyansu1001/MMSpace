const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Group = require('../models/Group');
require('dotenv').config();

const debugDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check users
        const users = await User.find({});
        console.log('\n=== USERS ===');
        users.forEach(user => {
            console.log(`ID: ${user._id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
        });

        // Check mentors
        const mentors = await Mentor.find({});
        console.log('\n=== MENTORS ===');
        mentors.forEach(mentor => {
            console.log(`ID: ${mentor._id}, UserID: ${mentor.userId}, Name: ${mentor.fullName}, EmployeeID: ${mentor.employeeId}`);
        });

        // Check groups
        const groups = await Group.find({});
        console.log('\n=== GROUPS ===');
        groups.forEach(group => {
            console.log(`ID: ${group._id}, Name: ${group.name}, MentorID: ${group.mentorId}, Archived: ${group.isArchived}`);
        });

        // Check for orphaned users (users without profiles)
        console.log('\n=== ORPHANED MENTOR USERS ===');
        const mentorUsers = await User.find({ role: 'mentor' });
        for (const user of mentorUsers) {
            const mentorProfile = await Mentor.findOne({ userId: user._id });
            if (!mentorProfile) {
                console.log(`ORPHANED: User ${user.email} (${user._id}) has role 'mentor' but no Mentor profile`);
                
                // Create mentor profile for orphaned user
                const mentor = new Mentor({
                    userId: user._id,
                    fullName: user.email.split('@')[0], // Use email prefix as name
                    employeeId: `EMP${Date.now()}`,
                    department: 'General',
                    phone: '000-000-0000',
                    subjects: []
                });
                
                await mentor.save();
                console.log(`FIXED: Created Mentor profile for user ${user.email}`);
            }
        }

        mongoose.disconnect();
        console.log('\nDatabase debug complete');
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

debugDatabase();
