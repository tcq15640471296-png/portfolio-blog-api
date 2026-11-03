const mongoose = require('mongoose');

/**
 * Project model — a portfolio project owned by a User.
 * Demonstrates a one-to-many relationship (User -> Projects) via ObjectId ref.
 */
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    repoUrl: {
      type: String,
      default: '',
    },
    liveUrl: {
      type: String,
      default: '',
    },
    techStack: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must belong to a user'],
    },
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
