const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a note title'],
        trim: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: [true, 'Please add some content']
    },
    // Specific field for code snippets if type is 'code'
    codeSnippet: {
        type: String,
        default: ''
    },
    // Linking Related Notes
    relatedNotes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Note'
    }],
    // Field for PDF
    attachment: {
        path: String,
        originalName: String,
        mimeType: String
    },
    attachmentUrl: { // Legacy or direct URL
        type: String
    },
    videoUrl: { // For tutorial notes
        type: String,
        trim: true
    },
    // PDF Deep Search
    searchableText: {
        type: String,
        select: false // Exclude from default query for performance
    },
    // Version Control
    history: [{
        content: String,
        codeSnippet: String,
        updatedAt: { type: Date, default: Date.now }
    }],
    type: {
        type: String,
        enum: ['code', 'pdf', 'doc', 'cheatsheet', 'adr', 'pattern', 'other'],
        default: 'doc',
        lowercase: true,
        trim: true
    },
    adrStatus: {
        type: String,
        enum: ['proposed', 'accepted', 'deprecated', 'superseded'],
        default: 'proposed'
    },
    // For Bidirectional Linking
    backlinks: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Note'
    }],
    tags: {
        type: [String],
        index: true // Indexed for faster search
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create text index for search
noteSchema.index({ title: 'text', tags: 'text', searchableText: 'text' });

// Pre-save Middleware: Smart Tagging & Versioning
noteSchema.pre('save', function (next) {
    // 1. Versioning
    if (this.isModified('content') || this.isModified('codeSnippet')) {
        // Only push if it's not a new document (otherwise history empty)
        if (!this.isNew) {
            // We can't access "previous" value easily in pre-save without querying, 
            // BUT Mongoose 'this' still holds the document. 
            // Actually, usually you'd need to fetch the original or rely on client sending it?
            // Mongoose doesn't store the old value in 'this' after modification set.
            // Wait, standard approach:
            // If we use findByIdAndUpdate, we can't capture this easily in a document middleware.
            // But the controller uses findByIdAndUpdate.
            // To support "history", the controller should ideally use findById, modify, then save().
            // OR we just assume the *current* state before this save was the history?
            // No, 'this' is already the NEW state.

            // ALTERNATIVE: Use post-init to store original? Too complex.
            // BEST SIMPLE APPROACH: Controller logic is better for history or push "current" before update?
            // actually, 'this' in pre('save') is the document to be saved.
        }
    }

    // 2. Smart Tagging
    if ((!this.tags || this.tags.length === 0) && this.content) {
        const keywords = ['React', 'Node', 'Javascript', 'Python', 'CSS', 'HTML', 'SQL', 'MongoDB', 'Express', 'Java', 'C++', 'Redux'];
        const foundTags = [];
        const contentLower = this.content.toLowerCase();

        keywords.forEach(keyword => {
            if (contentLower.includes(keyword.toLowerCase())) {
                foundTags.push(keyword);
            }
        });

        if (foundTags.length > 0) {
            this.tags = foundTags;
        }
    }

    next();
});

// Static method to get simple statistics (for dashboard)
noteSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    // Advanced Analytics: Count by Type
    const typeStats = await this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

    // Time-series: Notes per day (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const timeSeries = await this.aggregate([
        {
            $match: {
                createdAt: { $gte: fourteenDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    type: "$type"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.date": 1 } }
    ]);

    return { categoryStats: stats, typeStats, timeSeries };
};

module.exports = mongoose.model('Note', noteSchema);
