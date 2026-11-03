const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * protect middleware
 * ---------------------------------------------------------------
 * Verifies the JWT sent in the `Authorization: Bearer <token>` header.
 * On success it attaches the full user document (without the password)
 * to `req.user` and calls next(). Otherwise it answers 401.
 *
 * Usage:  router.post('/', protect, createProject);
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Not authorized, token has expired');
    }
    throw new Error('Not authorized, token is invalid');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, the user belonging to this token no longer exists');
  }

  req.user = user;
  return next();
});

/**
 * authorizeOwner middleware factory
 * ---------------------------------------------------------------
 * Ensures the logged-in user is the author/owner of the requested document.
 * Requires the model and the name of the field that holds the owner id.
 *
 * Usage:  router.put('/:id', protect, authorizeOwner(BlogPost, 'author'), updatePost);
 */
const authorizeOwner = (Model, ownerField = 'author') =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }

    const ownerId = doc[ownerField];
    const isOwner = ownerId && ownerId.toString() === req.user._id.toString();

    if (!isOwner) {
      res.status(403);
      throw new Error(`Not authorized: you are not the ${ownerField} of this ${Model.modelName}`);
    }

    // Hand the already-loaded document to the controller so it is not queried twice.
    req.resource = doc;
    return next();
  });

module.exports = { protect, authorizeOwner };
