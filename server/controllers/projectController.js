const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

/**
 * @desc    Get all portfolio projects
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('user', 'username email')
    .sort({ featured: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

/**
 * @desc    Get a single project by id
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('user', 'username email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ success: true, data: project });
});

/**
 * @desc    Create a new project for the logged-in user
 * @route   POST /api/projects
 * @access  Private
 * @body    { title, description, imageUrl?, repoUrl?, liveUrl?, techStack?, featured? }
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, imageUrl, repoUrl, liveUrl, techStack, featured } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Please provide a title and a description');
  }

  const project = await Project.create({
    title,
    description,
    imageUrl,
    repoUrl,
    liveUrl,
    techStack,
    featured,
    user: req.user._id, // associated with the logged-in user
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res) => {
  // Only whitelisted fields can be updated through the API.
  const allowed = ['title', 'description', 'imageUrl', 'repoUrl', 'liveUrl', 'techStack', 'featured'];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const project = await Project.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
    data: { _id: req.params.id },
  });
});

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
