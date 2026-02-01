const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');

// Get Statistics for a Country
router.get('/:countryName', async (req, res) => {
    try {
        const countryName = req.params.countryName;

        // Use aggregation to get average and count
        const stats = await Rating.aggregate([
            { $match: { countryName } },
            {
                $group: {
                    _id: '$countryName',
                    average: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({ average: 0, count: 0 });
        }

        res.json({
            average: parseFloat(stats[0].average.toFixed(1)),
            count: stats[0].count
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User's Rating for a Country
router.get('/:countryName/user', auth, async (req, res) => {
    try {
        const rating = await Rating.findOne({
            userId: req.user.id,
            countryName: req.params.countryName
        });

        res.json({ rating: rating ? rating.rating : 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Upsert Rating (Create or Update)
router.post('/', auth, async (req, res) => {
    const { countryName, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ msg: 'Please provide a valid rating (1-5)' });
    }

    try {
        const newRating = await Rating.findOneAndUpdate(
            { userId: req.user.id, countryName },
            { rating },
            { new: true, upsert: true } // Create if not exists, return new doc
        );

        res.json(newRating);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
