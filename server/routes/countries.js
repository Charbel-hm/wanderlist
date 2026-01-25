const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to data file
// Path to data file
const dataPath = path.join(__dirname, '../data/countries.json');

// Helper to get data
const getCountriesData = () => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error loading country data:', err);
        return [];
    }
};

const Review = require('../models/Review');

// Get All Countries
router.get('/', async (req, res) => {
    try {
        const countriesData = getCountriesData();
        let ratings = [];

        // Only fetch ratings if DB is connected (simple check: if mongoose.connection.readyState === 1)
        if (require('mongoose').connection.readyState === 1) {
            try {
                ratings = await Review.aggregate([
                    {
                        $group: {
                            _id: '$countryName',
                            averageRating: { $avg: '$rating' },
                            reviewCount: { $sum: 1 }
                        }
                    }
                ]);
            } catch (dbErr) {
                console.warn('Database aggregation failed, proceeding with empty ratings', dbErr);
            }
        }

        const countriesWithRatings = countriesData.map(country => {
            const ratingData = ratings.find(r => r._id === country.name.common);
            return {
                ...country,
                averageRating: ratingData ? ratingData.averageRating : 0,
                reviewCount: ratingData ? ratingData.reviewCount : 0
            };
        });

        res.json(countriesWithRatings);
    } catch (err) {
        console.error(err.message);
        // Fallback to basic data if everything fails
        try {
            res.json(getCountriesData());
        } catch (e) {
            res.status(500).send('Server Error');
        }
    }
});

// Get Random Country
router.get('/random', (req, res) => {
    const countriesData = getCountriesData();
    if (!countriesData || countriesData.length === 0) {
        return res.status(404).json({ msg: 'No countries available' });
    }
    const randomIndex = Math.floor(Math.random() * countriesData.length);
    const randomCountry = countriesData[randomIndex];
    res.json(randomCountry);
});

// Get Country by Name
router.get('/:name', (req, res) => {
    const countriesData = getCountriesData();
    const name = req.params.name.toLowerCase(); // Load data for each request
    const country = countriesData.find(c =>
        c.name.common.toLowerCase() === name ||
        c.name.official.toLowerCase() === name
    );

    if (country) {
        res.json([country]); // Return array to match restcountries API format
    } else {
        res.status(404).json({ msg: 'Country not found' });
    }
});

module.exports = router;
