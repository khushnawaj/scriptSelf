const Folder = require('../models/Folder');
const Note = require('../models/Note');

// @desc      Get all folders for current user
// @route     GET /api/v1/folders
// @access    Private
exports.getFolders = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found in request' });
        }

        console.log(`[getFolders] DEBUG: Fetching folders for ${req.user._id}`);

        const folders = await Folder.find({ user: req.user._id })
            .sort({ order: 1, createdAt: -1 });

        // Get note count for each folder
        const foldersWithCounts = await Promise.all(
            folders.map(async (folder) => {
                const count = await Note.countDocuments({ folder: folder._id });
                return {
                    ...folder.toObject(),
                    noteCount: count
                };
            })
        );

        res.status(200).json({
            success: true,
            count: folders.length,
            data: foldersWithCounts
        });
    } catch (err) {
        console.error('[getFolders] ERROR:', err);
        res.status(500).json({
            success: false,
            error: err.message || 'Internal Server Error'
        });
    }
};

// @desc      Create new folder
// @route     POST /api/v1/folders
// @access    Private
exports.createFolder = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found in request' });
        }

        req.body.user = req.user._id;

        const folder = await Folder.create(req.body);

        res.status(201).json({
            success: true,
            data: folder
        });
    } catch (err) {
        console.error('[createFolder] ERROR:', err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

// @desc      Update folder
// @route     PUT /api/v1/folders/:id
// @access    Private
exports.updateFolder = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        let folder = await Folder.findById(req.params.id);

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Make sure user owns folder
        if (folder.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this folder'
            });
        }

        folder = await Folder.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: folder
        });
    } catch (err) {
        console.error('[updateFolder] ERROR:', err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

// @desc      Delete folder
// @route     DELETE /api/v1/folders/:id
// @access    Private
exports.deleteFolder = async (req, res, next) => {
    try {
        const folder = await Folder.findById(req.params.id);

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: 'Folder not found'
            });
        }

        // Make sure user owns folder
        if (folder.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this folder'
            });
        }

        // Move notes in this folder to root (folder = null)
        await Note.updateMany(
            { folder: folder._id },
            { $set: { folder: null } }
        );

        await folder.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Move note to folder
// @route     PUT /api/v1/folders/:folderId/notes/:noteId
// @access    Private
exports.moveNoteToFolder = async (req, res, next) => {
    try {
        const { folderId, noteId } = req.params;

        // Verify folder exists and belongs to user
        if (folderId !== 'null') {
            const folder = await Folder.findById(folderId);
            if (!folder || folder.user.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Folder not found or unauthorized'
                });
            }
        }

        // Update note
        const note = await Note.findOneAndUpdate(
            { _id: noteId, user: req.user.id },
            { folder: folderId === 'null' ? null : folderId },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getFolders: exports.getFolders,
    createFolder: exports.createFolder,
    updateFolder: exports.updateFolder,
    deleteFolder: exports.deleteFolder,
    moveNoteToFolder: exports.moveNoteToFolder
};
