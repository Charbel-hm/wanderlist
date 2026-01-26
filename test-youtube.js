const axios = require('axios');

const testYoutube = async () => {
    try {
        console.log('Testing YouTube Endpoint for France...');
        const res = await axios.get('http://localhost:5000/api/youtube/video/France');
        console.log('✅ Success:', res.data);
    } catch (err) {
        console.error('❌ Failed:', err.response ? err.response.data : err.message);
    }
};

testYoutube();
