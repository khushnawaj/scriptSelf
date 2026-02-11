const Notification = require('../models/Notification');
const redis = require('../config/redis');

let io;

exports.setIO = (ioInstance) => {
    io = ioInstance;
};

// @desc push notification to Redis and DB, and emit socket event
exports.sendNotification = async ({ recipient, sender, type, message, link }) => {
    try {
        // 1. Save to DB
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            message,
            link
        });

        // Populate sender info for frontend
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username avatar');

        // 2. Cache in Redis (Prepend to list)
        const cacheKey = `notifications:${recipient}`;
        if (redis.status === 'ready') {
            await redis.lpush(cacheKey, JSON.stringify(populatedNotification));
            await redis.ltrim(cacheKey, 0, 49); // Keep latest 50
            await redis.expire(cacheKey, 3600); // 1 hour expiry
        }

        // 3. Emit via Socket.io
        if (io) {
            io.to(recipient.toString()).emit('notification', populatedNotification);
        }

        return populatedNotification;
    } catch (err) {
        console.error('Notification Service Error:', err);
    }
};

// @desc Get notifications with Redis caching
exports.getNotifications = async (userId) => {
    const cacheKey = `notifications:${userId}`;

    try {
        if (redis.status === 'ready') {
            const cachedNotes = await redis.lrange(cacheKey, 0, 49);

            if (cachedNotes && cachedNotes.length > 0) {
                return cachedNotes.map(n => JSON.parse(n));
            }
        }
    } catch (err) {
        console.error('Redis Fetch Error:', err);
    }

    // Fallback to DB
    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'username avatar')
        .sort('-createdAt')
        .limit(50);

    // Update Cache
    if (redis.status === 'ready' && notifications.length > 0) {
        // Use pipeline to push all at once
        const pipeline = redis.pipeline();
        pipeline.del(cacheKey); // Clear old
        notifications.forEach(n => pipeline.rpush(cacheKey, JSON.stringify(n)));
        pipeline.expire(cacheKey, 3600);
        await pipeline.exec();
    }

    return notifications;
};

// @desc Mark as read and update cache
exports.markRead = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) return null;
    if (notification.recipient.toString() !== userId) throw new Error('Not authorized');

    notification.isRead = true;
    await notification.save();

    // Invalidate cache for simplicity (re-fetch on next load)
    if (redis.status === 'ready') {
        const cacheKey = `notifications:${userId}`;
        await redis.del(cacheKey);
    }

    return notification;
};

// @desc Delete notification and update cache
exports.deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) return null;
    if (notification.recipient.toString() !== userId) throw new Error('Not authorized');

    await notification.deleteOne();

    // Invalidate cache
    if (redis.status === 'ready') {
        const cacheKey = `notifications:${userId}`;
        await redis.del(cacheKey);
    }

    return true;
};
