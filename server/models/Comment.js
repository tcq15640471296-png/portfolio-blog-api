const mongoose = require('mongoose');

/**
 * Comment model — a comment on a BlogPost written by a User.
 * Demonstrates a double relationship: Comment -> BlogPost and Comment -> User.
 */
const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: [true, 'A comment must belong to a blog post'],
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
