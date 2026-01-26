const axios = require('axios');

const register = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_' + Date.now(),
            password: 'password123'
        });
        console.log('✅ Registration Success:', res.data);
    } catch (err) {
        console.error('❌ Registration Failed:', err.response ? err.response.data : err.message);
    }
};

register();
