// Quick API test script
const testAPI = async () => {
    try {
        console.log('Testing backend endpoints...\n');

        // Test 1: Health check
        const healthRes = await fetch('http://localhost:3000/health');
        const health = await healthRes.json();
        console.log('✅ Health:', health);

        // Test 2: Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '9998887771',
                password: 'crg123',
                location: { latitude: 12.9716, longitude: 77.5946 }
            })
        });
        const loginData = await loginRes.json();
        console.log('\n✅ Login response:', loginData);

        if (loginData.token) {
            // Test 3: Get Account (with auth)
            const accountRes = await fetch('http://localhost:3000/api/account', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            const accountData = await accountRes.json();
            console.log('\n✅ Account data:', accountData);

            // Test 4: Get Transactions (with auth)
            const txnRes = await fetch('http://localhost:3000/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            const txnData = await txnRes.json();
            console.log('\n✅ Transactions:', txnData.length, 'transactions loaded');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testAPI();
