const axios = require('axios');

const testLogin = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING LOGIN API ===');
    
    try {
        // Test server health first
        console.log('\n1. Testing server health...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('✅ Server is healthy:', healthResponse.data);
        
        // Test login with mentor credentials
        console.log('\n2. Testing mentor login...');
        const mentorLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        console.log('✅ Mentor login successful');
        console.log('Token received:', mentorLoginResponse.data.token ? 'Yes' : 'No');
        console.log('User data:', mentorLoginResponse.data.user);
        
        // Test /auth/me with mentor token
        console.log('\n3. Testing /auth/me with mentor token...');
        const mentorMeResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${mentorLoginResponse.data.token}`
            }
        });
        console.log('✅ Mentor profile fetch successful');
        console.log('Profile data:', mentorMeResponse.data);
        
        // Test login with mentee credentials
        console.log('\n4. Testing mentee login...');
        const menteeLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'met1@demo.com',
            password: 'password123'
        });
        console.log('✅ Mentee login successful');
        console.log('Token received:', menteeLoginResponse.data.token ? 'Yes' : 'No');
        console.log('User data:', menteeLoginResponse.data.user);
        
        // Test /auth/me with mentee token
        console.log('\n5. Testing /auth/me with mentee token...');
        const menteeMeResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${menteeLoginResponse.data.token}`
            }
        });
        console.log('✅ Mentee profile fetch successful');
        console.log('Profile data:', menteeMeResponse.data);
        
        console.log('\n🎉 ALL TESTS PASSED! Login functionality is working correctly.');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Full error:', error.response?.data);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Server appears to be down. Please start the server first.');
        }
    }
};

testLogin();
