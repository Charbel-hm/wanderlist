const mongoose = require('mongoose');

const WanderlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    countries: [{
        name: {
            type: String,
            required: true
        },
        flag: String, // URL to flag image
        region: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Wanderlist', WanderlistSchema);
