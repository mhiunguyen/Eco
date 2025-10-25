const express = require('express');
const router = express.Router();

// TODO: Import transaction controller when created

// Temporary placeholder routes
router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Get transactions endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Create transaction endpoint - to be implemented' });
});

module.exports = router;
