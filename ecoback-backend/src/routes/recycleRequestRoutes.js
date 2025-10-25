const express = require('express');
const {
  createRequest,
  getMyRequests,
  getRequest,
  updateRequestStatus,
  assignCollector,
  completePickup,
  getAllRequests,
  getRequestStats
} = require('../controllers/recycleRequestController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createRequest);
router.get('/my-requests', getMyRequests);
router.get('/stats', authorize('admin'), getRequestStats);
router.get('/:id', getRequest);
router.put('/:id/status', updateRequestStatus);

// Collector/Admin routes
router.get('/all', authorize('admin', 'collector'), getAllRequests);
router.put('/:id/assign', authorize('admin', 'collector'), assignCollector);
router.put('/:id/complete', authorize('admin', 'collector'), completePickup);

module.exports = router;
