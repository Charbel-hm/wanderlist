const axios = require('axios');

async function testWikivoyage(country) {
    try {
        console.log(`Testing Wikivoyage for: ${country}`);
        const url = 'https://en.wikivoyage.org/w/api.php';

        // 1. Get images linked directly on the Country's Wikivoyage page
        // Generously fetch images from the page
        const res = await axios.get(url, {
            params: {
                action: 'query',
                generator: 'images',
                titles: country,
                gimlimit: 50,
                prop: 'imageptrills', // Get URLs
                prop: 'pageimages|pageterms',
                piprop: 'original',
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': 'WanderlistDev/1.0 (test@example.com)' }
        });

        const pages = res.data.query?.pages;
        if (!pages) {
            console.log('No pages found');
            return;
        }

        const results = Object.values(pages)
            .filter(p => p.original && p.original.source)
            .map(p => ({
                title: p.title,
                url: p.original.source
            }));

        console.log(`Found ${results.length} images:`);
        results.forEach(r => console.log(`- ${r.title}: ${r.url}`));

    } catch (err) {
        console.error(err);
    }
}

testWikivoyage('Brazil');
testWikivoyage('France');
