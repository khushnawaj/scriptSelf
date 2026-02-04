const User = require('../models/User');

const logUserActivity = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const user = await User.findById(userId);

        if (!user) return;

        // Check if log for today already exists
        const logIndex = user.activityLogs.findIndex(log => log.date === today);

        if (logIndex > -1) {
            user.activityLogs[logIndex].count += 1;
        } else {
            user.activityLogs.push({ date: today, count: 1 });
        }

        // Keep last 365 days only for performance
        if (user.activityLogs.length > 365) {
            user.activityLogs.shift();
        }

        await user.save();
    } catch (err) {
        console.error('Activity logging failed:', err);
    }
};

module.exports = logUserActivity;
