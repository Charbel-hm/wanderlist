const axios = require('axios');

async function getWikiSections(countryName) {
    try {
        // Fetch page content/mobile-sections to get parsed sections
        const url = `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${countryName}`;
        console.log(`Fetching from: ${url}`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        const sections = res.data.lead.sections.concat(res.data.remaining.sections);

        // Look for relevant headings
        const relevant = ['History', 'Culture', 'Cuisine', 'Geography', 'Tourism'];

        relevant.forEach(topic => {
            const section = sections.find(s => s.line && s.line.includes(topic));
            if (section) {
                console.log(`--- ${topic} ---`);
                // Text is often HTML, we might need to strip tags or just snippet it
                console.log(section.text.substring(0, 200) + '...');
                // Check if images are linked in the section object?
                // verifying API structure
            } else {
                console.log(`--- ${topic} NOT FOUND ---`);
            }
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

getWikiSections('Brazil');
getWikiSections('Japan');
