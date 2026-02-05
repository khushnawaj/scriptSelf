const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Note = require('../models/Note');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const syncReputation = async () => {
    try {
        console.log('🚀 Starting Reputation Sync...');

        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to Database.');

        const users = await User.find();
        console.log(`👥 Found ${users.length} users to sync.`);

        for (const user of users) {
            let totalRep = 0;

            // 1. Calculate points for notes created
            const noteCount = await Note.countDocuments({ user: user._id });
            totalRep += noteCount * 50;

            // 2. Calculate points for comments made on OTHERS' notes
            // We need to find all notes where this user commented, but doesn't own the note
            const notesWithUserComments = await Note.find({
                'comments.user': user._id,
                user: { $ne: user._id }
            });

            notesWithUserComments.forEach(note => {
                const userCommentsCount = note.comments.filter(c => c.user.toString() === user._id.toString()).length;
                totalRep += userCommentsCount * 10;
            });

            // 3. Calculate points for comments received from OTHERS
            const userOwnedNotes = await Note.find({ user: user._id });
            userOwnedNotes.forEach(note => {
                const externalCommentsCount = note.comments.filter(c => c.user.toString() !== user._id.toString()).length;
                totalRep += externalCommentsCount * 5;
            });

            // 4. Update the user
            user.reputation = totalRep;
            await user.save();

            console.log(`✅ Synced ${user.username}: ${totalRep} XP (Notes: ${noteCount})`);
        }

        console.log('✨ Reputation Sync Complete.');
        process.exit();
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
};

syncReputation();
