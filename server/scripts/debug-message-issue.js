const axios = require('axios');

const debugMessageIssue = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== DEBUGGING MESSAGE SENDING ISSUE ===');
    
    try {
        // Test 1: Login as mentor
        console.log('\n1. Logging in as mentor...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        
        if (!loginResponse.data.token) {
            console.error('❌ No token received from login');
            return;
        }
        
        console.log('✅ Login successful, token received');
        const token = loginResponse.data.token;
        
        // Test 2: Verify token works with /auth/me
        console.log('\n2. Verifying token with /auth/me...');
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Token verification successful');
        console.log('User:', meResponse.data.user.email, 'Role:', meResponse.data.user.role);
        
        // Test 3: Try to send a simple message (this is what's failing)
        console.log('\n3. Testing message sending with exact client data...');
        
        // Simulate the exact data that would come from the client
        const messageData = {
            conversationType: 'group',
            conversationId: '68e3d9506f58e4d10c687c1a', // Use the test group ID we created
            content: 'Test message from debugging script'
        };
        
        console.log('Sending message with data:', messageData);
        console.log('Using token:', token.substring(0, 20) + '...');
        
        const messageResponse = await axios.post(`${API_URL}/messages`, messageData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Message sent successfully!');
        console.log('Response:', messageResponse.data);
        
        // Test 4: Try with individual conversation
        console.log('\n4. Testing individual message...');
        const individualMessageData = {
            conversationType: 'individual',
            conversationId: '68e3d3597989b8b599f33683', // Use a mentee ID
            content: 'Test individual message'
        };
        
        const individualResponse = await axios.post(`${API_URL}/messages`, individualMessageData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Individual message sent successfully!');
        console.log('Response:', individualResponse.data);
        
        console.log('\n🎉 ALL TESTS PASSED - MESSAGE SENDING IS WORKING!');
        console.log('\n💡 If the client is still showing "Failed to send message", the issue might be:');
        console.log('   1. Client-side token is invalid or expired');
        console.log('   2. Network connectivity issues');
        console.log('   3. CORS issues');
        console.log('   4. Client is sending malformed data');
        console.log('\n📝 Check the browser console and network tab for more details.');
        
    } catch (error) {
        console.error('\n❌ ERROR FOUND:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Full response:', error.response?.data);
        
        if (error.response?.status === 400) {
            console.error('\n💡 This is a validation error. Check the request data format.');
        } else if (error.response?.status === 401) {
            console.error('\n💡 This is an authentication error. Check the token.');
        } else if (error.response?.status === 500) {
            console.error('\n💡 This is a server error. Check the server logs.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Server is not running. Start the server first.');
        }
    }
};

debugMessageIssue();
