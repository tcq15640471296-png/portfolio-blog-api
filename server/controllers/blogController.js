const asyncHandler = require('express-async-handler');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

/**
 * @desc    Get all blog posts (newest first), with the author's username
 * @route   GET /api/blog
 * @access  Public
 */
const getPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find()
    .populate('author', 'username email')
    .sort({ createdAt: -1 });

  // Attach the number of comments of each post (useful for the blog list page).
  const withCounts = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    })
  );

  res.status(200).json({
    success: true,
    count: withCounts.length,
    data: withCounts,
  });
});

/**
 * @desc    Get a single blog post, populated with the author and all its comments
 * @route   GET /api/blog/:id
 * @access  Public
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate('author', 'username email bio');

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  // `populate()` on a nested path: comment -> author (username only)
  const comments = await Comment.find({ post: post._id })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { ...post.toObject(), comments },
  });
});

/**
 * @desc    Create a blog post
 * @route   POST /api/blog
 * @access  Private
 * @body    { title, content, tags?, coverImageUrl? }
 */
const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags, coverImageUrl } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide a title and the content of the post');
  }

  const post = await BlogPost.create({
    title,
    content,
    tags,
    coverImageUrl,
    author: req.user._id, // associated with the logged-in user
  });

  res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    data: post,
  });
});

/**
 * @desc    Update a blog post (only the original author may do this)
 * @route   PUT /api/blog/:id
 * @access  Private + Authorized
 *
 * The `authorizeOwner(BlogPost, 'author')` middleware has already loaded the
 * document and stored it in `req.resource`, so it is not queried again here.
 */
const updatePost = asyncHandler(async (req, res) => {
  const post = req.resource || (await BlogPost.findById(req.params.id));

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  const allowed = ['title', 'content', 'tags', 'coverImageUrl'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  });

  const updated = await post.save();

  res.status(200).json({
    success: true,
    message: 'Blog post updated successfully',
    data: updated,
  });
});

/**
 * @desc    Delete a blog post and its comments (only the original author may do this)
 * @route   DELETE /api/blog/:id
 * @access  Private + Authorized
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = req.resource || (await BlogPost.findById(req.params.id));

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  // Cascade delete: remove the comments that belong to the post.
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Blog post deleted successfully',
    data: { _id: req.params.id },
  });
});

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };
