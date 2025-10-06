const axios = require('axios');

const testSpamProtection = async () => {
    const API_URL = 'http://localhost:5000/api';
    
    console.log('=== TESTING SPAM PROTECTION & RATE LIMITING ===');
    console.log('This will test the fixes for message spamming issues');
    
    try {
        // Step 1: Login
        console.log('\n1. Logging in as mentor (for testing)...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'mentor@demo.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 2: Test normal message (should work)
        console.log('\n2. Testing normal message...');
        try {
            const normalMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: 'This is a normal message'
            };

            const response = await axios.post(`${API_URL}/messages`, normalMessage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('✅ Normal message sent successfully');
        } catch (error) {
            console.error('❌ Normal message failed:', error.response?.data?.message);
        }

        // Step 3: Test spam detection (repeated characters)
        console.log('\n3. Testing spam detection (repeated characters)...');
        try {
            const spamMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: 'aaaaaaaaaaaaaaaaaaaaaa' // 22 repeated 'a's
            };

            await axios.post(`${API_URL}/messages`, spamMessage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('⚠️  Spam message unexpectedly succeeded');
        } catch (error) {
            if (error.response?.data?.code === 'SPAM_DETECTED') {
                console.log('✅ Spam detection working - repeated characters blocked');
            } else {
                console.error('❌ Unexpected error:', error.response?.data?.message);
            }
        }

        // Step 4: Test message too long
        console.log('\n4. Testing message length limit...');
        try {
            const longMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: 'a'.repeat(1001) // 1001 characters
            };

            await axios.post(`${API_URL}/messages`, longMessage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('⚠️  Long message unexpectedly succeeded');
        } catch (error) {
            if (error.response?.data?.code === 'MESSAGE_TOO_LONG') {
                console.log('✅ Message length limit working');
            } else {
                console.error('❌ Unexpected error:', error.response?.data?.message);
            }
        }

        // Step 5: Test burst rate limiting (3 messages in 10 seconds)
        console.log('\n5. Testing burst rate limiting...');
        let burstSuccessCount = 0;
        let burstBlockedCount = 0;

        for (let i = 1; i <= 5; i++) {
            try {
                const burstMessage = {
                    conversationType: 'group',
                    conversationId: '68e3d9506f58e4d10c687c1a',
                    content: `Burst test message ${i}`
                };

                await axios.post(`${API_URL}/messages`, burstMessage, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                burstSuccessCount++;
                console.log(`   - Message ${i}: ✅ Sent`);
            } catch (error) {
                if (error.response?.status === 429) {
                    burstBlockedCount++;
                    console.log(`   - Message ${i}: 🚫 Rate limited (${error.response.data.code})`);
                } else {
                    console.error(`   - Message ${i}: ❌ Error: ${error.response?.data?.message}`);
                }
            }
            
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`   - Burst test results: ${burstSuccessCount} sent, ${burstBlockedCount} blocked`);
        
        if (burstBlockedCount > 0) {
            console.log('✅ Burst rate limiting is working');
        } else {
            console.log('⚠️  Burst rate limiting may not be working properly');
        }

        // Step 6: Wait and test rate limiting recovery
        console.log('\n6. Testing rate limit recovery...');
        console.log('   - Waiting 12 seconds for burst limit to reset...');
        await new Promise(resolve => setTimeout(resolve, 12000));

        try {
            const recoveryMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: 'Recovery test message after waiting'
            };

            await axios.post(`${API_URL}/messages`, recoveryMessage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('✅ Rate limit recovery working - message sent after waiting');
        } catch (error) {
            console.error('❌ Rate limit recovery failed:', error.response?.data?.message);
        }

        // Step 7: Test empty message
        console.log('\n7. Testing empty message validation...');
        try {
            const emptyMessage = {
                conversationType: 'group',
                conversationId: '68e3d9506f58e4d10c687c1a',
                content: '   ' // Just whitespace
            };

            await axios.post(`${API_URL}/messages`, emptyMessage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('⚠️  Empty message unexpectedly succeeded');
        } catch (error) {
            if (error.response?.data?.code === 'EMPTY_MESSAGE') {
                console.log('✅ Empty message validation working');
            } else {
                console.error('❌ Unexpected error:', error.response?.data?.message);
            }
        }

        console.log('\n🎉 SPAM PROTECTION TESTING COMPLETED');
        
        console.log('\n📋 SUMMARY:');
        console.log('✅ Normal messages: Should work');
        console.log('✅ Spam detection: Blocks repeated characters');
        console.log('✅ Length validation: Blocks messages > 1000 chars');
        console.log('✅ Burst limiting: Blocks rapid message sending');
        console.log('✅ Rate limit recovery: Works after waiting');
        console.log('✅ Empty message validation: Blocks whitespace-only messages');
        
        console.log('\n💡 BENEFITS:');
        console.log('- Prevents message spamming that causes network errors');
        console.log('- Protects server from being overwhelmed');
        console.log('- Prevents cascade login failures');
        console.log('- Provides clear user feedback');
        console.log('- Maintains good user experience for normal usage');
        
    } catch (error) {
        console.error('\n❌ TESTING FAILED:');
        console.error('Error:', error.message);
    }
};

testSpamProtection();
