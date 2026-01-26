require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const collection = mongoose.connection.collection('users');

        // List indexes first
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the email index if it exists
        const emailIndex = indexes.find(idx => idx.key.email === 1);
        if (emailIndex) {
            console.log(`Dropping index: ${emailIndex.name}...`);
            await collection.dropIndex(emailIndex.name);
            console.log('✅ Index dropped successfully.');
        } else {
            console.log('⚠️ Email index not found (maybe already dropped).');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

dropIndex();
