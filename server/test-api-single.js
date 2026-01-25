const axios = require('axios');

async function testApi() {
    try {
        console.log('Fetching France...');
        const res = await axios.get('https://restcountries.com/v3.1/name/france');
        console.log(`Success! Fetched France.`);
    } catch (err) {
        console.error('API Failed:', err.message);
        if (err.response) console.error('Status:', err.response.status);
    }
}

testApi();
