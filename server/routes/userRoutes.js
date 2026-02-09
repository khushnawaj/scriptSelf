const express = require('express');
const {
    getUsers,
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
    updateUserGroup
} = require('../controllers/userController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/authMiddleware');

// Public profile access (No auth required)
router.get('/profile/:username', getPublicUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

router.use(protect);

// Public User Routes (Protected)
router.get('/', getUsers);
router.put('/arcade', updateArcadeStats);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

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
