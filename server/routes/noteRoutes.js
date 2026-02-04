const express = require('express');
const Note = require('../models/Note');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  exportNotes,
  adminGetNotes,
  cloneNote,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/noteController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Dashboard Stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    const stats = await Note.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});



// Export Route (Must be before /:id to not collide)
router.get('/export', protect, exportNotes);

// Admin Route for all system notes
router.get('/admin/all', protect, authorize('admin'), adminGetNotes);

router
  .route('/')
  .get(protect, getNotes)
  .post(protect, upload.single('file'), createNote);

router.post('/:id/clone', protect, cloneNote);
router.post('/:id/comments', protect, addComment);
router.route('/:id/comments/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

router
  .route('/:id')
  .get(protect, getNote)
  .put(protect, upload.single('file'), updateNote)
  .delete(protect, deleteNote);

module.exports = router;
