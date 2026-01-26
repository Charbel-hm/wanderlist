require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const CountryVideo = require('./server/models/CountryVideo');

const clearCache = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
        await CountryVideo.deleteMany({});
        console.log('✅ Video Cache Cleared!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

clearCache();
