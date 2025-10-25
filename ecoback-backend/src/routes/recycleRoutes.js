const express = require('express');
const router = express.Router();

// TODO: Import recycle controller when created

// Temporary placeholder routes
router.get('/requests', (req, res) => {
  res.status(501).json({ success: false, message: 'Get recycle requests endpoint - to be implemented' });
});

router.post('/request', (req, res) => {
  res.status(501).json({ success: false, message: 'Create recycle request endpoint - to be implemented' });
});

module.exports = router;
