const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wanderlist = require('../models/Wanderlist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper to send email
const sendVerificationEmail = async (email, token) => {
    // For now, print to console to simulate if no credentials
    const url = `https://wanderlist-kdgg.onrender.com/verify-email?token=${token}`; // Frontend URL

    console.log('------------------------------------------');
    console.log(`📧 SENDING VERIFICATION EMAIL TO: ${email}`);
    console.log(`🔗 LINK: ${url}`);
    console.log('------------------------------------------');

    // Production Email Sending
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Standard for personal projects. For production, SendGrid/Mailgun is better.
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Wanderlist" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Wanderlist account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Welcome to Wanderlist! 🌍</h2>
                    <p>Please verify your email address to start your journey.</p>
                    <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
                    <p style="margin-top: 20px; color: #777; fontSize: 12px;">Or copy this link: <br/>${url}</p>
                </div>
            `
        });
        console.log(`📧 Email sent to ${email}`);
    } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        // Don't crash registration if email fails, but log it.
        // In strict mode, you might want to return an error here.
    }
};

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Invalid email format' });
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
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'Username taken' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            isVerified: false
        });

        await user.save();
        console.log('User created:', user._id);

        // Create empty wanderlist for user
        const wanderlist = new Wanderlist({ userId: user._id, countries: [] });
        await wanderlist.save();
        console.log('Wanderlist created');

        // Send Email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await sendVerificationEmail(email, verificationToken);
        } else {
            console.log('Skipping email: No credentials provided in environment');
        }

        res.json({ msg: 'Registration successful! Please check your email to verify your account.' });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

// Verify Email Route
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check if verified
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user._id, username: user.username } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
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
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
