const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wanderlist = require('../models/Wanderlist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const { Readable } = require('stream');

// Helper to stream buffer to GridFS
const streamUpload = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) return reject(err);
            const filename = buf.toString('hex') + path.extname(originalName);
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
            const uploadStream = bucket.openUploadStream(filename, {
                contentType: 'application/octet-stream'
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

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Password validation (min 8 chars, alphanumeric)
    if (password.length < 8) {
        return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
        return res.status(400).json({ msg: 'Password must contain both letters and numbers' });
    }

    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'Username taken' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        console.log('User created:', user._id);

        // Create empty wanderlist for user
        const wanderlist = new Wanderlist({ userId: user._id, countries: [] });
        await wanderlist.save();
        console.log('Wanderlist created');

        // Auto-login: Generate Token
        const payload = { user: { id: user._id, username: user.username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10y' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, username: user.username } });
        });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user._id, username: user.username } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10y' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, username: user.username } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Current User (Me)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const upload = require('../middleware/upload');

// Update User Details
router.put('/updatedetails', [auth, upload.single('profilePicture')], async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const { fullName, bio } = req.body;

        if (fullName) user.fullName = fullName;
        if (bio) user.bio = bio;

        if (req.file) {
            // Manual GridFS Stream
            const filename = await streamUpload(req.file.buffer, req.file.originalname);
            user.profilePicture = filename;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
