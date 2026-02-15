const crypto = require('crypto');
const User = require('../models/User');
const Note = require('../models/Note');
const sendEmail = require('../services/emailService');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Send welcome email in background to avoid blocking response (SMTP can be slow)
    sendEmail({
      email: user.email,
      subject: 'Welcome to ScriptShelf!',
      message: `Hi ${user.username}, welcome to ScriptShelf - Your personal code snippet and tutorial note-taking companion.`,
      html: `<h1>Welcome to ScriptShelf!</h1><p>Hi ${user.username},</p><p>We're excited to have you on board. Start organizing your code snippets and tutorial notes today!</p>`
    }).catch(err => console.error('Background welcome email failed:', err.message));

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
const safeParse = (str) => {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return str; // Return as is or undefined depending on logic
  }
};

exports.updateDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Simple fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.headline) user.headline = req.body.headline;

    // Complex fields
    if (req.body.socialLinks) user.socialLinks = safeParse(req.body.socialLinks);
    if (req.body.customLinks) user.customLinks = safeParse(req.body.customLinks);
    if (req.body.experience) user.experience = safeParse(req.body.experience);

    // Smart Skills Update (Preserve endorsements)
    if (req.body.skills) {
      const newSkillsList = safeParse(req.body.skills); // Expecting array of strings or objects {name}
      if (Array.isArray(newSkillsList)) {
        const existingSkillsMap = new Map(user.skills.map(s => [s.name, s]));

        user.skills = newSkillsList.map(item => {
          const skillName = typeof item === 'string' ? item : item.name;
          if (existingSkillsMap.has(skillName)) {
            return existingSkillsMap.get(skillName); // Keep existing with endorsements
          }
          return { name: skillName, endorsements: [] }; // New skill
        });
      }
    }

    if (req.file) {
      user.avatar = req.file.path;
    } else if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Update Details Error:', err);
    next(err);
  }
};

// @desc      Forgot Password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    // HTML Message
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to verify it's you.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
        html
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc      Reset Password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = async (req, res, next) => {
  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'none';
  }

  res.cookie('token', 'none', options);

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token (Assuming I'll add getSignedJwtToken to User model OR do it here)
  // Let's do it here for simplicity or update User model. 
  // Wait, good practice is to put it in the model. I should update User model or do it inline.
  // I will do it inline here for now to avoid re-editing the file unless I strictly have to, 
  // BUT the best practice IS the model.
  // Actually, I'll use jwt directly here since I didn't add the method to the schema in the previous turn.
  // Re-reading user request: "Do not write the full frontend yet; focus on the backend architecture first."
  // I will add the method to the User schema in a separate step if needed, but standard jwt.sign is fine here.

  const token = require('jsonwebtoken').sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'none';
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
