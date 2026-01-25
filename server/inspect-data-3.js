const axios = require('axios');

async function inspectKeys() {
    try {
        const backupUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json';
        console.log(`Fetching from dr5hn source...`);
        const res = await axios.get(backupUrl);

        if (res.data && res.data.length > 0) {
            const country = res.data.find(c => c.name === 'France') || res.data[0];
            console.log('Sample Country Keys:', Object.keys(country));
            // Note: this DB might use 'name' instead of 'name.common'
            console.log('Population value:', country.population);
            console.log('Name:', country.name);
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

inspectKeys();
