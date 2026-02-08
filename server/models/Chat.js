const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: false // Allow sending just attachments
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null // null means global chat
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    attachment: {
        url: String,
        name: String,
        fileType: String
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, {
    minimize: false, // Ensure empty objects aren't saved, but we'll handle this in logic anyway
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);
