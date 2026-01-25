const axios = require('axios');
const fs = require('fs');

async function fetchAndSave() {
    try {
        const backupUrl = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';
        console.log(`Fetching from backup source: ${backupUrl}`);
        const res = await axios.get(backupUrl);

        // Transform to match our app's expected structure
        const countries = res.data.map(c => ({
            name: { common: c.name.common, official: c.name.official },
            cca3: c.cca3,
            region: c.region,
            subregion: c.subregion,
            population: c.population || 0,
            flags: { svg: `https://flagcdn.com/${c.cca2.toLowerCase()}.svg` },
            capital: c.capital,
            languages: c.languages,
            currencies: c.currencies
        }));

        if (!fs.existsSync('./data')) fs.mkdirSync('./data');
        fs.writeFileSync('./data/countries.json', JSON.stringify(countries, null, 2));
        console.log(`Success! Saved ${countries.length} countries to data/countries.json`);
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

fetchAndSave();
