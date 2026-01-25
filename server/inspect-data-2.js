const axios = require('axios');

async function inspectKeys() {
    try {
        // Trying the root file instead of dist
        const backupUrl = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';
        console.log(`Fetching from backup source...`);
        const res = await axios.get(backupUrl);

        if (res.data && res.data.length > 0) {
            const country = res.data.find(c => c.name.common === 'France') || res.data[0];
            console.log('Sample Country Keys:', Object.keys(country));
            // Check deeply if population is not at top level?
            // But search said it is.
            // Let's print the whole object if it's small, otherwise just population
            console.log('Population value:', country.population);
        }
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

inspectKeys();
