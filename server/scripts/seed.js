const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Group = require('../models/Group');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Admin.deleteMany({});
        await Mentor.deleteMany({});
        await Mentee.deleteMany({});
        await Group.deleteMany({});

        console.log('Cleared existing data');

        // Create admin user
        const adminUser = new User({
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });
        await adminUser.save();

        // Create admin profile
        const admin = new Admin({
            userId: adminUser._id,
            fullName: 'System Administrator',
            employeeId: 'ADM001',
            department: 'Administration',
            phone: '+1-555-0100',
            position: 'System Administrator'
        });
        await admin.save();

        // Create mentor user
        const mentorUser = new User({
            email: 'mentor@example.com',
            password: 'password123',
            role: 'mentor'
        });
        await mentorUser.save();

        // Create mentor profile
        const mentor = new Mentor({
            userId: mentorUser._id,
            fullName: 'Dr. Sarah Johnson',
            employeeId: 'EMP001',
            department: 'Computer Science',
            phone: '+1-555-0123',
            subjects: ['Mathematics', 'Computer Science', 'Physics'],
            qualifications: 'PhD in Computer Science, M.Sc in Mathematics',
            citations: 'Johnson, S. (2023). "Advanced Machine Learning Algorithms in Education." Journal of Educational Technology, 45(2), 123-145.\n\nJohnson, S., & Smith, R. (2022). "Innovative Teaching Methods in Computer Science." ACM SIGCSE Bulletin, 54(1), 89-102.\n\nJohnson, S. (2021). "Data Structures and Algorithm Design for Modern Applications." IEEE Transactions on Education, 64(3), 201-215.',
            experience: 8,
            officeHours: '9:00 AM - 5:00 PM'
        });
        await mentor.save();

        // Create mentee user
        const menteeUser = new User({
            email: 'mentee@example.com',
            password: 'password123',
            role: 'mentee'
        });
        await menteeUser.save();

        // Create mentee profile
        const mentee = new Mentee({
            userId: menteeUser._id,
            mentorId: mentor._id,
            fullName: 'John Smith',
            studentId: 'STU001',
            dateOfBirth: new Date('2005-03-15'),
            phone: '+1-555-0124',
            class: '10',
            section: 'A',
            academicYear: '2024-2025',
            attendance: {
                totalDays: 180,
                presentDays: 165,
                percentage: 91.7
            },
            parentInfo: {
                fatherName: 'Robert Smith',
                motherName: 'Mary Smith',
                primaryContact: '+1-555-0125',
                secondaryContact: '+1-555-0126',
                email: 'parents@example.com',
                emergencyContact: '+1-555-0127'
            },
            address: '123 Main Street, City, State 12345',
            bloodGroup: 'O+',
            hobbies: ['Reading', 'Sports', 'Music']
        });
        await mentee.save();

        // Create additional mentees
        const additionalMentees = [];
        for (let i = 2; i <= 5; i++) {
            const menteeUser = new User({
                email: `mentee${i}@example.com`,
                password: 'password123',
                role: 'mentee'
            });
            await menteeUser.save();

            const mentee = new Mentee({
                userId: menteeUser._id,
                mentorId: mentor._id,
                fullName: `Student ${i}`,
                studentId: `STU00${i}`,
                dateOfBirth: new Date(`200${i}-0${i}-15`),
                phone: `+1-555-012${i + 3}`,
                class: '10',
                section: 'A',
                academicYear: '2024-2025',
                attendance: {
                    totalDays: 180,
                    presentDays: Math.floor(Math.random() * 30) + 150,
                    percentage: Math.floor(Math.random() * 20) + 80
                }
            });
            await mentee.save();
            additionalMentees.push(mentee);
        }

        // Create a sample group
        const group = new Group({
            name: 'Class 10-A Mathematics',
            mentorId: mentor._id,
            menteeIds: [mentee._id, ...additionalMentees.map(m => m._id)],
            description: 'Advanced Mathematics group for Class 10-A students',
            color: '#3B82F6'
        });
        await group.save();

        console.log('Sample data created successfully!');
        console.log('\nLogin Credentials:');
        console.log('Admin: admin@example.com / password123');
        console.log('Mentor: mentor@example.com / password123');
        console.log('Mentee: mentee@example.com / password123');
        console.log('Additional mentees: mentee2@example.com to mentee5@example.com / password123');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};

const run = async () => {
    await connectDB();
    await seedData();
};

run();