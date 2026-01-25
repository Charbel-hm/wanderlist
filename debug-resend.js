const axios = require('axios');

const testResend = async () => {
    const url = 'https://wanderlist-kdgg.onrender.com/api/auth/resend-verification';
    console.log('Testing endpoint:', url);

    try {
        const res = await axios.post(url, { email: 'probe@test.com' });
        console.log('SUCCESS:', res.status, res.data);
    } catch (err) {
        if (err.response) {
            console.log('ERROR STATUS:', err.response.status); // 404 = Not Deployed, 404 (User not found) = Deployed
            console.log('ERROR DATA:', err.response.data);
        } else {
            console.log('ERROR:', err.message);
        }
    }
};

testResend();
