const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get wallet balance and stats
// @route   GET /api/wallet
// @access  Private
exports.getWallet = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('wallet fullName email');

  // Get recent transactions
  const recentTransactions = await Transaction.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(5)
    .populate('relatedProduct', 'name images')
    .populate('relatedQRCode', 'code');

  // Calculate pending withdrawals
  const pendingWithdrawals = await Transaction.aggregate([
    {
      $match: {
        user: user._id,
        type: 'withdrawal',
        status: 'pending'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const pendingAmount = pendingWithdrawals.length > 0 ? pendingWithdrawals[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      balance: user.wallet.balance,
      totalEarned: user.wallet.totalEarned,
      totalWithdrawn: user.wallet.totalWithdrawn,
      pendingWithdrawal: pendingAmount,
      availableForWithdrawal: user.wallet.balance - pendingAmount,
      recentTransactions
    }
  });
});

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = asyncHandler(async (req, res, next) => {
  // Filtering
  const query = { user: req.user.id };

  // Type filter
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Status filter
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Date range filter
  if (req.query.from || req.query.to) {
    query.createdAt = {};
    if (req.query.from) {
      query.createdAt.$gte = new Date(req.query.from);
    }
    if (req.query.to) {
      query.createdAt.$lte = new Date(req.query.to);
    }
  }

  // Amount range filter
  if (req.query.minAmount || req.query.maxAmount) {
    query.amount = {};
    if (req.query.minAmount) {
      query.amount.$gte = parseFloat(req.query.minAmount);
    }
    if (req.query.maxAmount) {
      query.amount.$lte = parseFloat(req.query.maxAmount);
    }
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const total = await Transaction.countDocuments(query);

  const transactions = await Transaction.find(query)
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit)
    .populate('relatedProduct', 'name images price')
    .populate('relatedQRCode', 'code batchName');

  // Calculate summary stats for filtered transactions
  const summary = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    summary,
    data: transactions
  });
});

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
exports.requestWithdrawal = asyncHandler(async (req, res, next) => {
  const { amount, bankInfo } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Số tiền không hợp lệ', 400));
  }

  // Minimum withdrawal amount
  const MIN_WITHDRAWAL = 50000; // 50,000 VND
  if (amount < MIN_WITHDRAWAL) {
    return next(new ErrorResponse(`Số tiền rút tối thiểu là ${MIN_WITHDRAWAL.toLocaleString('vi-VN')} VND`, 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Check if user has enough balance
  if (user.wallet.balance < amount) {
    return next(new ErrorResponse('Số dư không đủ', 400));
  }

  // Check pending withdrawals
  const pendingWithdrawals = await Transaction.find({
    user: req.user.id,
    type: 'withdrawal',
    status: 'pending'
  });

  const pendingAmount = pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0);

  if (user.wallet.balance - pendingAmount < amount) {
    return next(new ErrorResponse('Số dư khả dụng không đủ (có yêu cầu rút tiền đang chờ xử lý)', 400));
  }

  // Validate bank info
  if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
    return next(new ErrorResponse('Vui lòng cung cấp đầy đủ thông tin ngân hàng', 400));
  }

  // Create withdrawal transaction
  const transaction = await Transaction.create({
    user: req.user.id,
    type: 'withdrawal',
    amount,
    description: 'Yêu cầu rút tiền',
    status: 'pending',
    metadata: {
      bankInfo: {
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
        accountName: bankInfo.accountName,
        branch: bankInfo.branch || ''
      }
    }
  });

  res.status(201).json({
    success: true,
    data: transaction,
    message: 'Yêu cầu rút tiền đã được gửi. Chúng tôi sẽ xử lý trong vòng 1-3 ngày làm việc.'
  });
});

// @desc    Get withdrawal requests
// @route   GET /api/wallet/withdrawals
// @access  Private
exports.getWithdrawals = asyncHandler(async (req, res, next) => {
  const status = req.query.status || 'all';

  const query = {
    user: req.user.id,
    type: 'withdrawal'
  };

  if (status !== 'all') {
    query.status = status;
  }

  const withdrawals = await Transaction.find(query)
    .sort('-createdAt')
    .select('amount status description metadata.bankInfo createdAt processedAt');

  res.status(200).json({
    success: true,
    count: withdrawals.length,
    data: withdrawals
  });
});

// @desc    Cancel withdrawal request
// @route   DELETE /api/wallet/withdrawals/:id
// @access  Private
exports.cancelWithdrawal = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse('Không tìm thấy yêu cầu rút tiền', 404));
  }

  // Check ownership
  if (transaction.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Không có quyền hủy yêu cầu này', 403));
  }

  // Can only cancel pending withdrawals
  if (transaction.status !== 'pending') {
    return next(new ErrorResponse('Chỉ có thể hủy yêu cầu đang chờ xử lý', 400));
  }

  transaction.status = 'cancelled';
  transaction.processedAt = new Date();
  await transaction.save();

  res.status(200).json({
    success: true,
    message: 'Đã hủy yêu cầu rút tiền',
    data: transaction
  });
});

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
exports.getWalletStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get stats by transaction type
  const typeStats = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get monthly earnings (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyStats = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: { $in: ['cashback', 'recycle_reward', 'referral_bonus'] },
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Get user wallet info
  const user = await User.findById(userId).select('wallet');

  res.status(200).json({
    success: true,
    data: {
      currentBalance: user.wallet.balance,
      totalEarned: user.wallet.totalEarned,
      totalWithdrawn: user.wallet.totalWithdrawn,
      byType: typeStats,
      monthlyEarnings: monthlyStats
    }
  });
});

// @desc    Admin: Process withdrawal request
// @route   PUT /api/wallet/withdrawals/:id/process
// @access  Private/Admin
exports.processWithdrawal = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  if (!['completed', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Trạng thái không hợp lệ', 400));
  }

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new ErrorResponse('Không tìm thấy giao dịch', 404));
  }

  if (transaction.type !== 'withdrawal') {
    return next(new ErrorResponse('Giao dịch này không phải yêu cầu rút tiền', 400));
  }

  if (transaction.status !== 'pending') {
    return next(new ErrorResponse('Giao dịch này đã được xử lý', 400));
  }

  // Update transaction
  transaction.status = status;
  transaction.processedAt = new Date();
  transaction.processedBy = req.user.id;
  
  if (note) {
    transaction.metadata = {
      ...transaction.metadata,
      adminNote: note
    };
  }

  await transaction.save();

  // If completed, update user wallet
  if (status === 'completed') {
    const user = await User.findById(transaction.user);
    user.wallet.balance -= transaction.amount;
    user.wallet.totalWithdrawn += transaction.amount;
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: status === 'completed' ? 'Đã xử lý yêu cầu rút tiền thành công' : 'Đã từ chối yêu cầu rút tiền',
    data: transaction
  });
});
