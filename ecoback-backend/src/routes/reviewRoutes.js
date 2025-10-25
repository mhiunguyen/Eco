const express = require('express');
const router = express.Router();

// TODO: Import review controller when created

// Temporary placeholder routes
router.get('/product/:productId', (req, res) => {
  res.status(501).json({ success: false, message: 'Get product reviews endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Create review endpoint - to be implemented' });
});

module.exports = router;
