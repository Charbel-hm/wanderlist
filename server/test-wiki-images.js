const axios = require('axios');

async function getWikiImages(countryName) {
    try {
        const url = 'https://en.wikipedia.org/w/api.php';
        console.log(`Fetching images for ${countryName}...`);

        const res = await axios.get(url, {
            params: {
                action: 'query',
                titles: countryName,
                prop: 'images',
                format: 'json',
                imlimit: 20,
                redirects: 1,
                origin: '*'
            },
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        const pages = res.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const images = pages[pageId].images;

        if (images) {
            console.log(`Found ${images.length} image references.`);
            // Now we need to get URLs for these files
            const titles = images.map(img => img.title).join('|');

            const urlRes = await axios.get(url, {
                params: {
                    action: 'query',
                    titles: titles,
                    prop: 'imageinfo',
                    iiprop: 'url',
                    format: 'json',
                    origin: '*'
                },
                headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
            });

            const urlPages = urlRes.data.query.pages;
            Object.values(urlPages).forEach(p => {
                if (p.imageinfo && p.imageinfo[0]) {
                    console.log(p.imageinfo[0].url);
                }
            });

        } else {
            console.log('No images found.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

getWikiImages('Brazil');
