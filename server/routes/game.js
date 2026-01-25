const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Update High Score
router.post('/score', auth, async (req, res) => {
    const { score } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const currentHigh = user.flagGameHighScore || 0;

        if (score > currentHigh) {
            user.flagGameHighScore = score;
            await user.save();
            return res.json({ msg: 'New High Score!', highScore: score });
        }

        res.json({ msg: 'Score saved', highScore: currentHigh });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
