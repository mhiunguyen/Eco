const express = require('express');
const {
  getProfile,
  updateProfile,
  getImpact,
  getBadges,
  getLeaderboard,
  uploadAvatar,
  getUserStats
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Impact & Stats routes
router.get('/impact', protect, getImpact);
router.get('/badges', protect, getBadges);
router.get('/stats', protect, getUserStats);

// Leaderboard (public but shows rank if authenticated)
router.get('/leaderboard', optionalAuth, getLeaderboard);

// Avatar upload
router.post('/avatar', protect, uploadAvatar);

module.exports = router;
