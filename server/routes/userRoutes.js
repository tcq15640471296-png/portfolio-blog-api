const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  getPublicProfile,
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser); // public
router.post('/login', loginUser); // public
router.get('/profile', getPublicProfile); // public — Home page "About me" block
router.put('/profile', protect, updateProfile); // private
router.get('/me', protect, getMe); // private

module.exports = router;
