const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot be more than 200 characters'],
        default: 'Technical logic enthusiast.'
    },
    headline: {
        type: String,
        maxlength: [60, 'Headline cannot be more than 60 characters'],
        default: ''
    },
    experience: [{
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        from: { type: Date, required: true },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: String
    }],
    skills: [{
        name: { type: String, required: true },
        endorsements: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    }],
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    socialLinks: {
        github: String,
        twitter: String,
        linkedin: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    customLinks: [{
        label: { type: String, required: true },
        url: { type: String, required: true }
    }],
    followers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    arcade: {
        streak: { type: Number, default: 0 },
        lastPlayed: { type: Date },
        points: { type: Number, default: 0 },
        games: {
            memory: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } },
            typing: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } },
            hex: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } },
            breach: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } },
            escape: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } },
            hunter: { streak: { type: Number, default: 0 }, lastPlayed: { type: Date } }
        }
    },
    activityLogs: [{
        date: { type: String, required: true }, // YYYY-MM-DD
        count: { type: Number, default: 0 }
    }],
    reputation: {
        type: Number,
        default: 0
    },
    experimentGroup: {
        type: String,
        enum: ['A', 'B'],
        default: () => (Math.random() < 0.5 ? 'A' : 'B')
    },
    featureFlags: {
        type: Map,
        of: Boolean,
        default: {}
    },
    preferences: {
        designSystem: {
            type: String,
            enum: ['v1', 'v2', 'v3', 'v4', 'v5'],
            default: 'v1'
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 min)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
