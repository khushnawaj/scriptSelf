const express = require('express');
const { getChatMessages, editMessage, deleteMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getChatMessages);
router.put('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);

router.post('/upload', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        console.error('[UPLOAD] No file in request');
        return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    console.log(`[UPLOAD] Received file: ${req.file.originalname} (${req.file.mimetype}) Path: ${req.file.path}`);

    try {
        let type = 'file';
        if (req.file.mimetype.startsWith('image/')) type = 'image';
        else if (req.file.mimetype.startsWith('video/')) type = 'video';

        const responseData = {
            url: req.file.path,
            name: req.file.originalname,
            fileType: type
        };

        console.log('[UPLOAD] Success. Data:', responseData);

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Chat Upload Handler Error:', error);
        res.status(500).json({ success: false, error: 'Server Error during upload processing' });
    }
});

module.exports = router;
