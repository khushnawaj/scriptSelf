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

const { protect } = require('../middleware/authMiddleware');

// Re-route into other resource routers
router.use('/:categoryId/notes', noteRouter);

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
