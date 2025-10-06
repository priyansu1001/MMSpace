const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const Mentee = require('../models/Mentee');
require('dotenv').config();

const createTestLeaves = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a mentee
        const mentee = await Mentee.findOne();
        if (!mentee) {
            console.log('No mentee found');
            return;
        }

        console.log(`Creating test leaves for mentee: ${mentee.fullName}`);

        // Create test leave requests with different statuses
        const testLeaves = [
            {
                menteeId: mentee._id,
                mentorId: mentee.mentorId,
                leaveType: 'casual',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-01-16'),
                daysCount: 2,
                reason: 'Family function - pending approval',
                status: 'pending'
            },
            {
                menteeId: mentee._id,
                mentorId: mentee.mentorId,
                leaveType: 'emergency',
                startDate: new Date('2025-01-10'),
                endDate: new Date('2025-01-10'),
                daysCount: 1,
                reason: 'Medical emergency - rejected',
                status: 'rejected',
                mentorComments: 'Need more documentation',
                reviewedAt: new Date()
            }
        ];

        for (const leaveData of testLeaves) {
            const leave = new LeaveRequest(leaveData);
            await leave.save();
            console.log(`✅ Created ${leaveData.status} leave request: ${leaveData.reason}`);
        }

        // Now test the filtering
        console.log('\n=== TESTING FILTERING AFTER CREATING TEST DATA ===');
        
        const allLeaves = await LeaveRequest.find({ menteeId: mentee._id });
        console.log(`\nTotal leaves: ${allLeaves.length}`);
        
        const pendingLeaves = await LeaveRequest.find({ menteeId: mentee._id, status: 'pending' });
        const approvedLeaves = await LeaveRequest.find({ menteeId: mentee._id, status: 'approved' });
        const rejectedLeaves = await LeaveRequest.find({ menteeId: mentee._id, status: 'rejected' });
        
        console.log(`Pending: ${pendingLeaves.length}`);
        console.log(`Approved: ${approvedLeaves.length}`);
        console.log(`Rejected: ${rejectedLeaves.length}`);

        mongoose.disconnect();
        console.log('\n✅ Test leave requests created successfully!');
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

createTestLeaves();
