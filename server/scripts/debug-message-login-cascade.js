const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Mentee = require('../models/Mentee');
const Group = require('../models/Group');
const Message = require('../models/Message');
require('dotenv').config();

const debugMessageLoginCascade = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== DEBUGGING MESSAGE-LOGIN CASCADE ISSUE ===');
    console.log('Reproducing: Create group → Add mentee → Send message → Logout → Login fails');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Step 1: Login as mentor
        console.log('\n1. Initial mentor login...');
        let mentorToken;
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            mentorToken = loginResponse.data.token;
            console.log('✅ Initial login successful');
        } catch (error) {
            console.error('❌ Initial login failed:', error.response?.data || error.message);
            return;
        }

        // Step 2: Get mentee for adding to group
        console.log('\n2. Finding available mentee...');
        const mentee = await Mentee.findOne();
        if (!mentee) {
            console.error('❌ No mentee found in database');
            return;
        }
        console.log(`✅ Found mentee: ${mentee.fullName} (${mentee._id})`);

        // Step 3: Create a new group with the mentee
        console.log('\n3. Creating group with mentee...');
        let newGroup;
        try {
            const groupData = {
                name: `Test Message Group ${Date.now()}`,
                description: 'Group for testing message cascade issue',
                color: '#10B981',
                menteeIds: [mentee._id.toString()]
            };

            const groupResponse = await axios.post(`${API_URL}/groups`, groupData, {
                headers: { 
                    'Authorization': `Bearer ${mentorToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            newGroup = groupResponse.data;
            console.log('✅ Group created successfully');
            console.log(`   - Group ID: ${newGroup._id}`);
            console.log(`   - Group name: ${newGroup.name}`);
            console.log(`   - Mentees: ${newGroup.menteeIds?.length || 0}`);
        } catch (error) {
            console.error('❌ Group creation failed:', error.response?.data || error.message);
            return;
        }

        // Step 4: Try to send a message to the group
        console.log('\n4. Attempting to send message to group...');
        try {
            const messageData = {
                conversationType: 'group',
                conversationId: newGroup._id,
                content: 'Test message that might cause cascade failure'
            };

            console.log('Message data:', messageData);
            console.log('Using token (first 20 chars):', mentorToken.substring(0, 20));

            const messageResponse = await axios.post(`${API_URL}/messages`, messageData, {
                headers: {
                    'Authorization': `Bearer ${mentorToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Message sent successfully');
            console.log(`   - Message ID: ${messageResponse.data._id}`);
            console.log(`   - Content: ${messageResponse.data.content}`);
        } catch (messageError) {
            console.error('❌ Message sending failed:', messageError.response?.data || messageError.message);
            console.error('   - Status:', messageError.response?.status);
            console.error('   - Headers sent:', messageError.config?.headers);
            
            // Continue to test login even if message fails
            console.log('\n⚠️  Message failed, but continuing to test login...');
        }

        // Step 5: Test if current token still works
        console.log('\n5. Testing current token validity...');
        try {
            const meResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${mentorToken}` }
            });
            console.log('✅ Current token still valid');
            console.log(`   - User: ${meResponse.data.user.email}`);
        } catch (tokenError) {
            console.error('❌ Current token invalid:', tokenError.response?.data || tokenError.message);
        }

        // Step 6: Simulate logout and login again
        console.log('\n6. Testing fresh login (simulating logout/login)...');
        try {
            const freshLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            
            console.log('✅ Fresh login successful');
            console.log(`   - New token received: ${freshLoginResponse.data.token ? 'Yes' : 'No'}`);
            
            // Test the new token
            const newMeResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${freshLoginResponse.data.token}` }
            });
            console.log('✅ New token works correctly');
            
        } catch (freshLoginError) {
            console.error('❌ Fresh login failed:', freshLoginError.response?.data || freshLoginError.message);
            console.error('   - Status:', freshLoginError.response?.status);
            console.error('   - This is the CASCADE ISSUE!');
        }

        // Step 7: Check database state
        console.log('\n7. Checking database state...');
        const mentorUser = await User.findOne({ email: 'mentor@demo.com' });
        console.log(`   - Mentor user active: ${mentorUser?.isActive}`);
        console.log(`   - Last login: ${mentorUser?.lastLogin}`);
        
        const mentorProfile = await Mentor.findOne({ userId: mentorUser._id });
        console.log(`   - Mentor profile exists: ${mentorProfile ? 'Yes' : 'No'}`);
        
        const messageCount = await Message.countDocuments({ conversationType: 'group', conversationId: newGroup._id });
        console.log(`   - Messages in group: ${messageCount}`);

        // Step 8: Check for any database locks or connection issues
        console.log('\n8. Checking database connection health...');
        const dbState = mongoose.connection.readyState;
        const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        console.log(`   - Database state: ${stateNames[dbState] || 'unknown'}`);

        mongoose.disconnect();
        console.log('\n🔍 DEBUGGING COMPLETED');
        
        console.log('\n📋 ANALYSIS:');
        console.log('   - If message sending failed but login works: Message-specific issue');
        console.log('   - If both message and subsequent login fail: Authentication cascade issue');
        console.log('   - If database state is not "connected": Database connection issue');
        console.log('   - Check server logs for detailed error information');
        
    } catch (error) {
        console.error('\n❌ DEBUGGING FAILED:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        mongoose.disconnect();
    }
};

debugMessageLoginCascade();
