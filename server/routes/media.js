const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let gridfsBucket;

// Initialize GridFS Bucket
const conn = mongoose.connection;
conn.once('open', () => {
    console.log('Media Route: MongoDB Connection Open, Initializing GridFSBucket');
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// Since connection might already be open if this file is required after connection
if (conn.readyState === 1) {
    console.log('Media Route: MongoDB Connection Already Open, Initializing GridFSBucket');
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
}

// Get Image/Video
router.get('/:filename', async (req, res) => {
    if (!gridfsBucket) {
        return res.status(500).json({ err: 'Database connection not ready' });
    }

    try {
        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ err: 'No file found' });
        }

        // Check if image or video
        if (file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png' ||
            file.contentType === 'video/mp4' ||
            file.contentType === 'video/webm' ||
            file.contentType === 'image/gif') {

            // Set headers
            res.set('Content-Type', file.contentType);
            res.set('Content-Length', file.length);
            res.set('Content-Disposition', 'inline'); // Ensure browser displays it

            // Stream response
            const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
            readStream.pipe(res);
        } else {
            res.status(404).json({ err: 'Not an image or video' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Server Error' });
    }
});

module.exports = router;
