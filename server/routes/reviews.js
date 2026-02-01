const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const { Readable } = require('stream');

// Helper to stream buffer to GridFS
// Helper to stream buffer to GridFS
const streamUpload = async (buffer, originalName, mimetype) => {
    // Ensure DB is connected before starting stream (Critical for Vercel/Serverless)
    if (mongoose.connection.readyState !== 1) {
        console.log("[StreamUpload] Waiting for MongoDB connection...");
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("DB Connection Timeout")), 10000);
            mongoose.connection.once('open', () => {
                clearTimeout(timeout);
                resolve();
            });
            // If strictly disconnected, might need to trigger connect, but index.js should have started it.
            if (mongoose.connection.readyState === 0) {
                mongoose.connect(process.env.MONGO_URI).catch(reject);
            }
        });
        console.log("[StreamUpload] MongoDB Connected.");
    }

    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) return reject(err);
            const filename = buf.toString('hex') + path.extname(originalName);
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
            const uploadStream = bucket.openUploadStream(filename, {
                contentType: mimetype || 'application/octet-stream'
            });

            const readStream = new Readable();
            readStream.push(buffer);
            readStream.push(null);

            readStream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => {
                    resolve(`/uploads/${filename}`);
                });
        });
    });
};

// Get Top Liked Reviews
router.get('/top', async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ likes: -1, createdAt: -1 })
            .limit(6)
            .populate('userId', 'fullName username profilePicture');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
router.post('/', auth, upload.array('media', 5), async (req, res) => {
    const { countryName, comment } = req.body;
    try {
        // Handle manual Streaming to GridFS
        const mediaPromises = req.files ? req.files.map(file => streamUpload(file.buffer, file.originalname, file.mimetype)) : [];
        const media = await Promise.all(mediaPromises);

        const newReview = new Review({
            countryName,
            userId: req.user.id,
            username: req.user.username,
            comment,
            media
        });

        const review = await newReview.save();
        await review.populate('userId', 'fullName username profilePicture');

        // Auto-mark as visited
        const user = await User.findById(req.user.id);
        if (user && !user.visitedCountries.includes(countryName)) {
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
router.put('/:id', auth, upload.array('media', 5), async (req, res) => {
    const { comment } = req.body;
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        // Ensure user owns review
        if (review.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        review.comment = comment || review.comment;

        if (req.files && req.files.length > 0) {
            const mediaPromises = req.files.map(file => streamUpload(file.buffer, file.originalname, file.mimetype));
            const newMedia = await Promise.all(mediaPromises);
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
