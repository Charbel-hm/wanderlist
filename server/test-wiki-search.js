const axios = require('axios');

async function getSmartLandmarks(country) {
    try {
        const url = 'https://en.wikipedia.org/w/api.php';
        console.log(`Searching for landmarks in ${country}...`);

        // Strategy: Search for pages related to "Tourism in [Country]" or "[Country] landmarks"
        // and fetch the main image (pageimage) of the *results*.
        // This avoids getting random images *inside* a page and instead gets the "hero" image of relevant topics.

        const searchQuery = `tourist attractions in ${country}`; // or "landmarks of"

        const res = await axios.get(url, {
            params: {
                action: 'query',
                generator: 'search',
                gsrsearch: searchQuery,
                gsrnamespace: 0, // Articles only
                gsrlimit: 15, // Get top 15 results
                prop: 'pageimages|pageterms',
                piprop: 'original', // Get original full-res url
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        const pages = res.data.query.pages;
        if (!pages) {
            console.log("No results found.");
            return;
        }

        const results = Object.values(pages)
            .filter(p => p.original) // Must have an image
            .map(p => ({
                title: p.title,
                description: p.terms?.description?.[0] || '',
                imageUrl: p.original.source
            }));

        console.log(`Found ${results.length} landmarks with images:`);
        results.forEach(r => {
            console.log(`- ${r.title} (${r.description}): ${r.imageUrl}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

getSmartLandmarks('France');
getSmartLandmarks('Lebanon');
