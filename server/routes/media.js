const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let gridfsBucket;

const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    console.log('GridFS Bucket Initialized');
});

// serve file
router.get('/:filename', async (req, res) => {
    if (!gridfsBucket) {
        // Fallback try-init if connection wasn't ready at startup (unlikely but safe)
        if (mongoose.connection.readyState === 1) {
            gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });
        } else {
            return res.status(500).json({ err: 'Database not initialized' });
        }
    }

    try {
        const file = await gridfsBucket.find({ filename: req.params.filename }).toArray();

        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }

        // Set Content-Type
        if (file[0].contentType) {
            res.set('Content-Type', file[0].contentType);
        }

        // Stream it
        const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(404).json({ err: 'File not found' });
    }
});

module.exports = router;
