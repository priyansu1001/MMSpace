const axios = require('axios');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Mentee = require('../models/Mentee');
require('dotenv').config();

const debugGroupMessageNetwork = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== DEBUGGING GROUP MESSAGE NETWORK ERROR ===');
    console.log('Testing the exact scenario: Create group → Send message → Network error');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Step 1: Login as mentor
        console.log('\n1. Logging in as mentor...');
        let token;
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            token = loginResponse.data.token;
            console.log('✅ Login successful');
            console.log(`   - Token length: ${token.length}`);
        } catch (error) {
            console.error('❌ Login failed:', error.response?.data || error.message);
            return;
        }

        // Step 2: Get a mentee to add to group
        console.log('\n2. Finding mentee to add to group...');
        const mentee = await Mentee.findOne();
        if (!mentee) {
            console.error('❌ No mentee found');
            return;
        }
        console.log(`✅ Found mentee: ${mentee.fullName} (${mentee._id})`);

        // Step 3: Create group with mentee
        console.log('\n3. Creating group with mentee...');
        let groupId;
        try {
            const groupData = {
                name: `Network Test Group ${Date.now()}`,
                description: 'Testing network error issue',
                color: '#10B981',
                menteeIds: [mentee._id.toString()]
            };

            console.log('Group data being sent:', groupData);

            const groupResponse = await axios.post(`${API_URL}/groups`, groupData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            groupId = groupResponse.data._id;
            console.log('✅ Group created successfully');
            console.log(`   - Group ID: ${groupId}`);
            console.log(`   - Group name: ${groupResponse.data.name}`);
            console.log(`   - Mentees in group: ${groupResponse.data.menteeIds?.length || 0}`);
        } catch (error) {
            console.error('❌ Group creation failed:', error.response?.data || error.message);
            return;
        }

        // Step 4: Test message sending with detailed debugging
        console.log('\n4. Testing message sending with detailed debugging...');
        
        const messageData = {
            conversationType: 'group',
            conversationId: groupId,
            content: 'Test message to debug network error'
        };

        console.log('Message data:', messageData);
        console.log('Request headers that will be sent:');
        console.log(`   - Authorization: Bearer ${token.substring(0, 20)}...`);
        console.log('   - Content-Type: application/json');
        console.log(`   - Request URL: ${API_URL}/messages`);

        try {
            console.log('Sending message request...');
            const messageResponse = await axios.post(`${API_URL}/messages`, messageData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('✅ Message sent successfully!');
            console.log(`   - Message ID: ${messageResponse.data._id}`);
            console.log(`   - Response status: ${messageResponse.status}`);
            console.log(`   - Response data:`, messageResponse.data);
            
        } catch (messageError) {
            console.error('❌ Message sending failed - NETWORK ERROR REPRODUCED!');
            console.error('Error details:');
            console.error(`   - Error code: ${messageError.code}`);
            console.error(`   - Error message: ${messageError.message}`);
            console.error(`   - Response status: ${messageError.response?.status}`);
            console.error(`   - Response data:`, messageError.response?.data);
            console.error(`   - Request config:`, {
                url: messageError.config?.url,
                method: messageError.config?.method,
                headers: messageError.config?.headers,
                data: messageError.config?.data
            });

            // Check if it's a network error (no response)
            if (!messageError.response) {
                console.error('\n🔍 ANALYSIS: This is a network error (no response from server)');
                console.error('Possible causes:');
                console.error('   1. Server is not running or crashed');
                console.error('   2. Server port is blocked or changed');
                console.error('   3. CORS issues');
                console.error('   4. Request timeout');
                console.error('   5. Malformed request data');
            } else {
                console.error('\n🔍 ANALYSIS: Server responded with error');
                console.error(`   - HTTP Status: ${messageError.response.status}`);
                console.error(`   - Error message: ${messageError.response.data?.message}`);
            }
        }

        // Step 5: Test server health after message attempt
        console.log('\n5. Testing server health after message attempt...');
        try {
            const healthResponse = await axios.get(`${API_URL}/health`, {
                timeout: 5000
            });
            console.log('✅ Server is still healthy');
            console.log(`   - Response: ${JSON.stringify(healthResponse.data)}`);
        } catch (healthError) {
            console.error('❌ Server health check failed');
            console.error(`   - Error: ${healthError.message}`);
            console.error('   - This suggests the server may have crashed or become unresponsive');
        }

        // Step 6: Test if auth still works
        console.log('\n6. Testing if authentication still works...');
        try {
            const meResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            console.log('✅ Authentication still works');
            console.log(`   - User: ${meResponse.data.user.email}`);
        } catch (authError) {
            console.error('❌ Authentication failed');
            console.error(`   - Error: ${authError.message}`);
        }

        mongoose.disconnect();
        console.log('\n🔍 DEBUGGING COMPLETED');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Check if server is still running');
        console.log('2. Check server logs for any errors during message sending');
        console.log('3. Verify the message route is properly configured');
        console.log('4. Check for any middleware issues');
        
    } catch (error) {
        console.error('\n❌ DEBUGGING FAILED:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        mongoose.disconnect();
    }
};

debugGroupMessageNetwork();
