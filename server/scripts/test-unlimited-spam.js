const axios = require('axios');

const testUnlimitedSpam = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING UNLIMITED MESSAGE SPAM ===');
    console.log('Testing that users can send unlimited messages without errors');
    
    try {
        // Step 1: Login
        console.log('\n1. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test rapid message sending (simulate spam)
        console.log('\n2. Testing rapid message sending (20 messages in quick succession)...');
        
        const promises = [];
        const messageCount = 20;
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i <= messageCount; i++) {
            const messagePromise = axios.post(`${API_URL}/messages`, {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: `Spam message ${i} - ${Date.now()}`
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }).then(response => {
                successCount++;
                console.log(`   ✅ Message ${i}: Sent successfully (ID: ${response.data._id})`);
                return { success: true, messageNum: i, id: response.data._id };
            }).catch(error => {
                errorCount++;
                console.error(`   ❌ Message ${i}: Failed - ${error.response?.data?.message || error.message}`);
                return { success: false, messageNum: i, error: error.message };
            });
            
            promises.push(messagePromise);
        }

        // Wait for all messages to complete
        console.log('\n   Waiting for all messages to complete...');
        const results = await Promise.all(promises);
        
        console.log(`\n📊 SPAM TEST RESULTS:`);
        console.log(`   - Total messages attempted: ${messageCount}`);
        console.log(`   - Successful: ${successCount}`);
        console.log(`   - Failed: ${errorCount}`);
        console.log(`   - Success rate: ${((successCount / messageCount) * 100).toFixed(1)}%`);

        if (successCount === messageCount) {
            console.log('🎉 PERFECT! All spam messages sent successfully without errors!');
        } else if (successCount > messageCount * 0.8) {
            console.log('✅ GOOD! Most spam messages sent successfully');
        } else {
            console.log('⚠️  Some messages failed - investigating...');
        }

        // Step 3: Test extreme spam patterns
        console.log('\n3. Testing extreme spam patterns...');
        
        const spamPatterns = [
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Repeated characters
            'SPAM SPAM SPAM SPAM SPAM SPAM', // Repeated words
            'a'.repeat(500), // Long message
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!', // Repeated symbols
            '😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀' // Repeated emojis
        ];

        let patternSuccessCount = 0;
        
        for (let i = 0; i < spamPatterns.length; i++) {
            try {
                const response = await axios.post(`${API_URL}/messages`, {
                    conversationType: 'group',
                    conversationId: '68e3d9506f58e4d10c687c1a',
                    content: spamPatterns[i]
                }, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                
                patternSuccessCount++;
                console.log(`   ✅ Spam pattern ${i + 1}: Sent successfully`);
            } catch (error) {
                console.error(`   ❌ Spam pattern ${i + 1}: Failed - ${error.response?.data?.message || error.message}`);
            }
        }

        console.log(`\n📊 SPAM PATTERN RESULTS:`);
        console.log(`   - Patterns tested: ${spamPatterns.length}`);
        console.log(`   - Successful: ${patternSuccessCount}`);
        console.log(`   - Success rate: ${((patternSuccessCount / spamPatterns.length) * 100).toFixed(1)}%`);

        // Step 4: Test server stability after spam
        console.log('\n4. Testing server stability after spam...');
        try {
            const healthResponse = await axios.get(`${API_URL}/health`);
            console.log('✅ Server is still healthy after spam test');
            
            // Test normal message after spam
            const normalResponse = await axios.post(`${API_URL}/messages`, {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: 'Normal message after spam test'
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Normal messaging still works after spam');
        } catch (error) {
            console.error('❌ Server stability issue after spam:', error.message);
        }

        console.log('\n🎉 UNLIMITED SPAM TEST COMPLETED');
        
        console.log('\n📋 SUMMARY:');
        if (successCount === messageCount && patternSuccessCount === spamPatterns.length) {
            console.log('🎉 PERFECT RESULT: Users can spam unlimited messages without any errors!');
            console.log('✅ No rate limiting');
            console.log('✅ No network errors');
            console.log('✅ No authentication cascade issues');
            console.log('✅ Server remains stable');
        } else {
            console.log('⚠️  Some limitations still exist - check results above');
        }
        
    } catch (error) {
        console.error('\n❌ TESTING FAILED:');
        console.error('Error:', error.message);
    }
};

testUnlimitedSpam();
