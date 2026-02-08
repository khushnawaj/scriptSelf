const Chat = require('../models/Chat');

// @desc      Get chat messages
// @route     GET /api/v1/chat
// @access    Private
exports.getChatMessages = async (req, res, next) => {
    try {
        const { recipientId } = req.query;
        let query = {};

        if (recipientId) {
            // Private chat between two users
            query = {
                $or: [
                    { sender: req.user._id, recipient: recipientId },
                    { sender: recipientId, recipient: req.user._id }
                ]
            };
        } else {
            // Global chat
            query = { recipient: null };
        }

        const messages = await Chat.find(query)
            .populate('sender', 'username avatar')
            .populate('recipient', 'username avatar')
            .sort('-createdAt')
            .limit(50);

        res.status(200).json({
            success: true,
            data: messages.reverse()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Edit a message
// @route     PUT /api/v1/chat/:id
// @access    Private
exports.editMessage = async (req, res, next) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, error: 'Invalid message ID format' });
        }

        const message = await Chat.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Check ownership
        if (message.sender.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to edit this message' });
        }

        // Check 15-minute window
        const timeDiff = (Date.now() - message.createdAt) / 1000 / 60;
        if (timeDiff > 15) {
            return res.status(400).json({ success: false, error: 'Edit window (15 min) expired' });
        }

        message.message = req.body.message || message.message;
        message.isEdited = true;

        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Delete a message
// @route     DELETE /api/v1/chat/:id
// @access    Private (User < 15min OR Admin)
exports.deleteMessage = async (req, res, next) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, error: 'Invalid message ID format' });
        }

        const message = await Chat.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        const isSender = message.sender.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isSender && !isAdmin) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        // Check 15-minute window for non-admins
        if (isSender && !isAdmin) {
            const timeDiff = (Date.now() - message.createdAt) / 1000 / 60;
            if (timeDiff > 15) {
                return res.status(400).json({ success: false, error: 'Delete window (15 min) expired' });
            }
        }

        // Soft delete
        message.isDeleted = true;
        message.message = 'This message was deleted';
        message.attachment = null;

        await message.save();

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
