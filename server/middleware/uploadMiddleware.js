const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
});

module.exports = upload;
