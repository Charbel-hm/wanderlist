const axios = require('axios');

async function getWikiImage(pageTitle) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;
        console.log(`Fetching from: ${url}`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        if (res.data.originalimage) {
            console.log('Original Image:', res.data.originalimage.source);
        } else {
            console.log('No image found.');
        }
    } catch (err) {
        console.log(`Error fetching ${pageTitle}:`, err.message);
    }
}

getWikiImage('Tourism_in_Brazil');
getWikiImage('Tourism_in_France');
getWikiImage('Tourism_in_Japan');
