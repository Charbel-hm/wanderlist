const BASE_URL = 'https://wanderlist-kdgg.onrender.com/api';

async function testConnection() {
    console.log(`Testing connection to ${BASE_URL}...`);

    try {
        // 1. Health Check
        console.log('\n--- 1. Health Check ---');
        try {
            const health = await fetch(`${BASE_URL}/health`);
            console.log('Health Check Status:', health.status);
            const data = await health.json();
            console.log('Health Check Data:', data);
        } catch (e) {
            console.error('Health Check Failed:', e.message);
        }

        // 2. Login Test with Known User
        console.log('\n--- 2. Login Test ---');
        // valid credentials from previous run (if they still exist) or generic
        // If we don't have valid ones, we register one

        const testUser = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'Password123!',
        };

        // Register first to ensure we have a valid user
        console.log('Registering new user for test...');
        try {
            const reg = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });

            console.log('Registration Status:', reg.status);
            const regText = await reg.text();
            console.log('Registration Body:', regText);

            if (reg.ok) {
                console.log('Attempting Login...');
                const login = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUser.email,
                        password: testUser.password
                    })
                });
                console.log('Login Status:', login.status);
                const loginText = await login.text();
                console.log('Login Body:', loginText);
            }

        } catch (e) {
            console.error('Auth Test Failed:', e.message);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
