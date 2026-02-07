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
