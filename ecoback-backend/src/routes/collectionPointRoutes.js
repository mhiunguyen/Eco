const express = require('express');
const {
  getCollectionPoints,
  getNearbyPoints,
  getCollectionPoint,
  createCollectionPoint,
  updateCollectionPoint,
  deleteCollectionPoint,
  recordDropoff,
  getPointStats
} = require('../controllers/collectionPointController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCollectionPoints);
router.get('/nearby', getNearbyPoints);
router.get('/:id', getCollectionPoint);
router.get('/:id/stats', getPointStats);

// Protected routes
router.post('/:id/dropoff', protect, recordDropoff);

// Admin/Manager routes
router.post('/', protect, authorize('admin', 'collector'), createCollectionPoint);
router.put('/:id', protect, authorize('admin', 'collector'), updateCollectionPoint);
router.delete('/:id', protect, authorize('admin'), deleteCollectionPoint);

module.exports = router;
