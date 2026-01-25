const axios = require('axios');

async function testApi() {
    try {
        const start = Date.now();
        console.log('Fetching countries...');
        const res = await axios.get('https://restcountries.com/v3.1/all');
        console.log(`Success! Fetched ${res.data.length} countries in ${Date.now() - start}ms`);
    } catch (err) {
        console.error('API Failed:', err.message);
    }
}

testApi();
