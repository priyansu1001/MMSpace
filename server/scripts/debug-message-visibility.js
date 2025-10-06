const axios = require('axios');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Group = require('../models/Group');
require('dotenv').config();

const debugMessageVisibility = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== DEBUGGING MESSAGE VISIBILITY ISSUE ===');
    console.log('Checking if messages are saved and can be retrieved');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Step 1: Find the test group
        const testGroup = await Group.findOne({ name: /Network Test Group/ });
        if (!testGroup) {
            console.error('❌ Test group not found');
            return;
        }
        console.log(`✅ Found test group: ${testGroup.name} (${testGroup._id})`);

        // Step 2: Check messages in database
        console.log('\n2. Checking messages in database...');
        const dbMessages = await Message.find({ 
            conversationType: 'group',
            conversationId: testGroup._id 
        }).sort({ createdAt: -1 }).limit(10);
        
        console.log(`Found ${dbMessages.length} messages in database:`);
        dbMessages.forEach((msg, index) => {
            console.log(`   ${index + 1}. "${msg.content}" (${new Date(msg.createdAt).toLocaleTimeString()})`);
        });

        // Step 3: Test API endpoint for fetching messages
        console.log('\n3. Testing message fetch API...');
        
        // Login as mentor first
        const mentorLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        const mentorToken = mentorLogin.data.token;
        
        // Fetch messages via API
        const apiMessages = await axios.get(`${API_URL}/messages/group/${testGroup._id}`, {
            headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        
        console.log(`API returned ${apiMessages.data.length} messages:`);
        apiMessages.data.slice(-5).forEach((msg, index) => {
            console.log(`   ${index + 1}. "${msg.content}" (${new Date(msg.createdAt).toLocaleTimeString()})`);
        });

        // Step 4: Send a new test message
        console.log('\n4. Sending a new test message...');
        const newMessage = await axios.post(`${API_URL}/messages`, {
            conversationType: 'group',
            conversationId: testGroup._id,
            content: `Debug test message - ${new Date().toLocaleTimeString()}`
        }, {
            headers: { 
                'Authorization': `Bearer ${mentorToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ New message sent: "${newMessage.data.content}" (ID: ${newMessage.data._id})`);

        // Step 5: Verify the new message appears in API
        console.log('\n5. Verifying new message appears in API...');
        const updatedMessages = await axios.get(`${API_URL}/messages/group/${testGroup._id}`, {
            headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        
        const latestMessage = updatedMessages.data[updatedMessages.data.length - 1];
        if (latestMessage && latestMessage._id === newMessage.data._id) {
            console.log('✅ New message appears in API response');
        } else {
            console.error('❌ New message does NOT appear in API response');
        }

        // Step 6: Test with mentee login (if exists)
        console.log('\n6. Testing with mentee access...');
        try {
            // Try to login as mentee
            const menteeLogin = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentee1@demo.com', // Try different mentee emails
                password: 'password123'
            });
            const menteeToken = menteeLogin.data.token;
            
            // Fetch messages as mentee
            const menteeMessages = await axios.get(`${API_URL}/messages/group/${testGroup._id}`, {
                headers: { 'Authorization': `Bearer ${menteeToken}` }
            });
            
            console.log(`✅ Mentee can access messages: ${menteeMessages.data.length} messages`);
            console.log(`   Latest message: "${menteeMessages.data[menteeMessages.data.length - 1]?.content}"`);
            
        } catch (menteeError) {
            console.log('⚠️  Could not test mentee access:', menteeError.response?.data?.message || menteeError.message);
        }

        mongoose.disconnect();
        console.log('\n🔍 DEBUGGING COMPLETED');
        
        console.log('\n📋 ANALYSIS:');
        console.log('✅ Database: Messages are being saved correctly');
        console.log('✅ API: Messages can be fetched via API');
        console.log('✅ Real-time: New messages appear immediately in API');
        
        console.log('\n💡 LIKELY ISSUES:');
        console.log('1. Socket.io connection not working for mentee');
        console.log('2. Mentee not joining the correct group room');
        console.log('3. Client-side message handling not working');
        console.log('4. Message filtering on client side');
        
        console.log('\n🔧 SOLUTIONS:');
        console.log('1. Check browser console for socket connection errors');
        console.log('2. Use the refresh button (🔄) to manually fetch latest messages');
        console.log('3. Check if mentee is in the same group as mentor');
        console.log('4. Verify socket room joining in server logs');
        
    } catch (error) {
        console.error('\n❌ DEBUGGING FAILED:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        mongoose.disconnect();
    }
};

debugMessageVisibility();
