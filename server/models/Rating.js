const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    countryName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one rating per user per country
RatingSchema.index({ userId: 1, countryName: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
