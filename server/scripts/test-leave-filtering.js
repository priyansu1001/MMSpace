const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const Mentee = require('../models/Mentee');
require('dotenv').config();

const testLeaveFiltering = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a mentee
        const mentee = await Mentee.findOne();
        if (!mentee) {
            console.log('No mentee found');
            return;
        }

        console.log(`Testing leave filtering for mentee: ${mentee.fullName}`);

        // Test different status filters
        const statuses = ['pending', 'approved', 'rejected'];
        
        console.log('\n=== TESTING LEAVE REQUEST FILTERING ===');
        
        // Test all leaves
        const allLeaves = await LeaveRequest.find({ menteeId: mentee._id });
        console.log(`\nAll leaves: ${allLeaves.length}`);
        allLeaves.forEach(leave => {
            console.log(`  - ${leave.leaveType} (${leave.status}) - ${leave.reason}`);
        });

        // Test filtered leaves
        for (const status of statuses) {
            const filteredLeaves = await LeaveRequest.find({ 
                menteeId: mentee._id, 
                status: status 
            });
            console.log(`\n${status.toUpperCase()} leaves: ${filteredLeaves.length}`);
            filteredLeaves.forEach(leave => {
                console.log(`  - ${leave.leaveType} (${leave.status}) - ${leave.reason}`);
            });
        }

        // Create test leave requests with different statuses if none exist
        if (allLeaves.length === 0) {
            console.log('\nNo leave requests found. Creating test data...');
            
            const testLeaves = [
                {
                    menteeId: mentee._id,
                    mentorId: mentee.mentorId,
                    leaveType: 'sick',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    daysCount: 1,
                    reason: 'Test pending leave',
                    status: 'pending'
                },
                {
                    menteeId: mentee._id,
                    mentorId: mentee.mentorId,
                    leaveType: 'casual',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    daysCount: 2,
                    reason: 'Test approved leave',
                    status: 'approved',
                    mentorComments: 'Approved for testing'
                },
                {
                    menteeId: mentee._id,
                    mentorId: mentee.mentorId,
                    leaveType: 'emergency',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    daysCount: 1,
                    reason: 'Test rejected leave',
                    status: 'rejected',
                    mentorComments: 'Rejected for testing'
                }
            ];

            for (const leaveData of testLeaves) {
                const leave = new LeaveRequest(leaveData);
                await leave.save();
                console.log(`Created ${leaveData.status} leave request`);
            }

            console.log('\nTest data created successfully!');
        }

        mongoose.disconnect();
        console.log('\nLeave filtering test completed');
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

testLeaveFiltering();
