const User = require('../models/User');

/**
 * Award reputation points to a user based on activity
 * @param {string} userId - ID of the user to reward
 * @param {string} activityType - Type of activity (note, comment, clone, etc)
 * @param {boolean} isDeduction - If true, points will be subtracted
 */
const awardReputation = async (userId, activityType, isDeduction = false) => {
    try {
        const pointsMap = {
            'create_note': 50,
            'add_comment': 10,
            'clone_note': 25,
            'receive_comment': 5,
            'arcade_game': 15
        };

        let points = pointsMap[activityType] || 0;
        if (points === 0) return;

        if (isDeduction) points = -points;

        const user = await User.findById(userId);
        if (!user) return;

        // Apply change but prevent negative reputation
        let newReputation = (user.reputation || 0) + points;
        if (newReputation < 0) newReputation = 0;

        user.reputation = newReputation;
        await user.save();

    } catch (err) {
        console.error('[Reputation-Engine] Failed to update reputation:', err);
    }
};

module.exports = awardReputation;
