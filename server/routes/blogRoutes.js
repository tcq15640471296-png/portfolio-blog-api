const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/blogController');
const { getCommentsByPost, createComment } = require('../controllers/commentController');
const { protect, authorizeOwner } = require('../middleware/authMiddleware');
const BlogPost = require('../models/BlogPost');

const router = express.Router();

// ---------------------------------------------------------------
// Comments (nested resource) — declared before "/:id" for clarity
// ---------------------------------------------------------------
router.get('/:postId/comments', getCommentsByPost); // public
router.post('/:postId/comments', protect, createComment); // private

// ---------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------
router.get('/', getPosts); // public
router.get('/:id', getPostById); // public
router.post('/', protect, createPost); // private

// The author check is delegated to the authorizeOwner middleware:
// 401 if there is no valid token, 403 if the logged-in user is not the author.
router.put('/:id', protect, authorizeOwner(BlogPost, 'author'), updatePost);
router.delete('/:id', protect, authorizeOwner(BlogPost, 'author'), deletePost);

module.exports = router;
