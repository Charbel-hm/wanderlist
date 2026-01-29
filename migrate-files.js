const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './server/.env' });

const PROD_URI = process.env.MONGO_URI;
const UPLOADS_DIR = path.join(__dirname, 'server/uploads');

async function migrateFiles() {
    console.log('🚀 Starting File Migration to GridFS...');

    if (!PROD_URI) {
        console.error('❌ MONGO_URI missing in server/.env');
        return;
    }

    try {
        await mongoose.connect(PROD_URI);
        console.log('✅ Connected to DB.');

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const files = fs.readdirSync(UPLOADS_DIR);
        console.log(`📂 Found ${files.length} files in ${UPLOADS_DIR}`);

        const getContentType = (filename) => {
            if (filename.endsWith('.png')) return 'image/png';
            if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
            if (filename.endsWith('.mp4')) return 'video/mp4';
            return 'application/octet-stream';
        };

        for (const file of files) {
            const filePath = path.join(UPLOADS_DIR, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) continue;

            // Check if exists in GridFS
            const existing = await bucket.find({ filename: file }).toArray();
            if (existing.length > 0) {
                console.log(`♻️  Replacing ${file}...`);
                await bucket.delete(existing[0]._id);
            } else {
                console.log(`📤 Uploading ${file}...`);
            }

            const readStream = fs.createReadStream(filePath);
            const uploadStream = bucket.openUploadStream(file, {
                contentType: getContentType(file)
            });

            await new Promise((resolve, reject) => {
                readStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
            console.log(`   ✅ Uploaded (${getContentType(file)}).`);
        }

        console.log('🎉 File Migration Complete!');
        await mongoose.disconnect();

    } catch (err) {
        console.error('❌ Migration failed:', err);
    }
}

migrateFiles();
