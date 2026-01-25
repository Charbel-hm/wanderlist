const axios = require('axios');

const testRegister = async () => {
    const url = 'https://wanderlist-kdgg.onrender.com/api/auth/register';
    // Use a random user to ensure we don't hit "User already exists" unless logic is broken
    const uniqueUser = 'debug_' + Math.floor(Math.random() * 100000);
    const payload = {
        username: uniqueUser,
        email: `${uniqueUser}@test.com`,
        password: 'password123'
    };

    console.log('Testing Registration against:', url);
    console.log('Payload:', payload);
    console.log('Waiting for response...');

    const start = Date.now();
    try {
        const res = await axios.post(url, payload, { timeout: 15000 }); // 15s timeout
        const duration = (Date.now() - start) / 1000;
        console.log(`SUCCESS (${duration}s):`, res.status);
        console.log('Headers:', res.headers);
        console.log('Body:', res.data);
    } catch (err) {
        const duration = (Date.now() - start) / 1000;
        console.log(`ERROR (${duration}s):`, err.message);
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
        } else if (err.code === 'ECONNABORTED') {
            console.log('This is a TIMEOUT. The server took too long.');
        }
    }
};

testRegister();
