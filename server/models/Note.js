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
    history: [{
        content: String,
        codeSnippet: String,
        updatedAt: { type: Date, default: Date.now }
    }],
    // 1. Restore adrStatus validation
    adrStatus: {
        type: String,
        validate: {
            validator: function (v) {
                const validStatuses = ['proposed', 'accepted', 'deprecated', 'superseded'];
                return !v || validStatuses.includes(v.toLowerCase());
            },
            message: props => `${props.value} is not a valid ADR status.`
        },
        default: 'proposed'
    },

    // 2. Add isSolution to comments (lines 47-62)
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        isSolution: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // 3. Update type validation (lines 63-75)
    type: {
        type: String,
        default: 'doc',
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                const validTypes = ['code', 'pdf', 'doc', 'cheatsheet', 'adr', 'pattern', 'issue', 'other'];
                return !v || validTypes.includes(v.toLowerCase());
            },
            message: props => `${props.value} is not a recognized tech-record type.`
        }
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
    folder: {
        type: mongoose.Schema.ObjectId,
        ref: 'Folder',
        default: null // null = not in any folder (root level)
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mentions: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
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
    // --- DATA SANITIZATION ---
    if (this.tags) {
        const rawTags = Array.isArray(this.tags) ? this.tags : [this.tags];
        this.tags = rawTags
            .filter(t => t && (typeof t === 'string' || typeof t === 'number'))
            .map(t => String(t).trim())
            .filter(t => t.length > 0);
    }

    if (this.type) {
        if (Array.isArray(this.type)) this.type = this.type[0];
        this.type = String(this.type).toLowerCase().trim();
    }

    console.log(`[DB-SAVE] Type: ${this.type}, Title: ${this.title}`);

    // 1. Versioning
    if (this.isModified('content') || this.isModified('codeSnippet')) {
        if (!this.isNew) {
            // History logic can be added here if needed
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

noteSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    const typeStats = await this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

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

module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);
