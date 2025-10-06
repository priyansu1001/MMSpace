const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Group = require('../models/Group');
require('dotenv').config();

const createTestGroup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a mentor
        const mentor = await Mentor.findOne();
        if (!mentor) {
            console.log('No mentor found');
            return;
        }

        // Find mentees
        const mentees = await Mentee.find().limit(3);
        if (mentees.length === 0) {
            console.log('No mentees found');
            return;
        }

        console.log(`Found mentor: ${mentor.fullName}`);
        console.log(`Found ${mentees.length} mentees`);

        // Create a test group
        const testGroup = new Group({
            name: 'Test Study Group',
            mentorId: mentor._id,
            description: 'A test group for studying together',
            color: '#10B981',
            menteeIds: mentees.map(m => m._id)
        });

        await testGroup.save();
        console.log('Test group created successfully!');
        console.log('Group ID:', testGroup._id);
        console.log('Group Name:', testGroup.name);
        console.log('Mentor:', mentor.fullName);
        console.log('Mentees:', mentees.map(m => m.fullName).join(', '));

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

createTestGroup();
