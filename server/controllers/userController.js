const User = require('../models/User');
const Note = require('../models/Note');
const logUserActivity = require('../utils/activityLogger');

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: `No user with the id of ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: `No user with the id of ${req.params.id}` });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
// @desc      Update user role
// @route     PUT /api/v1/users/:id/role
// @access    Private/Admin
exports.updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: `No user with the id of ${req.params.id}` });
        }

        user.role = req.body.role;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update Arcade Stats (Streak & Points)
// @route     PUT /api/v1/users/arcade
// @access    Private
exports.updateArcadeStats = async (req, res, next) => {
    try {
        const { points, gameId } = req.body;
        const user = await User.findById(req.user.id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- Global Streak Logic ---
        let lastPlayed = user.arcade.lastPlayed ? new Date(user.arcade.lastPlayed) : null;
        if (lastPlayed) lastPlayed.setHours(0, 0, 0, 0);

        if (!lastPlayed) {
            user.arcade.streak = 1;
        } else {
            const diffTime = Math.abs(today - lastPlayed);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.arcade.streak += 1;
            } else if (diffDays > 1) {
                user.arcade.streak = 1;
            }
        }
        user.arcade.lastPlayed = new Date();
        user.arcade.points = (user.arcade.points || 0) + (points || 0);

        // --- Game Specific Streak Logic ---
        if (gameId && user.arcade.games && user.arcade.games[gameId]) {
            let gameLastPlayed = user.arcade.games[gameId].lastPlayed ? new Date(user.arcade.games[gameId].lastPlayed) : null;
            if (gameLastPlayed) gameLastPlayed.setHours(0, 0, 0, 0);

            if (!gameLastPlayed) {
                user.arcade.games[gameId].streak = 1;
            } else {
                const diffTimeGame = Math.abs(today - gameLastPlayed);
                const diffDaysGame = Math.ceil(diffTimeGame / (1000 * 60 * 60 * 24));

                if (diffDaysGame === 1) {
                    user.arcade.games[gameId].streak += 1;
                } else if (diffDaysGame > 1) {
                    user.arcade.games[gameId].streak = 1;
                }
            }
            user.arcade.games[gameId].lastPlayed = new Date();
        } else if (gameId && user.arcade.games) {
            // Initialize if didn't exist (though schema default should handle it, explicit safety)
            user.arcade.games[gameId] = { streak: 1, lastPlayed: new Date() };
        }

        await user.save();

        // Log activity for heatmap
        await logUserActivity(user._id);

        res.status(200).json({
            success: true,
            data: user.arcade
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Follow a user
// @route     POST /api/v1/users/:id/follow
// @access    Private
exports.followUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, error: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (!userToFollow.followers.includes(req.user.id)) {
            await userToFollow.updateOne({ $push: { followers: req.user.id } });
            await currentUser.updateOne({ $push: { following: req.params.id } });

            return res.status(200).json({ success: true, message: "User followed" });
        } else {
            return res.status(400).json({ success: false, error: "You already follow this user" });
        }
    } catch (err) {
        next(err);
    }
};

// @desc      Unfollow a user
// @route     DELETE /api/v1/users/:id/follow
// @access    Private
exports.unfollowUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, error: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (userToUnfollow.followers.includes(req.user.id)) {
            await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });

            return res.status(200).json({ success: true, message: "User unfollowed" });
        } else {
            return res.status(400).json({ success: false, error: "You dont follow this user" });
        }
    } catch (err) {
        next(err);
    }
};

// @desc      Get public user profile
// @route     GET /api/v1/users/profile/:username
// @access    Public
exports.getPublicUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('username avatar bio socialLinks customLinks followers following arcade activityLogs createdAt');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Fetch public notes for this user
        const publicNotes = await Note.find({ user: user._id, isPublic: true })
            .populate('category', 'name')
            .sort('-createdAt')
            .limit(10);

        // Smart Sync Checklist
        if (user) {
            const userNotes = await Note.find({ user: user._id });
            if (userNotes.length > 0) {
                const logsMap = {};
                user.activityLogs.forEach(log => {
                    logsMap[log.date] = log.count;
                });

                userNotes.forEach(note => {
                    const date = note.createdAt.toISOString().split('T')[0];
                    if (!logsMap[date] || logsMap[date] < 1) {
                        logsMap[date] = (logsMap[date] || 0) + 1;
                    }
                });

                const newLogs = Object.keys(logsMap).map(date => ({
                    date,
                    count: logsMap[date]
                }));

                if (newLogs.length !== user.activityLogs.length) {
                    user.activityLogs = newLogs;
                    await user.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                profile: user,
                recentNotes: publicNotes
            }
        });
    } catch (err) {
        next(err);
    }
};
