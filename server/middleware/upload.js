const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI;

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|mp4|webm/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and Videos Only!');
    }
}

let uploadMiddleware = null;

const getUploadMiddleware = () => {
    if (!uploadMiddleware) {
        if (mongoose.connection.readyState !== 1) {
            console.error('[Upload] MongoDB is not connected yet! Cannot initialize storage.');
            throw new Error('MongoDB not connected');
        }

        console.log('[Upload] Initializing GridFS Storage with active MongoDB connection...');

        // Create storage engine using the existing native DB object
        const storage = new GridFsStorage({
            db: mongoose.connection.db, // Use the native Db object
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    console.log(`[Upload] Processing file: ${file.originalname}`);
                    crypto.randomBytes(16, (err, buf) => {
                        if (err) {
                            console.error("[Upload] Crypto error:", err);
                            return reject(err);
                        }
                        const filename = buf.toString('hex') + path.extname(file.originalname);
                        const fileInfo = {
                            filename: filename,
                            bucketName: 'uploads'
                        };
                        console.log(`[Upload] Generated filename: ${filename}`);
                        resolve(fileInfo);
                    });
                });
            }
        });

        uploadMiddleware = multer({
            storage,
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
            fileFilter: function (req, file, cb) {
                console.log("Filtering file:", file.originalname);
                checkFileType(file, cb);
            }
        });
    }
    return uploadMiddleware;
};

// Export wrappers that match the Multer API
module.exports = {
    single: (fieldName) => (req, res, next) => {
        try {
            getUploadMiddleware().single(fieldName)(req, res, next);
        } catch (err) {
            console.error('[Upload] Middleware Error:', err);
            res.status(500).json({ msg: 'Server Upload Error' });
        }
    },
    array: (fieldName, maxCount) => (req, res, next) => {
        try {
            getUploadMiddleware().array(fieldName, maxCount)(req, res, next);
        } catch (err) {
            console.error('[Upload] Middleware Error:', err);
            res.status(500).json({ msg: 'Server Upload Error' });
        }
    }
};
