const mongoose = require('mongoose');

/**
 * BlogPost model — a blog article written by a User.
 * `timestamps: true` auto-generates createdAt / updatedAt.
 */
const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog post content is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A blog post must have an author'],
    },
  },
  { timestamps: true }
);

blogPostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
