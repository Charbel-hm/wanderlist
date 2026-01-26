const express = require('express');
const router = express.Router();
const axios = require('axios');
const CountryVideo = require('../models/CountryVideo');

// Get video for a country
router.get('/video/:countryName', async (req, res) => {
    try {
        const { countryName } = req.params;

        // Check cache first
        const cachedVideo = await CountryVideo.findOne({ countryName });
        if (cachedVideo) {
            return res.json({
                videoId: cachedVideo.videoId,
                videoTitle: cachedVideo.videoTitle,
                cached: true
            });
        }

        // If not cached, fetch from YouTube API
        const apiKey = process.env.YOUTUBE_API_KEY;
        console.log('YouTube API Key check:', apiKey ? `Key present (length: ${apiKey.length})` : 'NOT FOUND');
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            return res.status(500).json({
                error: 'YouTube API key not configured',
                fallback: true
            });
        }

        const searchQuery = `${countryName} travel 4k`;
        const youtubeUrl = 'https://www.googleapis.com/youtube/v3/search';

        const response = await axios.get(youtubeUrl, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                videoEmbeddable: 'true',
                videoDuration: 'medium', // 4-20 minutes
                videoDefinition: 'high',
                order: 'relevance',
                safeSearch: 'strict',
                maxResults: 1,
                key: apiKey
            }
        });

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({
                error: 'No videos found',
                fallback: true
            });
        }

        const video = response.data.items[0];
        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;

        // Cache the result
        await CountryVideo.create({
            countryName,
            videoId,
            videoTitle
        });

        res.json({
            videoId,
            videoTitle,
            cached: false
        });

    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to fetch video',
            fallback: true
        });
    }
});

module.exports = router;
