const axios = require('axios');

async function getWikiImage(countryName) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`;
        console.log(`Fetching from: ${url}`);
        const res = await axios.get(url);

        if (res.data.originalimage) {
            console.log('Original Image:', res.data.originalimage.source);
        } else if (res.data.thumbnail) {
            console.log('Thumbnail:', res.data.thumbnail.source);
        } else {
            console.log('No image found.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

getWikiImage('Brazil');
getWikiImage('France');
getWikiImage('United States');
