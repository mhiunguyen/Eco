const express = require('express');
const router = express.Router();

// TODO: Import QR controller when created

// Temporary placeholder routes
router.post('/generate', (req, res) => {
  res.status(501).json({ success: false, message: 'Generate QR endpoint - to be implemented' });
});

router.post('/scan', (req, res) => {
  res.status(501).json({ success: false, message: 'Scan QR endpoint - to be implemented' });
});

module.exports = router;
