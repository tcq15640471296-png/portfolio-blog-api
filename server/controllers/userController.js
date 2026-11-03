const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (Admin / blog author)
 * @route   POST /api/users/register
 * @access  Public
 * @body    { username, email, password, bio? }
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, bio } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide username, email and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }],
  });

  if (existingUser) {
    res.status(400);
    throw new Error('A user with that email or username already exists');
  }

  // The password is hashed automatically by the pre-save hook in models/User.js
  const user = await User.create({ username, email, password, bio });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    },
  });
});

/**
 * @desc    Authenticate a user and return a JWT
 * @route   POST /api/users/login
 * @access  Public
 * @body    { email, password }
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // `password` is excluded from queries by default -> add it back explicitly.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    },
  });
});

/**
 * @desc    Get the currently logged-in user (used by the front-end on reload)
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      bio: req.user.bio,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * @desc    Get the public portfolio profile (owner info shown on the Home page)
 * @route   GET /api/users/profile
 * @access  Public
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const owner = await User.findOne().sort({ createdAt: 1 });

  if (!owner) {
    res.status(404);
    throw new Error('No profile has been created yet');
  }

  res.status(200).json({
    success: true,
    data: {
      _id: owner._id,
      username: owner.username,
      bio: owner.bio,
      headline: owner.headline,
      skills: owner.skills,
      social: owner.social,
      memberSince: owner.createdAt,
    },
  });
});

/**
 * @desc    Update the profile of the logged-in user (bio, headline, skills, links)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { bio, headline, skills, social } = req.body;

  if (bio !== undefined) user.bio = bio;
  if (headline !== undefined) user.headline = headline;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : String(skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  }
  if (social !== undefined) {
    user.social = {
      github: social.github ?? user.social?.github ?? '',
      linkedin: social.linkedin ?? user.social?.linkedin ?? '',
    };
  }

  const updated = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      bio: updated.bio,
      headline: updated.headline,
      skills: updated.skills,
      social: updated.social,
    },
  });
});

module.exports = { registerUser, loginUser, getMe, getPublicProfile, updateProfile };
