const express = require('express');
const router = express.Router();
const {
  getBrands,
  getFeaturedBrands,
  getBrand,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  getMyBrand
} = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getBrands);
router.get('/featured', getFeaturedBrands);
router.get('/slug/:slug', getBrandBySlug);
router.get('/:id', getBrand);

// Protected routes
router.get('/me/info', protect, authorize('brand'), getMyBrand);
router.post('/', protect, authorize('brand', 'admin'), createBrand);
router.put('/:id', protect, authorize('brand', 'admin'), updateBrand);
router.delete('/:id', protect, authorize('brand', 'admin'), deleteBrand);

module.exports = router;
