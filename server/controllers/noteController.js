const Note = require('../models/Note');
const User = require('../models/User');
const fs = require('fs');
const logUserActivity = require('../utils/activityLogger');
const awardReputation = require('../utils/reputationEngine');
const notificationService = require('../services/notificationService');

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

// Helper: Process Mentions
const processMentions = async (note, content, senderId) => {
  try {
    const mentionRegex = /@(\w+)/g;
    const matches = [...content.matchAll(mentionRegex)];
    const usernames = [...new Set(matches.map(m => m[1]))]; // Unique usernames

    if (usernames.length === 0) return [];

    const users = await User.find({ username: { $in: usernames } });
    const userIds = users.map(u => u._id);

    if (userIds.length > 0) {
      // Update note mentions
      await Note.findByIdAndUpdate(note._id, {
        $addToSet: { mentions: { $each: userIds } }
      });

      // Send notifications
      for (const user of users) {
        if (user._id.toString() !== senderId.toString()) {
          await notificationService.sendNotification({
            recipient: user._id,
            sender: senderId,
            type: 'mention',
            message: `${note.user.username || 'Someone'} mentioned you in: ${note.title}`,
            link: `/notes/${note._id}`
          });
        }
      }
    }
    return userIds;
  } catch (err) {
    console.error('Mention processing error:', err);
    return [];
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

    const filter = {};

    // 1. Access Level & Scope
    if (req.query.type === 'issue') {
      // Issues are a global public board
      filter.type = 'issue';
    } else if (req.query.public === 'true') {
      // Explicitly requesting public notes (from everyone)
      filter.isPublic = true;
    } else if (req.query.public === 'false' && req.user) {
      // Explicitly requesting private notes (only mine)
      filter.isPublic = false;
      filter.user = req.user._id;
    } else if (req.user) {
      // Default: My notes (Public + Private)
      filter.user = req.user._id;
    } else {
      // Guest user requesting non- public data -> Return empty
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        pagination: {},
        data: []
      });
    }

    // 2. Category Filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // 2.5 Folder Filter
    let folderParam = req.query.folder;
    if (Array.isArray(folderParam)) folderParam = folderParam[0];

    if (folderParam && folderParam !== 'null' && folderParam !== 'undefined') {
      filter.folder = folderParam;
    }

    // 3. Type Filter
    let typeParam = req.query.type;
    if (Array.isArray(typeParam)) typeParam = typeParam[0];

    if (typeParam === 'issue') {
      filter.type = 'issue';
    } else if (typeParam) {
      filter.type = typeParam;
    } else {
      // Default: Exclude issues from the technical library/general feed
      filter.type = { $ne: 'issue' };
    }

    query = Note.find(filter)
      .populate({ path: 'category', select: 'name slug' })
      .populate({ path: 'user', select: 'username avatar' });

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
    console.error('[getNotes] ERROR:', err);
    res.status(400).json({
      success: false,
      error: err.message || 'Notes fetch failed'
    });
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

    const { folderId } = req.body;

    const clonedNote = await Note.create({
      title: `${originalNote.title} (Clone)`,
      content: originalNote.content,
      type: originalNote.type,
      codeSnippet: originalNote.codeSnippet,
      tags: originalNote.tags,
      category: originalNote.category,
      user: req.user.id,
      folder: folderId || undefined,
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

    // Log activity & Award Points
    await logUserActivity(req.user.id);
    if (originalNote.user.toString() !== req.user.id) {
      await awardReputation(req.user.id, 'clone_note');
    }
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
      .populate({ path: 'folder', select: 'name' })
      .populate({ path: 'mentions', select: 'username' })
      .populate({ path: 'relatedNotes', select: 'title' })
      .populate({ path: 'backlinks', select: 'title' })
      .populate({ path: 'user', select: 'username avatar bio socialLinks reputation' })
      .populate({ path: 'comments.user', select: 'username avatar' });

    if (!note) {
      return res.status(404).json({ success: false, error: `No note found with id ${req.params.id}` });
    }

    // Access Rules:
    // 1. Note is Public -> Allow
    // 2. Note is Type 'issue' -> Allow
    // 3. User is Owner -> Allow
    // 4. Admin -> Allow (implied if we added admin check, but simple owner check here)

    const isPublic = note.isPublic || note.type === 'issue';
    const isOwner = req.user && note.user._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    const isSharedWithMe = req.user && note.sharedWith?.includes(req.user.id);

    if (!isPublic && !isOwner && !isAdmin && !isSharedWithMe) {
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
      if (Array.isArray(req.body.type)) req.body.type = req.body.type[0];
      req.body.type = String(req.body.type).toLowerCase().trim();
    }

    // Ensure folder is a single string
    if (req.body.folder) {
      if (Array.isArray(req.body.folder)) req.body.folder = req.body.folder[0];
      if (req.body.folder === 'null' || req.body.folder === 'undefined') {
        req.body.folder = null;
      }
    }

    if (!req.body.title) req.body.title = "Untitled Note";

    console.log(`[API] Creating Note. User: ${req.user.id}, Folder: ${req.body.folder}, Type: ${req.body.type}`);
    const note = await Note.create(req.body);

    if (req.body.content) {
      await updateBidirectionalLinks(note._id, req.body.content, req.user.id);

      // Process Mentions
      // Load user details for notification message
      const populatedNote = await Note.findById(note._id).populate('user', 'username');
      await processMentions(populatedNote, req.body.content, req.user.id);
    }

    res.status(201).json({
      success: true,
      data: note
    });

    // Log activity & Award Points
    await logUserActivity(req.user.id);
    await awardReputation(req.user.id, 'create_note');
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
      if (Array.isArray(req.body.type)) req.body.type = req.body.type[0];
      req.body.type = String(req.body.type).toLowerCase().trim();
    }

    if (req.body.folder) {
      if (Array.isArray(req.body.folder)) req.body.folder = req.body.folder[0];
      if (req.body.folder === 'null' || req.body.folder === 'undefined') {
        req.body.folder = null;
      }
    }

    console.log(`[API-DEBUG] Updating Note ${req.params.id}. New Type: ${req.body.type}`);

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false // Force success during migration
    });

    // Update bidirectional links
    if (note && req.body.content) {
      await updateBidirectionalLinks(note._id, req.body.content, req.user.id);

      // Process Mentions
      const populatedNote = await Note.findById(note._id).populate('user', 'username');
      await processMentions(populatedNote, req.body.content, req.user.id);
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

    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: `Not authorized to delete this note` });
    }

    await note.deleteOne();

    // Deduct Reputation Points
    await awardReputation(req.user.id, 'create_note', true);

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

    if (!note.isPublic && note.type !== 'issue' && note.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Private record contribution forbidden' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    note.comments.unshift(comment);

    await note.save();

    // Award Points: Only if commenting on someone else's note
    if (note.user.toString() !== req.user.id) {
      await awardReputation(req.user.id, 'add_comment'); // Commenter gets 10
      await awardReputation(note.user, 'receive_comment'); // Note Owner gets 5

      // Trigger Notification
      await notificationService.sendNotification({
        recipient: note.user,
        sender: req.user.id,
        type: 'comment',
        message: `${req.user.username} commented on your note: ${note.title}`,
        link: `/notes/${note._id}`
      });
    }

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

    // Deduct reputation points if this wasn't a self-comment
    if (note.user.toString() !== comment.user.toString()) {
      await awardReputation(comment.user, 'add_comment', true);
      await awardReputation(note.user, 'receive_comment', true);
    }

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

// @desc      Mark comment as solution
// @route     PUT /api/v1/notes/:id/comments/:commentId/solution
// @access    Private (Owner Only)
exports.markSolution = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Only Note Owner or Admin can mark solution
    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to select solution' });
    }

    const comment = note.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }

    // Toggle solution status
    // First unmark any other solutions? Usually only one solution allowed.
    note.comments.forEach(c => c.isSolution = false);

    comment.isSolution = true;

    await note.save();

    // Award Rep to Solution Author
    if (comment.user.toString() !== req.user.id) {
      await awardReputation(comment.user, 'mark_solution', true); // Custom rep for solution?
    }

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Note.countDocuments();
    const notes = await Note.find()
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'user', select: 'username email avatar' })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const pagination = {};
    if (startIndex + notes.length < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.previous = { page: page - 1, limit };
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

// @desc      Toggle pin status of a note
// @route     PUT /api/v1/notes/:id/pin
// @access    Private/Admin
exports.togglePin = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to pin notes' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Share note with users
// @route     PUT /api/v1/notes/:id/share
// @access    Private
exports.shareNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to share this note' });
    }

    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of userIds' });
    }

    note.sharedWith = userIds;
    await note.save();

    res.status(200).json({
      success: true,
      data: note
    });

    // Notify recipients
    const Notification = require('../models/Notification');
    const User = require('../models/User');

    const recipients = await User.find({ _id: { $in: userIds } });

    for (const recipient of recipients) {
      if (recipient._id.toString() !== req.user.id) {
        await notificationService.sendNotification({
          recipient: recipient._id,
          sender: req.user.id,
          type: 'share',
          message: `${req.user.username} shared a technical record with you: ${note.title}`,
          link: `/notes/${note._id}`
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

// @desc      Get notes shared with me
// @route     GET /api/v1/notes/shared/me
// @access    Private
exports.getSharedNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ sharedWith: req.user.id })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'user', select: 'username avatar' })
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

// @desc      Get network feed (notes from followed users)
// @route     GET /api/v1/notes/feed
// @access    Private
exports.getNetworkFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const following = user.following;

    // Add self to feed? Maybe. Let's include self for now so the feed isn't empty for new users.
    const authors = [...following, req.user.id];

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {
      user: { $in: authors },
      $or: [
        { isPublic: true },
        { user: req.user.id } // Private notes only from self
      ]
    };

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('user', 'username avatar headline') // Include headline
      .populate('category', 'name color') // Include category color
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const pagination = {};
    if (startIndex + notes.length < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.previous = { page: page - 1, limit };
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
