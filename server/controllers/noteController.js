const Note = require('../models/Note');
const fs = require('fs');
const logUserActivity = require('../utils/activityLogger');

// Helper for Bidirectional Linking
const updateBidirectionalLinks = async (noteId, content, userId) => {
  try {
    const linkRegex = /\[\[(.*?)\]\]/g;
    const matches = [...content.matchAll(linkRegex)];
    const linkedTitles = Array.from(new Set(matches.map(m => m[1])));

    if (linkedTitles.length === 0) return;

    const linkedNotes = await Note.find({
      title: { $in: linkedTitles },
      user: userId
    });

    const linkedIds = linkedNotes.map(n => n._id);

    await Note.findByIdAndUpdate(noteId, {
      $addToSet: { relatedNotes: { $each: linkedIds } }
    });

    await Note.updateMany(
      { _id: { $in: linkedIds } },
      { $addToSet: { backlinks: noteId } }
    );
  } catch (err) {
    console.error('Link update failed:', err);
  }
};

// @desc      Get all notes
// @route     GET /api/v1/notes
// @access    Private
exports.getNotes = async (req, res, next) => {
  try {
    let query;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (req.query.public === 'true') {
      // Fetch all public notes
      query = Note.find({ isPublic: true })
        .populate({ path: 'category', select: 'name slug' })
        .populate({ path: 'user', select: 'username avatar' });
    } else {
      // Fetch USER's notes (private + public)
      query = Note.find({ user: req.user.id })
        .populate({ path: 'category', select: 'name slug' });
    }

    // Search Support
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { title: regex },
          { tags: { $in: [regex] } },
          { searchableText: regex }
        ]
      });
    }

    // Default Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }

    // Sort by pinned first, then newest
    query = query.sort('-isPinned -createdAt');

    // Count total for pagination
    const total = await Note.countDocuments(query.getFilter());

    // Apply pagination
    query = query.skip(startIndex).limit(limit);

    const notes = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      pagination,
      data: notes
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Clone a note to user's library
// @route     POST /api/v1/notes/:id/clone
// @access    Private
exports.cloneNote = async (req, res, next) => {
  try {
    const originalNote = await Note.findById(req.params.id);

    if (!originalNote) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Protection: Only clone if public, or you own it, or you are admin
    if (!originalNote.isPublic && originalNote.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to clone this private record' });
    }

    const clonedNote = await Note.create({
      title: `${originalNote.title} (Clone)`,
      content: originalNote.content,
      type: originalNote.type,
      codeSnippet: originalNote.codeSnippet,
      tags: originalNote.tags,
      category: originalNote.category,
      user: req.user.id,
      isPublic: false, // Clones are private by default
      videoUrl: originalNote.videoUrl,
      attachment: originalNote.attachment,
      attachmentUrl: originalNote.attachmentUrl,
      adrStatus: originalNote.adrStatus
    });

    res.status(201).json({
      success: true,
      data: clonedNote
    });

    // Log activity
    await logUserActivity(req.user.id);
  } catch (err) {
    next(err);
  }
};

// @desc      Get single note
// @route     GET /api/v1/notes/:id
// @access    Private / Public (if public)
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'relatedNotes', select: 'title' })
      .populate({ path: 'backlinks', select: 'title' })
      .populate({ path: 'user', select: 'username avatar bio socialLinks' })
      .populate({ path: 'comments.user', select: 'username avatar' });

    if (!note) {
      return res.status(404).json({ success: false, error: `No note found with id ${req.params.id}` });
    }

    if (!note.isPublic && note.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: `Not authorized to view this private note` });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Create note
// @route     POST /api/v1/notes
exports.createNote = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    if (req.params.categoryId) req.body.category = req.params.categoryId;

    if (req.file) {
      req.body.attachment = {
        path: req.file.path, // Cloudinary URL
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      };
      req.body.attachmentUrl = req.file.path;
    }

    // --- DATA SANITIZATION ---
    // Ensure tags is a clean array of strings (flatten nested arrays if any)
    if (req.body.tags) {
      const rawTags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      req.body.tags = rawTags
        .filter(t => t && (typeof t === 'string' || typeof t === 'number'))
        .map(t => String(t).trim())
        .filter(t => t.length > 0);
    }

    // Ensure type is lowercase and trimmed
    if (req.body.type) {
      req.body.type = String(req.body.type).toLowerCase().trim();
    }

    if (!req.body.title) req.body.title = "Untitled Note";

    const note = await Note.create(req.body);

    // Update bidirectional links
    if (req.body.content) {
      await updateBidirectionalLinks(note._id, req.body.content, req.user.id);
    }

    res.status(201).json({
      success: true,
      data: note
    });

    // Log activity
    await logUserActivity(req.user.id);
  } catch (err) {
    next(err);
  }
};

// @desc      Update note
// @route     PUT /api/v1/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: `No note with id ${req.params.id}` });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: `Not authorized to update this note` });
    }

    if (req.body.content || req.body.codeSnippet) {
      if ((req.body.content && req.body.content !== note.content) || (req.body.codeSnippet && req.body.codeSnippet !== note.codeSnippet)) {
        await Note.updateOne(
          { _id: req.params.id },
          {
            $push: {
              history: {
                content: note.content,
                codeSnippet: note.codeSnippet,
                updatedAt: new Date()
              }
            }
          }
        );
      }
    }

    if (req.file) {
      req.body.attachment = {
        path: req.file.path, // Cloudinary URL
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      };
      req.body.attachmentUrl = req.file.path;
    }

    // --- DATA SANITIZATION ---
    if (req.body.tags) {
      const rawTags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      req.body.tags = rawTags
        .filter(t => t && (typeof t === 'string' || typeof t === 'number'))
        .map(t => String(t).trim())
        .filter(t => t.length > 0);
    }

    if (req.body.type) {
      req.body.type = String(req.body.type).toLowerCase().trim();
    }

    console.log(`[API-DEBUG] Updating Note ${req.params.id}. New Type: ${req.body.type}`);

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false // Force success during migration
    });

    // Update bidirectional links
    if (note && req.body.content) {
      await updateBidirectionalLinks(note._id, req.body.content, req.user.id);
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Delete note
// @route     DELETE /api/v1/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: `No note found` });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: `Not authorized to delete this note` });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Export notes as Markdown Bundle (ZIP)
// @route     GET /api/v1/notes/export
// @access    Private
exports.exportNotes = async (req, res, next) => {
  const archiver = require('archiver');

  try {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment('notes-export.zip');
    archive.pipe(res);

    let query = { user: req.user.id };

    if (req.query.category) {
      query.category = req.query.category;
    }

    const notes = await Note.find(query).populate('category');

    for (const note of notes) {
      const safeTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${note.category?.name || 'Uncategorized'}/${safeTitle}.md`;

      let fileContent = `---\ntitle: ${note.title}\ndate: ${note.createdAt}\ntags: [${note.tags.join(', ')}]\ntype: ${note.type}\ncategory: ${note.category?.name || 'General'}\n`;
      if (note.adrStatus) fileContent += `adr_status: ${note.adrStatus}\n`;
      fileContent += `---\n\n`;

      fileContent += `# ${note.title}\n\n`;
      fileContent += `${note.content}\n\n`;

      if (note.codeSnippet) {
        fileContent += `## Code Implementation\n\n\`\`\`javascript\n${note.codeSnippet}\n\`\`\`\n`;
      }

      archive.append(fileContent, { name: filename });
    }

    await archive.finalize();

  } catch (err) {
    next(err);
  }
};

// @desc      Add comment to note
// @route     POST /api/v1/notes/:id/comments
// @access    Private
exports.addComment = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (!note.isPublic && note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Private note' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    note.comments.unshift(comment);

    await note.save();

    // Populate user to return immediate visual feedback
    const populatedNote = await Note.findById(req.params.id)
      .populate({ path: 'comments.user', select: 'username avatar' });

    res.status(201).json({
      success: true,
      data: populatedNote.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Update comment
// @route     PUT /api/v1/notes/:id/comments/:commentId
// @access    Private
exports.updateComment = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const comment = note.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'User not authorized to update this comment' });
    }

    comment.text = req.body.text;

    await note.save();

    // Return full comments list to keep UI in sync
    const populatedNote = await Note.findById(req.params.id)
      .populate({ path: 'comments.user', select: 'username avatar' });

    res.status(200).json({
      success: true,
      data: populatedNote.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Delete comment
// @route     DELETE /api/v1/notes/:id/comments/:commentId
// @access    Private
exports.deleteComment = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const comment = note.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Allow comment author OR Admin OR Note Owner to delete
    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      note.user.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, error: 'User not authorized to delete this comment' });
    }

    comment.deleteOne();

    await note.save();

    const populatedNote = await Note.findById(req.params.id)
      .populate({ path: 'comments.user', select: 'username avatar' });

    res.status(200).json({
      success: true,
      data: populatedNote.comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Get all notes (Admin)
// @route     GET /api/v1/notes/admin/all
// @access    Private/Admin
exports.adminGetNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'user', select: 'username email avatar' })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    next(err);
  }
};