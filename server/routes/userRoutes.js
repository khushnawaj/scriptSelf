const express = require('express');
const {
    getUsers,
    searchUsers,
    getUser,
    deleteUser,
    updateUserRole,
    followUser,
    unfollowUser,
    updateArcadeStats,
    getPublicUser,
    getFollowers,
    getFollowing,
    updateUserFlags,
    updateUserGroup,
    updateUserPreferences,
    getArcadeLeaders,
    getAdminStats,
    endorseSkill
} = require('../controllers/userController');


const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/authMiddleware');

// Public profile access (No auth required)
router.get('/search', searchUsers);
router.get('/arcade/leaders/:gameId', getArcadeLeaders);
router.get('/profile/:username', getPublicUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

router.use(protect);

// Public User Routes (Protected)
router.get('/', getUsers);
router.put('/arcade', updateArcadeStats);
router.put('/preferences', updateUserPreferences);
router.post('/:id/follow', followUser);

router.delete('/:id/follow', unfollowUser);

// Admin Stats
router.get('/admin/stats', authorize('admin'), getAdminStats);

// Endorse Skill
router.put('/:id/skills/:skillId/endorse', endorseSkill);

// Admin Routes for specific users
router.route('/:id')
    .get(authorize('admin'), getUser)
    .delete(authorize('admin'), deleteUser);

router.route('/:id/role')
    .put(authorize('admin'), updateUserRole);

router.route('/:id/flags')
    .put(authorize('admin'), updateUserFlags);

router.route('/:id/group')
    .put(authorize('admin'), updateUserGroup);

module.exports = router;
