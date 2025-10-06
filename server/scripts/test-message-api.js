const axios = require('axios');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Mentee = require('../models/Mentee');
require('dotenv').config();

const testMessageAPI = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING MESSAGE API ===');
    
    try {
        // Connect to database to get test data
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test server health first
        console.log('\n1. Testing server health...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('✅ Server is healthy:', healthResponse.data);
        
        // Login as mentor
        console.log('\n2. Logging in as mentor...');
        const mentorLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        console.log('✅ Mentor login successful');
        const mentorToken = mentorLoginResponse.data.token;
        
        // Get a test group
        const testGroup = await Group.findOne();
        if (!testGroup) {
            console.log('❌ No test group found. Please create a group first.');
            return;
        }
        console.log(`Found test group: ${testGroup.name} (ID: ${testGroup._id})`);
        
        // Test sending a group message
        console.log('\n3. Testing group message sending...');
        const groupMessageData = {
            conversationType: 'group',
            conversationId: testGroup._id.toString(),
            content: 'Test group message from mentor'
        };
        
        const groupMessageResponse = await axios.post(`${API_URL}/messages`, groupMessageData, {
            headers: {
                'Authorization': `Bearer ${mentorToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Group message sent successfully');
        console.log('Message ID:', groupMessageResponse.data._id);
        console.log('Message content:', groupMessageResponse.data.content);
        
        // Test getting group messages
        console.log('\n4. Testing group message retrieval...');
        const getGroupMessagesResponse = await axios.get(`${API_URL}/messages/group/${testGroup._id}`, {
            headers: {
                'Authorization': `Bearer ${mentorToken}`
            }
        });
        console.log('✅ Group messages retrieved successfully');
        console.log(`Found ${getGroupMessagesResponse.data.length} messages`);
        
        // Get a test mentee for individual chat
        const testMentee = await Mentee.findOne();
        if (testMentee) {
            console.log(`Found test mentee: ${testMentee.fullName} (ID: ${testMentee._id})`);
            
            // Test sending an individual message
            console.log('\n5. Testing individual message sending...');
            const individualMessageData = {
                conversationType: 'individual',
                conversationId: testMentee._id.toString(),
                content: 'Test individual message from mentor'
            };
            
            const individualMessageResponse = await axios.post(`${API_URL}/messages`, individualMessageData, {
                headers: {
                    'Authorization': `Bearer ${mentorToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Individual message sent successfully');
            console.log('Message ID:', individualMessageResponse.data._id);
            console.log('Message content:', individualMessageResponse.data.content);
            
            // Test getting individual messages
            console.log('\n6. Testing individual message retrieval...');
            const getIndividualMessagesResponse = await axios.get(`${API_URL}/messages/individual/${testMentee._id}`, {
                headers: {
                    'Authorization': `Bearer ${mentorToken}`
                }
            });
            console.log('✅ Individual messages retrieved successfully');
            console.log(`Found ${getIndividualMessagesResponse.data.length} messages`);
        }
        
        // Test validation errors
        console.log('\n7. Testing validation errors...');
        try {
            await axios.post(`${API_URL}/messages`, {
                conversationType: 'invalid',
                conversationId: testGroup._id.toString(),
                content: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${mentorToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (validationError) {
            console.log('✅ Validation error handled correctly:', validationError.response.data.message);
        }
        
        mongoose.disconnect();
        console.log('\n🎉 ALL MESSAGE API TESTS PASSED!');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Full error:', error.response?.data);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Server appears to be down. Please start the server first.');
        }
        
        mongoose.disconnect();
    }
};

testMessageAPI();
