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
    avatar: { // URL to uploaded file
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        maxlength: 500
    },
    socialLinks: {
        github: { type: String },
        linkedin: { type: String },
        website: { type: String },
        leetcode: { type: String }
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
