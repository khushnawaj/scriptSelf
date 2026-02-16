const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB file
        fieldSize: 50 * 1024 * 1024 // 50MB text field (Note content)
    },
});

module.exports = upload;
