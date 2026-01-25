const axios = require('axios');

async function inspectKeys() {
    try {
        const backupUrl = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';
        console.log(`Fetching from backup source...`);
        const res = await axios.get(backupUrl);

        if (res.data && res.data.length > 0) {
            const country = res.data.find(c => c.name.common === 'France') || res.data[0];
            console.log('Sample Country Keys:', Object.keys(country));
            console.log('Population value:', country.population);
            // data might be nested?
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

inspectKeys();
