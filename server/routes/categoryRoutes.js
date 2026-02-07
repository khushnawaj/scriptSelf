const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Include other resource routers
const noteRouter = require('./noteRoutes');

const router = express.Router();

const { protect, detectUser } = require('../middleware/authMiddleware');

// Re-route into other resource routers
router.use('/:categoryId/notes', noteRouter);

router
  .route('/')
  .get(detectUser, getCategories)
  .post(protect, createCategory);

router
  .route('/:id')
  .get(detectUser, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;
