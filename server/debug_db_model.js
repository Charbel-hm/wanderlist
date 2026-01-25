const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const debug = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected. State:', mongoose.connection.readyState);

        console.log('Finding user via Model...');
        const user = await User.findOne({});
        console.log('Found user:', user ? user._id : 'None');

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
};

debug();
