const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getGreenProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductStats
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/green', getGreenProducts);
router.get('/categories/list', getCategories);
router.get('/stats/overview', protect, authorize('admin'), getProductStats);
router.get('/:id', getProduct);

// Protected routes (Brand/Admin only)
router.post('/', protect, authorize('brand', 'admin'), createProduct);
router.put('/:id', protect, authorize('brand', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('brand', 'admin'), deleteProduct);

module.exports = router;
