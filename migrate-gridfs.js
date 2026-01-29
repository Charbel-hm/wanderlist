const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const LOCAL_URI = 'mongodb://localhost:27017/wanderlist';
const PROD_URI = process.env.MONGO_URI;

async function migrateGridFS() {
    console.log('🚀 Starting GridFS Migration (Local -> Prod)...');

    if (!PROD_URI) {
        console.error('❌ MONGO_URI missing in server/.env');
        return;
    }

    try {
        // Create separate connections
        const localConn = mongoose.createConnection(LOCAL_URI);
        const prodConn = mongoose.createConnection(PROD_URI);

        // Wait for connections to open
        await Promise.all([
            new Promise(resolve => localConn.once('open', resolve)),
            new Promise(resolve => prodConn.once('open', resolve))
        ]);

        console.log('✅ Connected to both databases.');

        const localBucket = new mongoose.mongo.GridFSBucket(localConn.db, { bucketName: 'uploads' });
        const prodBucket = new mongoose.mongo.GridFSBucket(prodConn.db, { bucketName: 'uploads' });

        // Get all files from local
        const localFiles = await localBucket.find({}).toArray();
        console.log(`📂 Found ${localFiles.length} files in Local GridFS.`);

        for (const file of localFiles) {
            // Check if exists in Prod
            const existing = await prodBucket.find({ filename: file.filename }).toArray();
            if (existing.length > 0) {
                console.log(`⏭️  Skipping ${file.filename} (already exists)`);
                continue;
            }

            console.log(`📤 Uploading ${file.filename} (${(file.length / 1024).toFixed(2)} KB)...`);

            const downloadStream = localBucket.openDownloadStream(file._id);
            const uploadStream = prodBucket.openUploadStream(file.filename, {
                contentType: file.contentType,
                metadata: file.metadata
            });

            await new Promise((resolve, reject) => {
                downloadStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
            console.log(`   ✅ Uploaded.`);
        }

        console.log('🎉 GridFS Migration Complete!');

        await localConn.close();
        await prodConn.close();

    } catch (err) {
        console.error('❌ Migration failed:', err);
    }
}

migrateGridFS();
