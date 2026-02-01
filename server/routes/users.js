const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const Wanderlist = require('../models/Wanderlist');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');


// Helper to get data (duplicated from countries.js for now, or could extract to utility)
const getCountriesData = () => {
    try {
        const dataPath = path.join(__dirname, '../data/countries.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error loading country data:', err);
        return [];
    }
};

// Get Visited Countries Details
router.get('/visited-details', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const allCountries = getCountriesData();
        const visitedDetails = allCountries.filter(c =>
            user.visitedCountries.includes(c.name.common)
        );

        res.json(visitedDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Add Country to Visited
router.post('/visited', auth, async (req, res) => {
    try {
        const { countryName } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.visitedCountries.includes(countryName)) {
            user.visitedCountries.push(countryName);
            await user.save();
        }

        res.json(user.visitedCountries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Remove Country from Visited
router.delete('/visited/:countryName', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.visitedCountries = user.visitedCountries.filter(c => c !== req.params.countryName);
        await user.save();

        res.json(user.visitedCountries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Public User Profile
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const reviews = await Review.find({ userId: user._id }).sort({ createdAt: -1 });
        const wanderlistDoc = await Wanderlist.findOne({ userId: user._id });
        const wanderlist = wanderlistDoc ? wanderlistDoc.countries : [];

        res.json({ user, reviews, wanderlist });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

