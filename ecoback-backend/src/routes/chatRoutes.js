const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChat,
  getUserSessions
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/message', sendMessage);
router.get('/history/:sessionId', getChatHistory);
router.delete('/session/:sessionId', clearChat);

// Protected routes
router.get('/sessions', protect, getUserSessions);

module.exports = router;
