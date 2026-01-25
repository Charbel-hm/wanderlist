const axios = require('axios');

async function getWikiData(country) {
    try {
        // MediaWiki API
        const url = 'https://en.wikipedia.org/w/api.php';
        console.log(`Fetching data for ${country}...`);

        const res = await axios.get(url, {
            params: {
                action: 'parse',
                page: country,
                format: 'json',
                prop: 'sections|text',
                redirects: 1,
                origin: '*'
            }
        });

        if (res.data.error) {
            console.error('API Error:', res.data.error.info);
            return;
        }

        const sections = res.data.parse.sections;
        const htmlContent = res.data.parse.text['*'];

        // Find relevant sections
        const keywords = ['History', 'Culture', 'Cuisine', 'Geography', 'Economy'];

        keywords.forEach(keyword => {
            // Find section index
            const section = sections.find(s => s.line.includes(keyword));
            if (section) {
                console.log(`FOUND SECTION: ${section.line} (Index: ${section.index})`);
                // In a real app, we would parse the specific HTML chunk for this section
                // But full text is one giant HTML.
                // Alternatively we can fetch just that section using 'section={index}' param in 'parse'
            } else {
                console.log(`Missing: ${keyword}`);
            }
        });

    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

getWikiData('Brazil');
getWikiData('Japan');
