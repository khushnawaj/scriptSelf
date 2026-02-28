const Notification = require('../models/Notification');
const User = require('../models/User'); // Required for email lookups
const redis = require('../config/redis');
const sendEmail = require('./emailService');

let io;

exports.setIO = (ioInstance) => {
    io = ioInstance;
};

// @desc push notification to Redis and DB, and emit socket event
exports.sendNotification = async ({ recipient, sender, type, message, link, title, metadata, skipEmail = false }) => {
    try {
        // 1. Save to DB
        const notificationInput = {
            recipient,
            sender: sender || null, // Allow system notifications (no sender)
            type,
            message: message || title,
            link,
            metadata: metadata || {}
        };

        const notification = await Notification.create(notificationInput);

        // Populate sender info for frontend (if exists)
        let populatedNotification;
        if (sender) {
            populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'username avatar');
        } else {
            populatedNotification = notification.toObject();
        }

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

        // 4. Send Email Notification
        if (!skipEmail) {
            const user = await User.findById(recipient).select('email username');
            if (user && user.email) {
                const subjectMap = {
                    'share': 'New Technical Record Shared with You',
                    'mention': 'You were mentioned in a script',
                    'comment': 'New feedback on your record',
                    'follow': 'New follower on ScriptShelf',
                    'announcement': title || subjectMap[type] || 'ScriptShelf System Update'
                };

                await sendEmail({
                    email: user.email,
                    subject: subjectMap[type] || 'ScriptShelf Notification',
                    message: `Hi ${user.username},\n\n${notificationInput.message}\n\nView here: ${process.env.CLIENT_URL || 'http://localhost:5173'}${link || ''}\n\nBest regards,\nScriptShelf Intelligence.`
                }).catch(e => console.error('Email Dispatch Failed:', e.message));
            }
        }

        return populatedNotification;
    } catch (err) {
        console.error('Notification Service Error:', err);
    }
};

// Alias for backwards compatibility
exports.createNotification = exports.sendNotification;

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
