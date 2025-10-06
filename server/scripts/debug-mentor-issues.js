const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Group = require('../models/Group');
require('dotenv').config();

const debugMentorIssues = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== DEBUGGING MENTOR LOGIN & GROUP CREATION ISSUES ===');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test 1: Check mentor user and profile
        console.log('\n1. Checking mentor user and profile...');
        const mentorUser = await User.findOne({ email: 'mentor@demo.com' });
        if (!mentorUser) {
            console.error('❌ Mentor user not found in database');
            return;
        }
        
        console.log(`✅ Mentor user found: ${mentorUser.email}`);
        console.log(`   - Role: ${mentorUser.role}`);
        console.log(`   - Active: ${mentorUser.isActive}`);
        console.log(`   - Created: ${mentorUser.createdAt}`);
        console.log(`   - Last Login: ${mentorUser.lastLogin || 'Never'}`);

        const mentorProfile = await Mentor.findOne({ userId: mentorUser._id });
        if (!mentorProfile) {
            console.error('❌ Mentor profile not found in database');
            return;
        }
        
        console.log(`✅ Mentor profile found: ${mentorProfile.fullName}`);
        console.log(`   - ID: ${mentorProfile._id}`);
        console.log(`   - Department: ${mentorProfile.department}`);

        // Test 2: Test login
        console.log('\n2. Testing mentor login...');
        let token;
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            
            token = loginResponse.data.token;
            console.log('✅ Login successful');
            console.log(`   - Token received: ${token ? 'Yes' : 'No'}`);
            console.log(`   - Token length: ${token?.length || 0}`);
        } catch (loginError) {
            console.error('❌ Login failed:', loginError.response?.data || loginError.message);
            return;
        }

        // Test 3: Test /auth/me endpoint
        console.log('\n3. Testing /auth/me endpoint...');
        try {
            const meResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ /auth/me successful');
            console.log(`   - User: ${meResponse.data.user.email}`);
            console.log(`   - Role: ${meResponse.data.user.role}`);
            console.log(`   - Profile: ${meResponse.data.profile ? 'Found' : 'Missing'}`);
        } catch (meError) {
            console.error('❌ /auth/me failed:', meError.response?.data || meError.message);
            return;
        }

        // Test 4: Test group creation
        console.log('\n4. Testing group creation...');
        const groupData = {
            name: `Test Group ${Date.now()}`,
            description: 'Test group created by debugging script',
            color: '#10B981',
            menteeIds: []
        };

        try {
            const groupResponse = await axios.post(`${API_URL}/groups`, groupData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Group creation successful');
            console.log(`   - Group ID: ${groupResponse.data._id}`);
            console.log(`   - Group name: ${groupResponse.data.name}`);
            console.log(`   - Mentor ID: ${groupResponse.data.mentorId}`);
        } catch (groupError) {
            console.error('❌ Group creation failed:', groupError.response?.data || groupError.message);
            console.error('   - Status:', groupError.response?.status);
            console.error('   - Request data:', groupData);
        }

        // Test 5: Test fetching groups
        console.log('\n5. Testing group fetching...');
        try {
            const fetchGroupsResponse = await axios.get(`${API_URL}/groups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Group fetching successful');
            console.log(`   - Groups found: ${fetchGroupsResponse.data.length}`);
        } catch (fetchError) {
            console.error('❌ Group fetching failed:', fetchError.response?.data || fetchError.message);
        }

        // Test 6: Test with invalid token (simulate token expiration)
        console.log('\n6. Testing with invalid token...');
        try {
            await axios.get(`${API_URL}/groups`, {
                headers: { 'Authorization': `Bearer invalid_token_123` }
            });
        } catch (invalidTokenError) {
            console.log('✅ Invalid token properly rejected');
            console.log(`   - Status: ${invalidTokenError.response?.status}`);
            console.log(`   - Message: ${invalidTokenError.response?.data?.message}`);
        }

        // Test 7: Check database state
        console.log('\n7. Checking database state...');
        const totalGroups = await Group.countDocuments();
        const mentorGroups = await Group.countDocuments({ mentorId: mentorProfile._id });
        
        console.log(`   - Total groups in database: ${totalGroups}`);
        console.log(`   - Groups for this mentor: ${mentorGroups}`);

        mongoose.disconnect();
        console.log('\n🎉 DEBUGGING COMPLETED');
        
        console.log('\n📋 SUMMARY:');
        console.log('   - Mentor user exists: ✅');
        console.log('   - Mentor profile exists: ✅');
        console.log('   - Login works: ✅');
        console.log('   - Authentication works: ✅');
        console.log('   - Group creation: Check above results');
        console.log('   - Group fetching: Check above results');
        
    } catch (error) {
        console.error('\n❌ DEBUGGING FAILED:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        mongoose.disconnect();
    }
};

debugMentorIssues();
