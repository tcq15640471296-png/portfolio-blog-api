const express = require('express');
const { createMessage, getMessages, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createMessage); // public — portfolio contact form
router.get('/', protect, getMessages); // private — admin inbox
router.delete('/:id', protect, deleteMessage); // private

module.exports = router;
