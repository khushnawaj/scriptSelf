const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

require('../models/User');
const Chat = require('../models/Chat');

const testCreate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await mongoose.model('User').findOne();
        if (!user) {
            console.error('No users found to test with');
            process.exit(1);
        }

        const data = {
            sender: user._id,
            message: 'Test attachment message',
            attachment: {
                url: 'https://example.com/test.png',
                name: 'test.png',
                fileType: 'image'
            }
        };

        const newChat = await Chat.create(data);
        console.log('Created Chat with attachment:', JSON.stringify(newChat, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testCreate();
