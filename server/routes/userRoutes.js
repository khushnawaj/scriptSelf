const express = require('express');
const {
    getUsers,
    getUser,
    deleteUser,
    updateUserRole,
    followUser,
    unfollowUser,
    updateArcadeStats,
    getPublicUser
} = require('../controllers/userController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/authMiddleware');

// Public profile access (No auth required)
router.get('/profile/:username', getPublicUser);

router.use(protect);

// Public User Routes (Protected)
router.put('/arcade', updateArcadeStats);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

// Admin Routes
router.route('/')
    .get(authorize('admin'), getUsers);

router.route('/:id')
    .get(authorize('admin'), getUser)
    .delete(authorize('admin'), deleteUser);

router.route('/:id/role')
    .put(authorize('admin'), updateUserRole);

module.exports = router;
