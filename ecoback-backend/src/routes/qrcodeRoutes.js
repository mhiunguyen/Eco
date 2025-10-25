const express = require('express');
const {
  generateQRBatch,
  scanQRCode,
  activateCashback,
  redeemRecycle,
  getQRBatches,
  getBatchDetails,
  getMyScanHistory,
  getQRStats
} = require('../controllers/qrcodeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes - none

// Protected routes (User)
router.use(protect);

router.post('/scan', scanQRCode);
router.post('/:id/activate-cashback', activateCashback);
router.post('/:id/recycle', redeemRecycle);
router.get('/my-scans', getMyScanHistory);

// Brand owner / Admin routes (temporarily allow all authenticated users for testing)
router.post('/generate', generateQRBatch); // TODO: Add back authorize('brand', 'admin') in production
router.get('/batches', getQRBatches); // TODO: Add back authorize('brand', 'admin') in production
router.get('/batch/:batchId', getBatchDetails); // TODO: Add back authorize('brand', 'admin') in production
router.get('/stats', getQRStats); // TODO: Add back authorize('brand', 'admin') in production

module.exports = router;
