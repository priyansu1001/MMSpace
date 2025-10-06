const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

const testGroupsEndpoint = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a mentor user
        const mentorUser = await User.findOne({ role: 'mentor', isActive: true });
        if (!mentorUser) {
            console.log('No active mentor user found');
            return;
        }

        console.log(`Testing with mentor user: ${mentorUser.email}`);

        // Login to get token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: mentorUser.email,
            password: 'password123' // Default password - you may need to adjust this
        });

        const token = loginResponse.data.token;
        console.log('Login successful, got token');

        // Test /auth/me endpoint
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User profile:', meResponse.data);

        // Test groups endpoint
        const groupsResponse = await axios.get('http://localhost:5000/api/groups', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Groups response:', groupsResponse.data);

        mongoose.disconnect();
        console.log('Test completed successfully');
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        mongoose.disconnect();
    }
};

testGroupsEndpoint();
