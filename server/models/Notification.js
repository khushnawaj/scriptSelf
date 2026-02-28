const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Allow null for system notifications
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment', 'system', 'mention', 'share', 'announcement'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    link: {
        type: String // URL to redirect when clicked
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
