const express = require('express');
const { getSettings, getSetting, updateSetting } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/settings')
    .get(protect, authorize('admin'), getSettings);

router.route('/settings/:key')
    .get(getSetting)
    .put(protect, authorize('admin'), updateSetting);

module.exports = router;
