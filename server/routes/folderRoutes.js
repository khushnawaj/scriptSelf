const express = require('express');
const {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    reorderFolders
} = require('../controllers/folderController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// All folder routes require authentication
router.use(protect);

router.route('/')
    .get(getFolders)
    .post(createFolder);

router.put('/reorder', reorderFolders);

router.route('/:id')
    .put(updateFolder)
    .delete(deleteFolder);

router.put('/:folderId/notes/:noteId', moveNoteToFolder);

module.exports = router;
