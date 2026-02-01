const User = require('../models/User');
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

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to ScriptShelf!',
        message: `Hi ${user.username}, welcome to ScriptShelf - Your personal code snippet and tutorial note-taking companion.`,
        html: `<h1>Welcome to ScriptShelf!</h1><p>Hi ${user.username},</p><p>We're excited to have you on board. Start organizing your code snippets and tutorial notes today!</p>`
      });
    } catch (err) {
      console.error('Email could not be sent');
    }

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
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    bio: req.body.bio,
    // socialLinks can be JSON string if sent via FormData, parse it
    socialLinks: req.body.socialLinks ? (typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks) : undefined,
    // Parse customLinks similarly
    customLinks: req.body.customLinks ? (typeof req.body.customLinks === 'string' ? JSON.parse(req.body.customLinks) : req.body.customLinks) : undefined
  };

  if (req.file) {
    // Cloudinary storage provides the secure URL in req.file.path
    fieldsToUpdate.avatar = req.file.path;
  } else if (req.body.avatar) {
    // Allow manual URL update if provided and no file
    fieldsToUpdate.avatar = req.body.avatar;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

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
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
