const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const conn = mongoose.connection;
        const db = conn.db;

        // Check uploads.files collection directly
        const filesCollection = db.collection('uploads.files');
        const files = await filesCollection.find().limit(10).toArray();

        console.log('\n--- GridFS Files (uploads.files) ---');
        if (files.length === 0) {
            console.log('No files found in GridFS.');
        } else {
            files.forEach(f => {
                console.log(`Filename: ${f.filename}, ID: ${f._id}, ContentType: ${f.contentType}`);
            });
        }

        const Review = require('./server/models/Review');
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(3);

        console.log('\n--- Recent Reviews Media ---');
        reviews.forEach(r => {
            console.log(`Review ID: ${r._id}`);
            console.log(`Media: ${JSON.stringify(r.media)}`);
        });

        const User = require('./server/models/User');
        const users = await User.find().sort({ _id: -1 }).limit(3); // Fetch recently created/updated users

        console.log('\n--- Recent Users Profile Pics ---');
        users.forEach(u => {
            console.log(`User: ${u.username}, ProfilePic: ${u.profilePicture}`);
        });


    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
