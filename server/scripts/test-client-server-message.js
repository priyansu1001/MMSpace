const axios = require('axios');

const testClientServerMessage = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING CLIENT-SERVER MESSAGE COMMUNICATION ===');
    console.log('Simulating exact client request to identify network error');
    
    try {
        // Step 1: Login
        console.log('\n1. Login to get token...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test server health
        console.log('\n2. Testing server health...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('✅ Server is healthy:', healthResponse.data);

        // Step 3: Test message endpoint with different scenarios
        console.log('\n3. Testing message endpoint scenarios...');

        // Scenario A: Valid group message (should work)
        console.log('\n   Scenario A: Valid group message');
        try {
            const validMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a', // Known group ID
                content: 'Test message scenario A'
            };

            const response = await axios.post(`${API_URL}/messages`, validMessage, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('   ✅ Valid group message sent successfully');
            console.log(`      - Status: ${response.status}`);
            console.log(`      - Message ID: ${response.data._id}`);
        } catch (error) {
            console.error('   ❌ Valid group message failed');
            console.error(`      - Error: ${error.code || error.message}`);
            console.error(`      - Status: ${error.response?.status}`);
            console.error(`      - Data: ${JSON.stringify(error.response?.data)}`);
        }

        // Scenario B: Invalid conversation ID (should fail gracefully)
        console.log('\n   Scenario B: Invalid conversation ID');
        try {
            const invalidMessage = {
                conversationType: 'group',
                conversationId: 'invalid_id_123',
                content: 'Test message scenario B'
            };

            await axios.post(`${API_URL}/messages`, invalidMessage, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('   ⚠️  Invalid ID message unexpectedly succeeded');
        } catch (error) {
            console.log('   ✅ Invalid ID properly rejected');
            console.log(`      - Status: ${error.response?.status}`);
            console.log(`      - Message: ${error.response?.data?.message}`);
        }

        // Scenario C: Missing required fields (should fail gracefully)
        console.log('\n   Scenario C: Missing required fields');
        try {
            const incompleteMessage = {
                conversationType: 'group',
                // Missing conversationId and content
            };

            await axios.post(`${API_URL}/messages`, incompleteMessage, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('   ⚠️  Incomplete message unexpectedly succeeded');
        } catch (error) {
            console.log('   ✅ Incomplete message properly rejected');
            console.log(`      - Status: ${error.response?.status}`);
            console.log(`      - Message: ${error.response?.data?.message}`);
        }

        // Scenario D: Test with malformed JSON (should fail gracefully)
        console.log('\n   Scenario D: Malformed request');
        try {
            // Send raw request to test malformed data
            const response = await axios.post(`${API_URL}/messages`, 'invalid json', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('   ⚠️  Malformed request unexpectedly succeeded');
        } catch (error) {
            console.log('   ✅ Malformed request properly rejected');
            console.log(`      - Status: ${error.response?.status}`);
        }

        // Step 4: Test CORS preflight
        console.log('\n4. Testing CORS preflight...');
        try {
            const corsResponse = await axios.options(`${API_URL}/messages`, {
                headers: {
                    'Origin': 'http://localhost:5173',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Authorization, Content-Type'
                }
            });
            console.log('✅ CORS preflight successful');
            console.log(`   - Status: ${corsResponse.status}`);
        } catch (corsError) {
            console.error('❌ CORS preflight failed');
            console.error(`   - Error: ${corsError.message}`);
        }

        console.log('\n🎉 CLIENT-SERVER MESSAGE TESTING COMPLETED');
        
        console.log('\n📋 ANALYSIS:');
        console.log('If all scenarios work here but client shows network error:');
        console.log('1. Check client environment variables (VITE_API_URL)');
        console.log('2. Check if client is running on correct port (5173)');
        console.log('3. Check browser network tab for actual request details');
        console.log('4. Check for browser extensions blocking requests');
        console.log('5. Try in incognito mode to rule out browser cache issues');
        
    } catch (error) {
        console.error('\n❌ TESTING FAILED:');
        console.error('Error:', error.message);
        console.error('This suggests a fundamental server connectivity issue');
    }
};

testClientServerMessage();
