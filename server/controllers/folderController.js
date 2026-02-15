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

        const folders = await Folder.find({ user: req.user._id })
            .sort({ order: 1, createdAt: -1 })
            .populate('noteCount');

        // Transform into tree if requested
        if (req.query.tree === 'true') {
            const folderMap = {};
            const tree = [];

            folders.forEach(folder => {
                folderMap[folder._id] = { ...folder.toObject(), children: [] };
            });

            folders.forEach(folder => {
                if (folder.parent && folderMap[folder.parent]) {
                    folderMap[folder.parent].children.push(folderMap[folder._id]);
                } else {
                    tree.push(folderMap[folder._id]);
                }
            });

            return res.status(200).json({
                success: true,
                count: tree.length,
                data: tree
            });
        }

        res.status(200).json({
            success: true,
            count: folders.length,
            data: folders
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Create new folder
// @route     POST /api/v1/folders
// @access    Private
exports.createFolder = async (req, res, next) => {
    try {
        req.body.user = req.user._id;

        // If parent folder is specified, check if it exists and belongs to user
        if (req.body.parent) {
            const parentFolder = await Folder.findById(req.body.parent);
            if (!parentFolder || parentFolder.user.toString() !== req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parent folder'
                });
            }
        }

        const folder = await Folder.create(req.body);

        res.status(201).json({
            success: true,
            data: folder
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update folder
// @route     PUT /api/v1/folders/:id
// @access    Private
exports.updateFolder = async (req, res, next) => {
    try {
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

        // Prevent circular dependency if parent is being updated
        if (req.body.parent && req.body.parent === req.params.id) {
            return res.status(400).json({
                success: false,
                message: 'Folder cannot be its own parent'
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
        next(err);
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

        // Handle subfolders - move them to root or delete them?
        // Let's move them to the parent of this folder
        await Folder.updateMany(
            { parent: folder._id },
            { $set: { parent: folder.parent } }
        );

        // Move notes in this folder to the parent folder
        await Note.updateMany(
            { folder: folder._id },
            { $set: { folder: folder.parent } }
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

// @desc      Reorder folders
// @route     PUT /api/v1/folders/reorder
// @access    Private
exports.reorderFolders = async (req, res, next) => {
    try {
        const { folderIds } = req.body; // Array of IDs in new order

        if (!Array.isArray(folderIds)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of folder IDs'
            });
        }

        const updates = folderIds.map((id, index) => {
            return Folder.updateOne(
                { _id: id, user: req.user.id },
                { $set: { order: index } }
            );
        });

        await Promise.all(updates);

        res.status(200).json({
            success: true,
            message: 'Folders reordered successfully'
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
    moveNoteToFolder: exports.moveNoteToFolder,
    reorderFolders: exports.reorderFolders
};
