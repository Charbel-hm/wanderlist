const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/wanderlist')
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
