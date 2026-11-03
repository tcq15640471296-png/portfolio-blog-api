const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

/**
 * @desc    Save a message coming from the public portfolio contact form
 * @route   POST /api/contact
 * @access  Public
 * @body    { name, email, message }
 */
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please provide your name, email and message');
  }

  const saved = await Message.create({ name, email, message });

  res.status(201).json({
    success: true,
    message: 'Thanks for reaching out! Your message has been received.',
    data: {
      _id: saved._id,
      name: saved.name,
      email: saved.email,
      createdAt: saved.createdAt,
    },
  });
});

/**
 * @desc    List all received messages (inbox of the Admin Dashboard)
 * @route   GET /api/contact
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

/**
 * @desc    Delete a received message
 * @route   DELETE /api/contact/:id
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error('Message not found');
  }

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
    data: { _id: req.params.id },
  });
});

module.exports = { createMessage, getMessages, deleteMessage };
