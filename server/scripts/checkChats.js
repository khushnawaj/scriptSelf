const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

require('../models/User'); // Register User model
const Chat = require('../models/Chat');

const checkMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const messages = await Chat.find().sort('-createdAt').limit(5).populate('sender', 'username');
        console.log('--- LATEST MESSAGES ---');
        messages.forEach(m => {
            console.log(`From: ${m.sender?.username}, Msg: ${m.message}, Attachment: ${JSON.stringify(m.attachment)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkMessages();
