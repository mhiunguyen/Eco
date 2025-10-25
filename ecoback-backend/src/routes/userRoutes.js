const express = require('express');
const router = express.Router();

// TODO: Import user controller when created

// Temporary placeholder routes
router.get('/profile', (req, res) => {
  res.status(501).json({ success: false, message: 'Get profile endpoint - to be implemented' });
});

router.put('/profile', (req, res) => {
  res.status(501).json({ success: false, message: 'Update profile endpoint - to be implemented' });
});

router.get('/impact', (req, res) => {
  res.status(501).json({ success: false, message: 'Get impact stats endpoint - to be implemented' });
});

module.exports = router;
