const SystemSetting = require('../models/SystemSetting');

// @desc      Get all system settings
// @route     GET /api/v1/system/settings
// @access    Private/Admin
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await SystemSetting.find();
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get single system setting
// @route     GET /api/v1/system/settings/:key
// @access    Public
exports.getSetting = async (req, res, next) => {
    try {
        const setting = await SystemSetting.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ success: false, error: 'Setting not found' });
        }
        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update or create system setting
// @route     PUT /api/v1/system/settings/:key
// @access    Private/Admin
exports.updateSetting = async (req, res, next) => {
    try {
        let setting = await SystemSetting.findOne({ key: req.params.key });

        if (setting) {
            setting.value = req.body.value;
            setting.updatedBy = req.user.id;
            await setting.save();
        } else {
            setting = await SystemSetting.create({
                key: req.params.key,
                value: req.body.value,
                updatedBy: req.user.id
            });
        }

        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (err) {
        next(err);
    }
};
