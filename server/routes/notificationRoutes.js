const express = require('express');
const {
    getNotifications,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNotifications);

router.route('/:id/read')
    .put(markAsRead);

router.route('/:id')
    .delete(deleteNotification);

module.exports = router;
