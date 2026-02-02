const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resource_type = 'auto';
        if (file.mimetype === 'application/pdf') {
            resource_type = 'raw';
        }
        return {
            folder: 'ScriptShelf',
            resource_type: resource_type,
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'txt'],
        };
    },
});

module.exports = { cloudinary, storage };
