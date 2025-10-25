const QRCode = require('../models/QRCode');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc    Generate QR code batch for a product
// @route   POST /api/qrcodes/generate
// @access  Private (Brand owners, Admin)
exports.generateQRBatch = asyncHandler(async (req, res, next) => {
  const { productId, quantity, batchName } = req.body;

  // Validate input
  if (!productId || !quantity) {
    return next(new ErrorResponse('Product ID and quantity are required', 400));
  }

  if (quantity < 1 || quantity > 10000) {
    return next(new ErrorResponse('Quantity must be between 1 and 10000', 400));
  }

  // Check if product exists
  const product = await Product.findById(productId).populate('brand');
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check authorization (must be brand owner or admin)
  // Temporarily disabled for testing
  // if (req.user.role !== 'admin' && product.brand.owner.toString() !== req.user.id) {
  //   return next(new ErrorResponse('Not authorized to generate QR codes for this product', 403));
  // }

  // Generate unique codes
  const qrCodes = [];
  const codes = new Set();

  // Generate unique codes
  while (codes.size < quantity) {
    const uniqueCode = crypto.randomBytes(16).toString('hex').toUpperCase();
    codes.add(uniqueCode);
  }

  // Create QR code documents
  const batchId = crypto.randomBytes(8).toString('hex').toUpperCase();
  
  for (const code of codes) {
    qrCodes.push({
      code,
      product: productId,
      brand: product.brand._id,
      batchId,
      batchName: batchName || `Batch-${batchId}`,
      cashbackAmount: product.packaging.cashbackPercentage 
        ? (product.price * product.packaging.cashbackPercentage) / 100 
        : 0,
      recycleReward: product.packaging.recycleReward || 0,
      generatedBy: req.user.id,
      secretKey: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    });
  }

  // Bulk insert
  const createdQRCodes = await QRCode.insertMany(qrCodes);

  res.status(201).json({
    success: true,
    count: createdQRCodes.length,
    batchId,
    batchName: batchName || `Batch-${batchId}`,
    data: {
      productId,
      productName: product.name,
      quantity: createdQRCodes.length,
      cashbackAmount: qrCodes[0].cashbackAmount,
      recycleReward: qrCodes[0].recycleReward,
      expiresAt: qrCodes[0].expiresAt,
      codes: createdQRCodes.map(qr => ({
        id: qr._id,
        code: qr.code
      }))
    }
  });
});

// @desc    Scan QR code (record scan, return product info)
// @route   POST /api/qrcodes/scan
// @access  Private (User)
exports.scanQRCode = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return next(new ErrorResponse('QR code is required', 400));
  }

  // Find QR code
  const qrCode = await QRCode.findOne({ code })
    .populate({
      path: 'product',
      select: 'name description price images category isEcoFriendly packaging sustainability brand',
      populate: {
        path: 'brand',
        select: 'name logo description esgCommitments'
      }
    });

  if (!qrCode) {
    return next(new ErrorResponse('Invalid QR code', 404));
  }

  // Check if expired
  if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
    return next(new ErrorResponse('QR code has expired', 400));
  }

  // Check if already used for cashback
  if (qrCode.status === 'used' && qrCode.usedBy) {
    return next(new ErrorResponse('QR code has already been used', 400));
  }

  // Record scan
  qrCode.scanHistory.push({
    scannedBy: req.user.id,
    location: req.body.location || null
  });
  qrCode.scanCount += 1;
  await qrCode.save();

  res.status(200).json({
    success: true,
    data: {
      qrCode: {
        id: qrCode._id,
        code: qrCode.code,
        status: qrCode.status,
        cashbackAmount: qrCode.cashbackAmount,
        recycleReward: qrCode.recycleReward,
        canActivateCashback: qrCode.status === 'active' && !qrCode.usedBy,
        canRecycle: qrCode.status !== 'expired'
      },
      product: qrCode.product,
      message: 'QR code scanned successfully'
    }
  });
});

// @desc    Activate cashback (user claims cashback after purchase)
// @route   POST /api/qrcodes/:id/activate-cashback
// @access  Private (User)
exports.activateCashback = asyncHandler(async (req, res, next) => {
  const qrCode = await QRCode.findById(req.params.id).populate('product');

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }

  // Check if expired
  if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
    return next(new ErrorResponse('QR code has expired', 400));
  }

  // Check if already used
  if (qrCode.status === 'used' && qrCode.usedBy) {
    return next(new ErrorResponse('Cashback already activated for this QR code', 400));
  }

  // Check if cashback available
  if (qrCode.cashbackAmount <= 0) {
    return next(new ErrorResponse('No cashback available for this product', 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Update QR code status
  qrCode.status = 'used';
  qrCode.usedBy = req.user.id;
  qrCode.usedAt = new Date();
  await qrCode.save();

  // Add cashback to user wallet
  user.wallet.balance += qrCode.cashbackAmount;
  user.wallet.totalEarned += qrCode.cashbackAmount;
  
  // Add XP for purchasing eco-friendly product
  const xpGained = Math.floor(qrCode.cashbackAmount / 1000) + 10; // Base 10 XP + bonus
  user.addXP(xpGained);
  
  await user.save();

  // Create transaction record
  const transaction = await Transaction.create({
    user: req.user.id,
    type: 'cashback',
    amount: qrCode.cashbackAmount,
    description: `Cashback from ${qrCode.product.name}`,
    status: 'completed',
    relatedProduct: qrCode.product._id,
    relatedQRCode: qrCode._id
  });

  res.status(200).json({
    success: true,
    data: {
      cashbackAmount: qrCode.cashbackAmount,
      newBalance: user.wallet.balance,
      xpGained,
      currentLevel: user.level,
      currentXP: user.xp,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        createdAt: transaction.createdAt
      },
      message: `Cashback ${qrCode.cashbackAmount.toLocaleString('vi-VN')} VND đã được thêm vào ví của bạn!`
    }
  });
});

// @desc    Redeem recycle reward (after recycling packaging)
// @route   POST /api/qrcodes/:id/recycle
// @access  Private (User)
exports.redeemRecycle = asyncHandler(async (req, res, next) => {
  const { location, collectionPointId } = req.body;
  const qrCode = await QRCode.findById(req.params.id).populate('product');

  if (!qrCode) {
    return next(new ErrorResponse('QR code not found', 404));
  }

  // Check if already recycled
  if (qrCode.isRecycled) {
    return next(new ErrorResponse('This product has already been recycled', 400));
  }

  // Check if recycle reward available
  if (qrCode.recycleReward <= 0) {
    return next(new ErrorResponse('No recycle reward available for this product', 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Update QR code
  qrCode.isRecycled = true;
  qrCode.recycledBy = req.user.id;
  qrCode.recycledAt = new Date();
  await qrCode.save();

  // Add recycle reward to user wallet
  user.wallet.balance += qrCode.recycleReward;
  user.wallet.totalEarned += qrCode.recycleReward;
  
  // Update environmental impact
  user.impact.totalRecycleActions += 1;
  
  // Calculate plastic saved (estimate based on product category)
  let plasticSaved = 0;
  if (qrCode.product.category === 'personal-care') plasticSaved = 50; // 50g
  else if (qrCode.product.category === 'household') plasticSaved = 100; // 100g
  else plasticSaved = 30; // default
  
  user.impact.totalPlasticRecycled += plasticSaved / 1000; // Convert g to kg
  
  // Add XP for recycling
  const xpGained = 20 + Math.floor(qrCode.recycleReward / 500); // Base 20 XP + bonus
  user.addXP(xpGained);
  
  await user.save();

  // Create transaction record
  const transaction = await Transaction.create({
    user: req.user.id,
    type: 'recycle_reward',
    amount: qrCode.recycleReward,
    description: `Recycle reward from ${qrCode.product.name}`,
    status: 'completed',
    relatedProduct: qrCode.product._id,
    relatedQRCode: qrCode._id,
    metadata: {
      location,
      collectionPointId,
      plasticSaved
    }
  });

  res.status(200).json({
    success: true,
    data: {
      recycleReward: qrCode.recycleReward,
      newBalance: user.wallet.balance,
      xpGained,
      currentLevel: user.level,
      currentXP: user.xp,
      environmentalImpact: {
        totalRecycleActions: user.impact.totalRecycleActions,
        totalPlasticRecycled: user.impact.totalPlasticRecycled
      },
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        createdAt: transaction.createdAt
      },
      message: `Chúc mừng! Bạn đã nhận ${qrCode.recycleReward.toLocaleString('vi-VN')} VND thưởng tái chế và tiết kiệm ${plasticSaved}g nhựa!`
    }
  });
});

// @desc    Get QR code batches for a brand
// @route   GET /api/qrcodes/batches
// @access  Private (Brand owners, Admin)
exports.getQRBatches = asyncHandler(async (req, res, next) => {
  let query = {};

  // If not admin, filter by brand owner
  if (req.user.role !== 'admin') {
    const Brand = require('../models/Brand');
    const userBrand = await Brand.findOne({ owner: req.user.id });
    if (!userBrand) {
      return next(new ErrorResponse('You must be a brand owner to access this', 403));
    }
    query.brand = userBrand._id;
  }

  // Get unique batch IDs with aggregation
  const batches = await QRCode.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$batchId',
        batchName: { $first: '$batchName' },
        product: { $first: '$product' },
        brand: { $first: '$brand' },
        totalCodes: { $sum: 1 },
        usedCodes: {
          $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
        },
        recycledCodes: {
          $sum: { $cond: ['$isRecycled', 1, 0] }
        },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  // Populate product and brand details
  await QRCode.populate(batches, [
    { path: 'product', select: 'name price images' },
    { path: 'brand', select: 'name logo' }
  ]);

  res.status(200).json({
    success: true,
    count: batches.length,
    data: batches
  });
});

// @desc    Get QR codes in a batch
// @route   GET /api/qrcodes/batch/:batchId
// @access  Private (Brand owners, Admin)
exports.getBatchDetails = asyncHandler(async (req, res, next) => {
  const { batchId } = req.params;

  const qrCodes = await QRCode.find({ batchId })
    .populate('product', 'name price images')
    .populate('usedBy', 'name email phone')
    .populate('recycledBy', 'name email phone')
    .sort('-createdAt');

  if (!qrCodes || qrCodes.length === 0) {
    return next(new ErrorResponse('Batch not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin') {
    const Brand = require('../models/Brand');
    const userBrand = await Brand.findOne({ owner: req.user.id });
    if (!userBrand || qrCodes[0].brand.toString() !== userBrand._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this batch', 403));
    }
  }

  res.status(200).json({
    success: true,
    count: qrCodes.length,
    batchId,
    data: qrCodes
  });
});

// @desc    Get user's QR scan history
// @route   GET /api/qrcodes/my-scans
// @access  Private (User)
exports.getMyScanHistory = asyncHandler(async (req, res, next) => {
  const qrCodes = await QRCode.find({
    'scanHistory.scannedBy': req.user.id
  })
    .populate('product', 'name price images category')
    .populate('brand', 'name logo')
    .sort('-scanHistory.scannedAt')
    .limit(50);

  // Extract only user's scans from history
  const scans = [];
  qrCodes.forEach(qr => {
    qr.scanHistory.forEach(scan => {
      if (scan.scannedBy.toString() === req.user.id) {
        scans.push({
          qrCodeId: qr._id,
          code: qr.code,
          product: qr.product,
          brand: qr.brand,
          scannedAt: scan.scannedAt,
          location: scan.location,
          status: qr.status,
          isRecycled: qr.isRecycled
        });
      }
    });
  });

  res.status(200).json({
    success: true,
    count: scans.length,
    data: scans
  });
});

// @desc    Get QR code statistics
// @route   GET /api/qrcodes/stats
// @access  Private (Brand owners, Admin)
exports.getQRStats = asyncHandler(async (req, res, next) => {
  let matchQuery = {};

  // If not admin, filter by brand owner
  if (req.user.role !== 'admin') {
    const Brand = require('../models/Brand');
    const userBrand = await Brand.findOne({ owner: req.user.id });
    if (!userBrand) {
      return next(new ErrorResponse('You must be a brand owner to access this', 403));
    }
    matchQuery.brand = userBrand._id;
  }

  const stats = await QRCode.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalGenerated: { $sum: 1 },
        totalUsed: {
          $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
        },
        totalRecycled: {
          $sum: { $cond: ['$isRecycled', 1, 0] }
        },
        totalScans: { $sum: '$scanCount' },
        totalCashbackDistributed: {
          $sum: { $cond: [{ $eq: ['$status', 'used'] }, '$cashbackAmount', 0] }
        },
        totalRecycleRewardDistributed: {
          $sum: { $cond: ['$isRecycled', '$recycleReward', 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalGenerated: 0,
      totalUsed: 0,
      totalRecycled: 0,
      totalScans: 0,
      totalCashbackDistributed: 0,
      totalRecycleRewardDistributed: 0
    }
  });
});
