const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validate,
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  emailValidation,
  passwordValidation
} = require('../utils/validators');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgotpassword', emailValidation, validate, forgotPassword);
router.put('/resetpassword/:resetToken', passwordValidation, validate, resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, validate, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, validate, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;
