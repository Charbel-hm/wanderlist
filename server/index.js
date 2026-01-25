const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// DB Config
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/wanderlist';

// Connect to Mongo
if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log('MongoDB Connection Error:', err));
} else {
    console.warn('No MONGO_URI found. Database features will be disabled.');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/wiki', require('./routes/wiki'));
app.use('/api/wanderlist', require('./routes/wanderlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/game', require('./routes/game'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

if (require.main === module && !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
