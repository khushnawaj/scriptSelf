const User = require('../models/User');
const Note = require('../models/Note');
const logUserActivity = require('../utils/activityLogger');
const notificationService = require('../services/notificationService');

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

// @desc      Search/filter users for discovery
// @route     GET /api/v1/users/search
// @access    Public
exports.searchUsers = async (req, res, next) => {
    try {
        const { q, tier, active, sort = 'reputation' } = req.query;

        let query = {};

        // Search by username or bio
        if (q) {
            query.$or = [
                { username: { $regex: q, $options: 'i' } },
                { bio: { $regex: q, $options: 'i' } }
            ];
        }

        // Filter by reputation tier
        if (tier) {
            const tierRanges = {
                'beginner': { min: 0, max: 99 },
                'intermediate': { min: 100, max: 499 },
                'advanced': { min: 500, max: 999 },
                'expert': { min: 1000, max: 2499 },
                'legendary': { min: 2500, max: Infinity }
            };

            const range = tierRanges[tier.toLowerCase()];
            if (range) {
                query.reputation = { $gte: range.min, $lte: range.max };
            }
        }

        // Filter by active status (played in last 7 days)
        if (active === 'true') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query['arcade.lastPlayed'] = { $gte: sevenDaysAgo };
        }

        // Determine sort order
        let sortOption = {};
        switch (sort) {
            case 'reputation':
                sortOption = { reputation: -1 };
                break;
            case 'streak':
                sortOption = { 'arcade.streak': -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'alphabetical':
                sortOption = { username: 1 };
                break;
            default:
                sortOption = { reputation: -1 };
        }

        const users = await User.find(query)
            .select('username avatar bio reputation arcade.streak arcade.lastPlayed followers following createdAt')
            .sort(sortOption)
            .limit(100); // Limit to 100 results

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

        // Prevent self-deletion
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, error: 'You cannot delete yourself' });
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

            // Trigger Notification
            await notificationService.sendNotification({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow',
                message: `${currentUser.username} started following you.`,
                link: `/u/${currentUser.username}`
            });

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

// @desc      Get followers of a user
// @route     GET /api/v1/users/:id/followers
// @access    Public
exports.getFollowers = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username avatar bio');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.status(200).json({
            success: true,
            count: user.followers.length,
            data: user.followers
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get following of a user
// @route     GET /api/v1/users/:id/following
// @access    Public
exports.getFollowing = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username avatar bio');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.status(200).json({
            success: true,
            count: user.following.length,
            data: user.following
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update user feature flags
// @route     PUT /api/v1/users/:id/flags
// @access    Private/Admin
exports.updateUserFlags = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.featureFlags = req.body.flags;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc      Update user experiment group
// @route     PUT /api/v1/users/:id/group
// @access    Private/Admin
exports.updateUserGroup = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.experimentGroup = req.body.group;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc      Update user preferences
// @route     PUT /api/v1/users/preferences
// @access    Private
exports.updateUserPreferences = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.preferences = { ...user.preferences, ...req.body.preferences };
        await user.save();

        res.status(200).json({ success: true, data: user.preferences });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUsers: exports.getUsers,
    searchUsers: exports.searchUsers,
    getUser: exports.getUser,
    deleteUser: exports.deleteUser,
    updateUserRole: exports.updateUserRole,
    updateArcadeStats: exports.updateArcadeStats,
    followUser: exports.followUser,
    unfollowUser: exports.unfollowUser,
    getPublicUser: exports.getPublicUser,
    getFollowers: exports.getFollowers,
    getFollowing: exports.getFollowing,
    updateUserFlags: exports.updateUserFlags,
    updateUserGroup: exports.updateUserGroup,
    updateUserPreferences: exports.updateUserPreferences,
    getArcadeLeaders: exports.getArcadeLeaders
};

// @desc      Get arcade game leaders (minimal top 3)
// @route     GET /api/v1/users/arcade/leaders/:gameId
// @access    Public
exports.getArcadeLeaders = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const validGames = ['memory', 'typing', 'escape', 'hunter'];

        if (!validGames.includes(gameId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid game ID'
            });
        }

        // Get top 3 players by total arcade points (more visible than streak)
        const leaders = await User.find({
            'arcade.points': { $gt: 0 }
        })
            .select('username avatar arcade.points arcade.streak')
            .sort({ 'arcade.points': -1 })
            .limit(3);

        const formattedLeaders = leaders.map(user => ({
            username: user.username,
            avatar: user.avatar,
            points: user.arcade.points,
            streak: user.arcade.streak
        }));

        res.status(200).json({
            success: true,
            data: formattedLeaders
        });
    } catch (err) {
        next(err);
    }
};

