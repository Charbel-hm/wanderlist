const express = require('express');
const router = express.Router();
const Wanderlist = require('../models/Wanderlist');
const auth = require('../middleware/auth'); // We need to create this middleware

// Get User's Wanderlist
router.get('/', auth, async (req, res) => {
    try {
        const wanderlist = await Wanderlist.findOne({ userId: req.user.id });
        if (!wanderlist) return res.json([]);
        res.json(wanderlist.countries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add to Wanderlist
router.post('/', auth, async (req, res) => {
    const { name, flag, region } = req.body;
    try {
        let wanderlist = await Wanderlist.findOne({ userId: req.user.id });
        if (!wanderlist) {
            wanderlist = new Wanderlist({ userId: req.user.id, countries: [] });
        }

        // Check if country already exists
        if (wanderlist.countries.some(c => c.name === name)) {
            return res.status(400).json({ msg: 'Country already in wanderlist' });
        }

        wanderlist.countries.unshift({ name, flag, region });
        await wanderlist.save();
        res.json(wanderlist.countries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Remove from Wanderlist
router.delete('/:name', auth, async (req, res) => {
    try {
        let wanderlist = await Wanderlist.findOne({ userId: req.user.id });
        if (!wanderlist) return res.status(404).json({ msg: 'Wanderlist not found' });

        wanderlist.countries = wanderlist.countries.filter(
            c => c.name !== req.params.name
        );

        await wanderlist.save();
        res.json(wanderlist.countries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
