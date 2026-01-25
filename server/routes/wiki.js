const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper to summarize HTML content
function summarizeHtml(html, fallbackImage = null) {
    if (!html) return '';

    // 1. Extract first image if available (before cleaning)
    let imageHtml = '';
    // Look for standard wiki image embeds
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"[^>]*>/);
    if (imgMatch && imgMatch[1]) {
        let src = imgMatch[1];
        if (src.startsWith('//')) src = 'https:' + src;

        // Try to get HD version
        // Transform .../thumb/a/b/Name.jpg/Size-Name.jpg -> .../a/b/Name.jpg
        let fullResApi = src;
        if (src.includes('/thumb/')) {
            // Regex to remove /thumb/ and the last path segment (which is the sized thumbnail name)
            fullResApi = src.replace(/\/thumb\/([0-9a-fA-F]+\/[0-9a-fA-F]+\/[^\/]+)\/[^\/]+$/, '/$1');
        }

        // Basic filter
        if (!src.includes('Icon') && !src.includes('Ambox')) {
            // Style matches the app's glassmorphism/lush theme - Added Glass Frame with Padding
            imageHtml = `<div class="wiki-section-image-container" style="
                float: right; 
                margin: 0.5rem 0 2rem 2rem; 
                width: 45%; 
                max-width: 320px;
                padding: 0.75rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                backdrop-filter: blur(5px);
                box-shadow: 0 10px 30px -5px rgba(0,0,0,0.2);
                transition: transform 0.3s ease;
                cursor: pointer;
            "
            onmouseover="this.style.transform='scale(1.02) rotate(1deg)'"
            onmouseout="this.style.transform='scale(1) rotate(0deg)'"
            onclick="this.querySelector('img').click()"
            >
                <img 
                    src="${fullResApi}" 
                    class="clickable-wiki-image" 
                    data-full-res="${fullResApi}"
                    style="
                        width: 100%; 
                        border-radius: 0.5rem; 
                        object-fit: cover;
                        aspect-ratio: 4/3;
                        display: block;
                    "
                    alt="Section Image"
                />
            </div>`;
        }
    }

    // Fallback if no embedded image found
    if (!imageHtml && fallbackImage) {
        const fullResApi = fallbackImage.url;
        imageHtml = `<div class="wiki-section-image-container" style="
                float: right; 
                margin: 0.5rem 0 2rem 2rem; 
                width: 45%; 
                max-width: 320px;
                padding: 0.75rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                backdrop-filter: blur(5px);
                box-shadow: 0 10px 30px -5px rgba(0,0,0,0.2);
                transition: transform 0.3s ease;
                cursor: pointer;
            "
            onmouseover="this.style.transform='scale(1.02) rotate(1deg)'"
            onmouseout="this.style.transform='scale(1) rotate(0deg)'"
            onclick="this.querySelector('img').click()"
            >
                <img 
                    src="${fullResApi}" 
                    class="clickable-wiki-image" 
                    data-full-res="${fullResApi}"
                    style="
                        width: 100%; 
                        border-radius: 0.5rem; 
                        object-fit: cover;
                        aspect-ratio: 4/3;
                        display: block;
                    "
                    alt="Section Image"
                />
            </div>`;
    }

    // 2. Remove reference tags entirely (<sup ...>...</sup>)
    let clean = html.replace(/<sup[\s\S]*?<\/sup>/gi, '');

    // 3. Remove [1], [2] style text if any remains
    clean = clean.replace(/\[\d+\]/g, '');

    // 4. Extract paragraphs (first 2)
    const matches = clean.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);

    let text = '';
    if (matches && matches.length > 0) {
        // Return first 2 paragraphs joined
        text = matches.slice(0, 2).join('') + '<p>...</p>';
    } else {
        text = clean.substring(0, 600) + '...';
    }

    return imageHtml + text;
}

// Helper to get images from Wikivoyage (Extracted for reuse)
async function getWikiImages(country) {
    try {
        const url = 'https://en.wikivoyage.org/w/api.php';
        const res1 = await axios.get(url, {
            params: {
                action: 'query',
                generator: 'images',
                titles: country,
                gimlimit: 100,
                prop: 'imageinfo',
                iiprop: 'url|extmetadata',
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
        });

        const pages = res1.data.query?.pages;
        if (!pages) return [];

        const results = Object.values(pages)
            .filter(p => p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url)
            .map(p => {
                const info = p.imageinfo[0];
                const meta = info.extmetadata || {};
                let desc = meta.ImageDescription ? meta.ImageDescription.value : '';
                // Clean HTML
                desc = desc.replace(/<[^>]*>/g, '');

                return {
                    title: p.title.replace(/^File:/, '').replace(/\.(jpg|jpeg|png|svg)$/i, ''),
                    description: desc,
                    url: info.url
                };
            });

        const validResults = results.filter(img => {
            const lowerUrl = img.url.toLowerCase();
            const lowerTitle = img.title.toLowerCase();
            const isMapOrFlag = lowerUrl.includes('map') || lowerUrl.includes('flag') || lowerUrl.includes('svg') || lowerUrl.includes('coat_of_arms') || lowerUrl.includes('icon') || lowerUrl.includes('banner') || lowerTitle.includes('banner') || lowerTitle.includes('flag') || lowerTitle.includes('locator') || lowerTitle.includes('regions');
            const isUserImage = lowerTitle.includes('user:') || lowerTitle.includes('commit');
            const isPhoto = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg');
            return !isMapOrFlag && !isUserImage && isPhoto;
        });

        const seen = new Set();
        const unique = [];
        for (const r of validResults) {
            if (!seen.has(r.url)) {
                seen.add(r.url);
                unique.push(r);
            }
        }
        return unique.slice(0, 50);
    } catch (err) {
        console.error('Wiki Image Helper Error:', err.message);
        return [];
    }
}

router.get('/:country', async (req, res) => {
    try {
        const country = req.params.country;
        const url = 'https://en.wikipedia.org/w/api.php';

        // 1. Get Sections & Fallback Images in Parallel
        const [sectionsRes, fallbackImages] = await Promise.all([
            axios.get(url, {
                params: {
                    action: 'parse',
                    page: country,
                    format: 'json',
                    prop: 'sections',
                    redirects: 1,
                    origin: '*'
                },
                headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
            }),
            getWikiImages(country)
        ]);

        if (sectionsRes.data.error) {
            return res.status(404).json({ msg: 'Wiki page not found' });
        }

        const sections = sectionsRes.data.parse.sections;
        const result = {};
        const keywords = ['History', 'Culture', 'Cuisine', 'Geography', 'Tourism'];

        // 2. Fetch content for relevant sections
        const promises = keywords.map(async (keyword, index) => {
            const section = sections.find(s => s.line.includes(keyword));
            if (section) {
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
                        noimages: 0, // Keep images
                        mobileformat: 1 // Better for apps?
                    },
                    headers: { 'User-Agent': 'WanderlistDev/1.0 (contact@example.com)' }
                });

                // Smart Selection: Find an image related to the section keyword
                let fallbackImg = null;
                if (fallbackImages.length > 0) {
                    const sectionKey = keyword.toLowerCase();
                    const searchTerms = {
                        history: ['history', 'ancient', 'old', 'ruin', 'castle', 'fort', 'palace', 'museum', 'statue', 'monument', 'archaeology', 'war', 'roman', 'temple', 'church', 'mosque', 'cathedral', 'heritage'],
                        culture: ['culture', 'art', 'dance', 'music', 'festival', 'tradition', 'people', 'costume', 'clothing', 'religious', 'temple', 'church', 'mosque', 'prayer', 'street'],
                        cuisine: ['cuisine', 'food', 'dish', 'meal', 'drink', 'wine', 'beer', 'bread', 'cheese', 'meat', 'fish', 'fruit', 'vegetable', 'restaurant', 'market', 'sweet', 'pastry', 'coffee', 'tea', 'dining', 'plate', 'bowl', 'cooking', 'kitchen', 'spice', 'meze', 'hummus', 'tabouli', 'kebab', 'pizza', 'pasta', 'sushi', 'rice'],
                        geography: ['geography', 'mountain', 'river', 'lake', 'sea', 'ocean', 'coast', 'forest', 'park', 'landscape', 'nature', 'view', 'valley', 'cave', 'waterfall', 'plain', 'desert', 'bay', 'port', 'beach'],
                        tourism: ['tourism', 'travel', 'hotel', 'resort', 'beach', 'city', 'town', 'street', 'plaza', 'square', 'building', 'view', 'skyline', 'downtown', 'night', 'bridge', 'port', 'harbor']
                    };

                    const terms = searchTerms[sectionKey] || [sectionKey];

                    // Filter images that have any of the terms in title or description
                    const relatedImages = fallbackImages.filter(img => {
                        const text = (img.title + ' ' + img.description).toLowerCase();
                        return terms.some(term => text.includes(term));
                    });

                    // If we found related images, pick one. Otherwise fallback to generic distribution.
                    if (relatedImages.length > 0) {
                        // Pick one deterministically based on index to avoid oscillation but random enough
                        fallbackImg = relatedImages[index % relatedImages.length];
                    } else {
                        fallbackImg = fallbackImages[index % fallbackImages.length];
                    }
                }

                return { key: keyword.toLowerCase(), content: summarizeHtml(textRes.data.parse.text['*'], fallbackImg) };
            }
            return null;
        });

        const results = await Promise.all(promises);

        results.forEach(item => {
            if (item) {
                result[item.key] = item.content;
            }
        });

        res.json(result);

    } catch (err) {
        console.error('Wiki Fetch Error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get Wiki Images (Wikivoyage Source - STRICT)
// Switching from Wikipedia to Wikivoyage for better/more relevant travel images
// Get Wiki Images Route (uses helper)
router.get('/images/:country', async (req, res) => {
    const images = await getWikiImages(req.params.country);
    res.json(images);
});

module.exports = router;
