const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isGlobal: {
    type: Boolean,
    default: false // Admins can make categories global
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name
categorySchema.pre('save', function(next) {
  // Simple slugify
  this.slug = this.name.toLowerCase().split(' ').join('-');
  next();
});

// Cascade delete notes when a category is deleted
categorySchema.pre('remove', async function(next) {
  await this.model('Note').deleteMany({ category: this._id });
  next();
});

// Reverse populate with virtuals
categorySchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

module.exports = mongoose.model('Category', categorySchema);
