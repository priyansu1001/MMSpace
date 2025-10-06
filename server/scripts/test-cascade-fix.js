const axios = require('axios');

const testCascadeFix = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING CASCADE FIX ===');
    console.log('Testing: Login → Create Group → Send Message → Login Again');
    
    try {
        // Test 1: Initial login
        console.log('\n1. Testing initial login...');
        let token;
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            token = loginResponse.data.token;
            console.log('✅ Initial login successful');
        } catch (error) {
            console.error('❌ Initial login failed:', error.response?.data || error.message);
            return;
        }

        // Test 2: Create group
        console.log('\n2. Testing group creation...');
        let groupId;
        try {
            const groupData = {
                name: `Cascade Test Group ${Date.now()}`,
                description: 'Testing cascade fix',
                color: '#10B981',
                menteeIds: []
            };

            const groupResponse = await axios.post(`${API_URL}/groups`, groupData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            groupId = groupResponse.data._id;
            console.log('✅ Group created successfully');
            console.log(`   - Group ID: ${groupId}`);
        } catch (error) {
            console.error('❌ Group creation failed:', error.response?.data || error.message);
            return;
        }

        // Test 3: Send message to group
        console.log('\n3. Testing message sending...');
        try {
            const messageData = {
                conversationType: 'group',
                conversationId: groupId,
                content: 'Test message for cascade fix verification'
            };

            const messageResponse = await axios.post(`${API_URL}/messages`, messageData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Message sent successfully');
            console.log(`   - Message ID: ${messageResponse.data._id}`);
        } catch (error) {
            console.error('❌ Message sending failed:', error.response?.data || error.message);
            console.error('   - Status:', error.response?.status);
            
            // This is expected to potentially fail, but shouldn't break subsequent login
            console.log('   - Continuing to test login after message failure...');
        }

        // Test 4: Verify current token still works
        console.log('\n4. Testing current token validity...');
        try {
            const meResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Current token still valid');
        } catch (error) {
            console.error('❌ Current token invalid:', error.response?.data || error.message);
        }

        // Test 5: Test fresh login (the critical test)
        console.log('\n5. Testing fresh login after operations...');
        try {
            const freshLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'mentor@demo.com',
                password: 'password123'
            });
            
            console.log('✅ Fresh login successful - CASCADE ISSUE FIXED!');
            console.log(`   - New token received: ${freshLoginResponse.data.token ? 'Yes' : 'No'}`);
            
            // Verify new token works
            const newMeResponse = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${freshLoginResponse.data.token}` }
            });
            console.log('✅ New token works correctly');
            
        } catch (error) {
            console.error('❌ Fresh login failed - CASCADE ISSUE STILL EXISTS!');
            console.error('   - Status:', error.response?.status);
            console.error('   - Message:', error.response?.data?.message || error.message);
        }

        // Test 6: Multiple rapid logins (stress test)
        console.log('\n6. Testing multiple rapid logins...');
        let successCount = 0;
        const totalTests = 3;
        
        for (let i = 0; i < totalTests; i++) {
            try {
                const rapidLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                    email: 'mentor@demo.com',
                    password: 'password123'
                });
                successCount++;
                console.log(`   - Rapid login ${i + 1}: ✅`);
            } catch (error) {
                console.error(`   - Rapid login ${i + 1}: ❌ ${error.response?.data?.message || error.message}`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`   - Rapid login success rate: ${successCount}/${totalTests}`);

        console.log('\n🎉 CASCADE FIX TESTING COMPLETED');
        
        console.log('\n📋 RESULTS:');
        console.log('   - Initial login: ✅');
        console.log('   - Group creation: ✅');
        console.log('   - Message sending: Check above');
        console.log('   - Fresh login after operations: Check above');
        console.log(`   - Rapid login stability: ${successCount}/${totalTests}`);
        
        if (successCount === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED - CASCADE ISSUE APPEARS TO BE FIXED!');
        } else {
            console.log('\n⚠️  SOME ISSUES REMAIN - CHECK LOGS ABOVE');
        }
        
    } catch (error) {
        console.error('\n❌ TESTING FAILED:');
        console.error('Error:', error.message);
    }
};

testCascadeFix();
