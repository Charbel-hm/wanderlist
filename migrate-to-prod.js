const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Models
const User = require('./server/models/User');
const Wanderlist = require('./server/models/Wanderlist');
const Review = require('./server/models/Review');

const LOCAL_URI = 'mongodb://localhost:27017/wanderlist';
const PROD_URI = process.env.MONGO_URI;

async function migrate() {
    console.log('🚀 Starting Migration...');

    let users = [];
    let wanderlists = [];
    let reviews = [];

    // 1. READ FROM LOCAL
    try {
        console.log('\n📡 Connecting to LOCAL DB...');
        await mongoose.connect(LOCAL_URI);
        console.log('✅ Connected to LOCAL.');

        console.log('📥 Fetching data...');
        users = await User.find({});
        wanderlists = await Wanderlist.find({});
        // Check if Review model exists/has data (ignoring if fails as it might be optional)
        try { reviews = await Review.find({}); } catch (e) { console.log('No reviews found or model mismatch'); }

        console.log(`   - Users: ${users.length}`);
        console.log(`   - Wanderlists: ${wanderlists.length}`);
        console.log(`   - Reviews: ${reviews.length}`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected from LOCAL.');

    } catch (err) {
        console.error('❌ Failed reading local:', err);
        return;
    }

    if (users.length === 0) {
        console.log('⚠️ No users to migrate. Exiting.');
        return;
    }

    // 2. WRITE TO PROD
    try {
        console.log('\n--------');
        console.log('☁️ Connecting to PROD DB...');
        if (!PROD_URI) throw new Error('Missing MONGO_URI in .env');

        await mongoose.connect(PROD_URI);
        console.log('✅ Connected to PROD.');

        console.log('📤 Uploading Users...');
        for (const u of users) {
            try {
                // Use findOneAndUpdate with upsert to avoid duplicates
                await User.findByIdAndUpdate(u._id, u.toObject(), { upsert: true });
                process.stdout.write('.');
            } catch (e) {
                console.error(`\n   Failed User ${u.username}:`, e.message);
            }
        }
        console.log('\n✅ Users Done.');

        console.log('📤 Uploading Wanderlists...');
        for (const w of wanderlists) {
            try {
                await Wanderlist.findByIdAndUpdate(w._id, w.toObject(), { upsert: true });
                process.stdout.write('.');
            } catch (e) {
                console.error(`\n   Failed Wanderlist:`, e.message);
            }
        }
        console.log('\n✅ Wanderlists Done.');

        if (reviews.length > 0) {
            console.log('📤 Uploading Reviews...');
            for (const r of reviews) {
                try {
                    await Review.findByIdAndUpdate(r._id, r.toObject(), { upsert: true });
                    process.stdout.write('.');
                } catch (e) {
                    console.error(`\n   Failed Review:`, e.message);
                }
            }
            console.log('\n✅ Reviews Done.');
        }

        console.log('\n🎉 Migration Complete!');
        await mongoose.disconnect();

    } catch (err) {
        console.error('❌ Failed writing to prod:', err);
    }
}

migrate();
