const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a folder name'],
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        trim: true,
        maxlength: 200
    },
    color: {
        type: String,
        default: '#6b7280', // Default gray
        validate: {
            validator: function (v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Invalid color hex code'
        }
    },
    icon: {
        type: String,
        default: 'Folder' // Lucide icon name
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Folder',
        default: null // null = root level folder
    },
    order: {
        type: Number,
        default: 0 // For custom sorting
    }
}, {
    timestamps: true
});

// Index for faster queries
folderSchema.index({ user: 1, parent: 1 });

// Get folder with note count
folderSchema.virtual('noteCount', {
    ref: 'Note',
    localField: '_id',
    foreignField: 'folder',
    count: true
});

module.exports = mongoose.model('Folder', folderSchema);
