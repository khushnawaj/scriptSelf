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
  deleteComment,
  togglePin,
  shareNote,
  getSharedNotes,
  getNetworkFeed
} = require('../controllers/noteController');

const router = express.Router({ mergeParams: true });

const { protect, authorize, detectUser } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get Network Feed (LinkedIn Style)
router.get('/feed', protect, getNetworkFeed);

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

// Mark answer as solution
router.put('/:id/comments/:commentId/solution', protect, require('../controllers/noteController').markSolution);

// Pin/Unpin Note (Admin)
router.put('/:id/pin', protect, authorize('admin'), togglePin);

// Direct Sharing Routes
router.get('/shared/me', protect, getSharedNotes);
router.put('/:id/share', protect, shareNote);

router
  .route('/')
  .get(detectUser, getNotes)
  .post(protect, upload.single('file'), createNote);

router.post('/:id/clone', protect, cloneNote);
router.post('/:id/comments', protect, addComment);
router.route('/:id/comments/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

router
  .route('/:id')
  .get(detectUser, getNote)
  .put(protect, upload.single('file'), updateNote)
  .delete(protect, deleteNote);

module.exports = router;
