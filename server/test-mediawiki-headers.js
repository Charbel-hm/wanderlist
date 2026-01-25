const axios = require('axios');

async function getWikiData(country) {
    try {
        const url = 'https://en.wikipedia.org/w/api.php';
        console.log(`Fetching data for ${country}...`);

        const res = await axios.get(url, {
            params: {
                action: 'parse',
                page: country,
                format: 'json',
                prop: 'sections', // Just get sections first to find indices
                redirects: 1,
                origin: '*'
            },
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        if (res.data.error) {
            console.error('API Error:', res.data.error.info);
            return;
        }

        const sections = res.data.parse.sections;
        console.log(`Found ${sections.length} sections for ${country}`);

        const keywords = ['History', 'Culture', 'Cuisine', 'Geography', 'Economy', 'Tourism'];

        for (const keyword of keywords) {
            const section = sections.find(s => s.line.includes(keyword));
            if (section) {
                console.log(`Fetching content for: ${section.line} (Index: ${section.index})`);
                // Now fetch the text for this section
                const textRes = await axios.get(url, {
                    params: {
                        action: 'parse',
                        page: country,
                        format: 'json',
                        prop: 'text',
                        section: section.index,
                        redirects: 1,
                        origin: '*',
                        disabletoc: 1,
                        noimages: 1 // We handle images separately maybe? Or let them inline?
                    },
                    headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
                });

                let html = textRes.data.parse.text['*'];
                // Clean up a bit (very rough strip tags for demo)
                // console.log(html.substring(0, 100) + '...');
                console.log(`   -> Retrieved ${html.length} chars of HTML`);
            }
        }

    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

getWikiData('Brazil');
