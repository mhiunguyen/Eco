const express = require('express');
const {
  getWallet,
  getTransactions,
  requestWithdrawal,
  getWithdrawals,
  cancelWithdrawal,
  getWalletStats,
  processWithdrawal
} = require('../controllers/walletController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.get('/stats', getWalletStats);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.delete('/withdrawals/:id', cancelWithdrawal);

// Admin routes
router.put('/withdrawals/:id/process', authorize('admin'), processWithdrawal);

module.exports = router;
