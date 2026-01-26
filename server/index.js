const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Health Check & Debug
app.get('/api/health', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    try {
        const rootDir = process.cwd();
        const serverDir = path.join(rootDir, 'server');
        // Check what exists
        const rootFiles = fs.existsSync(rootDir) ? fs.readdirSync(rootDir) : ['Root not found'];
        const serverFiles = fs.existsSync(serverDir) ? fs.readdirSync(serverDir) : ['Server dir not found'];

        res.json({
            status: 'ok',
            timestamp: new Date(),
            debug: {
                cwd: rootDir,
                rootFiles: rootFiles,
                serverFiles: serverFiles,
                mongoStatus: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
                envChecks: {
                    MONGO_URI: !!process.env.MONGO_URI,
                    JWT_SECRET: !!process.env.JWT_SECRET
                }
            }
        });
    } catch (e) {
        res.json({ status: 'error', error: e.message });
    }
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

app.get('/api/probe', (req, res) => {
    res.json({ message: "Vercel Function is working!", url: req.url });
});

// Routes
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/wiki', require('./routes/wiki'));
app.use('/api/wanderlist', require('./routes/wanderlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/game', require('./routes/game'));
app.use('/api/users', require('./routes/users'));
app.use('/api/media', require('./routes/media'));

// Catch-all info for unmatched routes starting with /api
// Catch-all info for unmatched routes starting with /api
app.use('/api', (req, res) => {
    res.status(404).json({
        error: "API Route Not Found",
        path: req.originalUrl,
        available: ["/api/health", "/api/probe", "/api/countries"]
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module && !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
