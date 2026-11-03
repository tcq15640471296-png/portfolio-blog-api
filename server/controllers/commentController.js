const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');

/**
 * @desc    Get all comments of a specific blog post
 * @route   GET /api/blog/:postId/comments
 * @access  Public
 */
const getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await BlogPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  const comments = await Comment.find({ post: postId })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  });
});

/**
 * @desc    Create a comment on a blog post
 * @route   POST /api/blog/:postId/comments
 * @access  Private
 * @body    { body }
 */
const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { body } = req.body;

  if (!body || !body.trim()) {
    res.status(400);
    throw new Error('Comment body is required');
  }

  const post = await BlogPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  let comment = await Comment.create({
    body: body.trim(),
    post: post._id,
    author: req.user._id,
  });

  comment = await comment.populate('author', 'username');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment,
  });
});

module.exports = { getCommentsByPost, createComment };
