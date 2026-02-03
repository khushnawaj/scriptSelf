const express = require('express');
const { register, login, logout, getMe, updateDetails } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ success: false, error: err.message || 'Image upload failed' });
        }
        next();
    });
}, updateDetails);

module.exports = router;
