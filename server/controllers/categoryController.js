const Category = require('../models/Category');

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Private (or Public for global ones)
exports.getCategories = async (req, res, next) => {
  try {
    // Find categories that are either global OR created by the current user
    const categories = await Category.find({
      $or: [{ isGlobal: true }, { createdBy: req.user.id }]
    }).populate('notes');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Get a single category
// @route     GET /api/v1/categories/:id
// @access    Private
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('notes');

    if (!category) {
      return res.status(404).json({ success: false, error: `No category with the id of ${req.params.id}` });
    }

    // Access control: Allow if global or owned by user
    if (!category.isGlobal && category.createdBy.toString() !== req.user.id) {
       return res.status(403).json({ success: false, error: `Not authorized to access this category` });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Create new category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Only admin can create global categories
    if (req.body.isGlobal && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: `Not authorized to create global categories` });
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Update category
// @route     PUT /api/v1/categories/:id
// @access    Private
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: `No category with the id of ${req.params.id}` });
    }

    // Make sure user is category owner or admin (if global)
    if (category.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: `Not authorized to update this category` });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc      Delete category
// @route     DELETE /api/v1/categories/:id
// @access    Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
       return res.status(404).json({ success: false, error: `No category with the id of ${req.params.id}` });
    }

    // Make sure user is category owner
    // Note: If it's a global category, maybe only admin should delete?
    // Current logic: only creator can delete.
    if (category.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: `Not authorized to delete this category` });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
