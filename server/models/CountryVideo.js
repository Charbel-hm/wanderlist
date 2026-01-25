const mongoose = require('mongoose');

const CountryVideoSchema = new mongoose.Schema({
    countryName: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    videoId: {
        type: String,
        required: true
    },
    videoTitle: {
        type: String,
        required: true
    },
    cachedAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // 30 days in seconds
    }
});

module.exports = mongoose.model('CountryVideo', CountryVideoSchema);
