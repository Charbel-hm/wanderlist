const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("CRITICAL: MONGO_URI is missing in upload.js!");
} else {
    console.log("Upload.js initialized with MONGO_URI:", mongoURI.substring(0, 20) + "...");
}

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

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            console.log("Processing file upload for GridFS:", file.originalName);
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    console.error("Crypto error:", err);
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads' // Collection name match
                };
                console.log("Generated filename for GridFS:", filename);
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50000000 }, // 50MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
