const Notification = require('../models/Notification'); // Keep for safety if needed, or remove if service handles everything. Service uses it.
const notificationService = require('../services/notificationService');

// @desc      Get all notifications for current user
// @route     GET /api/v1/notifications
// @access    Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getNotifications(req.user.id);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Mark notification as read
// @route     PUT /api/v1/notifications/:id/read
// @access    Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markRead(req.params.id, req.user.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Delete notification
// @route     DELETE /api/v1/notifications/:id
// @access    Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const success = await notificationService.deleteNotification(req.params.id, req.user.id);

        if (!success) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
