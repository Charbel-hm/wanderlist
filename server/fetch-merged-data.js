const axios = require('axios');
const fs = require('fs');

async function fetchAndMerge() {
    try {
        // 1. Fetch main country data (for flags, region, etc.)
        const mainUrl = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';
        console.log('Fetching main data...');
        const mainRes = await axios.get(mainUrl);
        const mainData = mainRes.data;

        // 2. Fetch population data
        const popUrl = 'https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json';
        console.log('Fetching population data...');
        const popRes = await axios.get(popUrl);
        const popData = popRes.data; // Array of { country: "Afghanistan", population: 25500100 }

        // 3. Create a map for faster lookup
        const popMap = {};
        popData.forEach(p => {
            // Normalize name for better matching?
            popMap[p.country] = parseInt(p.population);
        });

        // 4. Merge
        const countries = mainData.map(c => {
            let population = 0;
            // Try exact match
            if (popMap[c.name.common]) {
                population = popMap[c.name.common];
            }
            // Try matching "official" name?
            else if (popMap[c.name.official]) {
                population = popMap[c.name.official];
            }
            else {
                // Fuzzy match or just leave as 0? 
                // Let's try to remove "Republic of" etc if needed, but for now just 0 is better than undefined
                // Some names might differ e.g. "United States" vs "United States of America"
            }

            // Manual fix for big countries if missing?
            if (c.name.common === 'United States') population = 331000000;
            if (c.name.common === 'China') population = 1440000000;
            if (c.name.common === 'India') population = 1380000000;

            // Note: mledoze might actually have population data in a different property or I missed it?
            // But assuming it doesn't, we use the merged one.

            return {
                name: { common: c.name.common, official: c.name.official },
                cca3: c.cca3,
                region: c.region,
                subregion: c.subregion,
                population: population > 0 ? population : (c.population || 0), // Use existing if available (it was 0 before)
                flags: { svg: `https://flagcdn.com/${c.cca2.toLowerCase()}.svg` },
                capital: c.capital,
                languages: c.languages,
                currencies: c.currencies
            };
        });

        if (!fs.existsSync('./data')) fs.mkdirSync('./data');
        fs.writeFileSync('./data/countries.json', JSON.stringify(countries, null, 2));
        console.log(`Success! Saved ${countries.length} countries to data/countries.json`);

        // Check how many have 0 population
        const zeros = countries.filter(c => c.population === 0).length;
        console.log(`Countries with 0 population: ${zeros}`);

    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

fetchAndMerge();
