const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// Get Recent Reviews (Global)
router.get('/recent', async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('userId', 'fullName username profilePicture');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User Reviews
router.get('/user', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName username profilePicture');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Reviews for a Country
router.get('/:countryName', async (req, res) => {
    try {
        const reviews = await Review.find({ countryName: req.params.countryName })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName username profilePicture');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add Review
router.post('/', auth, (req, res, next) => {
    upload.array('media', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message || err });
        }
        next();
    });
}, async (req, res) => {
    const { countryName, rating, comment } = req.body;
    try {
        const media = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];


        const newReview = new Review({
            countryName,
            userId: req.user.id,
            username: req.user.username,
            rating,
            comment,
            media
        });

        const review = await newReview.save();
        await review.populate('userId', 'fullName username profilePicture');

        // Auto-mark as visited
        const user = await User.findById(req.user.id);
        if (!user.visitedCountries.includes(countryName)) {
            user.visitedCountries.push(countryName);
            await user.save();
        }

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Review
router.put('/:id', auth, (req, res, next) => {
    upload.array('media', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message || err });
        }
        next();
    });
}, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        // Ensure user owns review
        if (review.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        review.rating = rating || review.rating;
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        if (req.files && req.files.length > 0) {
            const newMedia = req.files.map(file => `/uploads/${file.filename}`);
            review.media = [...review.media, ...newMedia];
        }

        await review.save();
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        // Ensure user owns review
        if (review.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await review.deleteOne();
        res.json({ msg: 'Review removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Like/Unlike Review
router.put('/:id/like', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        // Check if already liked
        const isLiked = review.likedBy.includes(req.user.id);

        if (isLiked) {
            // Unlike
            review.likedBy = review.likedBy.filter(id => id.toString() !== req.user.id);
            review.likes = Math.max(0, review.likes - 1); // Prevent negative
        } else {
            // Like
            review.likedBy.push(req.user.id);
            review.likes += 1;
        }

        await review.save();
        await review.populate('userId', 'fullName username profilePicture'); // Ensure author details are returned
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Review Likes (Populated)
router.get('/:id/likes', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('likedBy', 'username profilePicture fullName');
        if (!review) return res.status(404).json({ msg: 'Review not found' });
        res.json(review.likedBy);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
