const express = require('express');
const {
    getUsers,
    getUser,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // All routes restricted to admin

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .delete(deleteUser);

module.exports = router;
