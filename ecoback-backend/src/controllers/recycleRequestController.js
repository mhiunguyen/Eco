const RecycleRequest = require('../models/RecycleRequest');
const CollectionPoint = require('../models/CollectionPoint');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create recycle pickup request
// @route   POST /api/recycle-requests
// @access  Private
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { items, pickupAddress, preferredDate, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp danh sách vật phẩm', 400));
  }

  if (!pickupAddress || !pickupAddress.fullAddress) {
    return next(new ErrorResponse('Vui lòng cung cấp địa chỉ nhận hàng', 400));
  }

  // Calculate estimated weight
  const estimatedWeight = items.reduce((sum, item) => sum + (item.estimatedWeight || 0), 0);

  const recycleRequest = await RecycleRequest.create({
    user: req.user.id,
    items,
    estimatedWeight,
    pickupAddress,
    preferredDate: preferredDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default tomorrow
    notes
  });

  res.status(201).json({
    success: true,
    data: recycleRequest,
    message: 'Yêu cầu thu gom đã được gửi. Chúng tôi sẽ liên hệ với bạn sớm nhất!'
  });
});

// @desc    Get user's recycle requests
// @route   GET /api/recycle-requests/my-requests
// @access  Private
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  const status = req.query.status || 'all';

  const query = { user: req.user.id };

  if (status !== 'all') {
    query.status = status;
  }

  const requests = await RecycleRequest.find(query)
    .sort('-createdAt')
    .populate('assignedCollector', 'fullName phone')
    .populate('collectionPoint', 'name address phone');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get single recycle request
// @route   GET /api/recycle-requests/:id
// @access  Private
exports.getRequest = asyncHandler(async (req, res, next) => {
  const recycleRequest = await RecycleRequest.findById(req.params.id)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName email phone')
    .populate('collectionPoint', 'name address phone location');

  if (!recycleRequest) {
    return next(new ErrorResponse('Không tìm thấy yêu cầu', 404));
  }

  // Check authorization
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'collector' &&
    recycleRequest.user.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Không có quyền xem yêu cầu này', 403));
  }

  res.status(200).json({
    success: true,
    data: recycleRequest
  });
});

// @desc    Update recycle request status
// @route   PUT /api/recycle-requests/:id/status
// @access  Private (User can cancel, Collector/Admin can update)
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Trạng thái không hợp lệ', 400));
  }

  const recycleRequest = await RecycleRequest.findById(req.params.id);

  if (!recycleRequest) {
    return next(new ErrorResponse('Không tìm thấy yêu cầu', 404));
  }

  // User can only cancel their own pending/assigned requests
  if (req.user.role === 'user') {
    if (recycleRequest.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Không có quyền cập nhật yêu cầu này', 403));
    }
    
    if (status !== 'cancelled') {
      return next(new ErrorResponse('Bạn chỉ có thể hủy yêu cầu', 403));
    }
    
    if (!['pending', 'assigned'].includes(recycleRequest.status)) {
      return next(new ErrorResponse('Không thể hủy yêu cầu đang xử lý hoặc đã hoàn thành', 400));
    }
  }

  // Update status
  recycleRequest.status = status;

  if (status === 'completed') {
    recycleRequest.completedAt = new Date();
    
    // Update user impact stats
    if (recycleRequest.actualWeight > 0) {
      const user = await User.findById(recycleRequest.user);
      user.impact.totalRecycleActions += 1;
      
      // Add weight to appropriate material type
      recycleRequest.items.forEach(item => {
        if (item.type === 'plastic') {
          user.impact.totalPlasticRecycled += recycleRequest.actualWeight / recycleRequest.items.length;
        }
      });
      
      await user.save();
    }
  }

  // Add status history
  recycleRequest.statusHistory.push({
    status,
    updatedBy: req.user.id,
    notes,
    timestamp: new Date()
  });

  await recycleRequest.save();

  res.status(200).json({
    success: true,
    data: recycleRequest,
    message: `Đã cập nhật trạng thái thành "${status}"`
  });
});

// @desc    Assign collector to request
// @route   PUT /api/recycle-requests/:id/assign
// @access  Private/Admin/Collector
exports.assignCollector = asyncHandler(async (req, res, next) => {
  const { collectorId, collectionPointId, scheduledDate } = req.body;

  const recycleRequest = await RecycleRequest.findById(req.params.id);

  if (!recycleRequest) {
    return next(new ErrorResponse('Không tìm thấy yêu cầu', 404));
  }

  if (recycleRequest.status !== 'pending') {
    return next(new ErrorResponse('Chỉ có thể phân công yêu cầu đang chờ xử lý', 400));
  }

  // Verify collector exists
  if (collectorId) {
    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== 'collector') {
      return next(new ErrorResponse('Người thu gom không hợp lệ', 400));
    }
    recycleRequest.assignedCollector = collectorId;
  }

  // Verify collection point exists
  if (collectionPointId) {
    const collectionPoint = await CollectionPoint.findById(collectionPointId);
    if (!collectionPoint) {
      return next(new ErrorResponse('Điểm thu gom không hợp lệ', 400));
    }
    recycleRequest.collectionPoint = collectionPointId;
  }

  if (scheduledDate) {
    recycleRequest.scheduledPickupDate = new Date(scheduledDate);
  }

  recycleRequest.status = 'assigned';
  recycleRequest.statusHistory.push({
    status: 'assigned',
    updatedBy: req.user.id,
    notes: 'Đã phân công người thu gom',
    timestamp: new Date()
  });

  await recycleRequest.save();

  res.status(200).json({
    success: true,
    data: recycleRequest,
    message: 'Đã phân công thành công'
  });
});

// @desc    Complete pickup with actual weight
// @route   PUT /api/recycle-requests/:id/complete
// @access  Private/Collector/Admin
exports.completePickup = asyncHandler(async (req, res, next) => {
  const { actualWeight, actualItems, notes, photo } = req.body;

  const recycleRequest = await RecycleRequest.findById(req.params.id)
    .populate('user');

  if (!recycleRequest) {
    return next(new ErrorResponse('Không tìm thấy yêu cầu', 404));
  }

  // Check if assigned to this collector
  if (
    req.user.role === 'collector' &&
    recycleRequest.assignedCollector.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Yêu cầu này không được phân công cho bạn', 403));
  }

  if (recycleRequest.status === 'completed') {
    return next(new ErrorResponse('Yêu cầu đã hoàn thành', 400));
  }

  // Update with actual data
  if (actualWeight) {
    recycleRequest.actualWeight = actualWeight;
  }

  if (actualItems) {
    recycleRequest.actualItems = actualItems;
  }

  if (photo) {
    recycleRequest.pickupProof = {
      photo,
      uploadedAt: new Date()
    };
  }

  recycleRequest.status = 'completed';
  recycleRequest.completedAt = new Date();
  
  recycleRequest.statusHistory.push({
    status: 'completed',
    updatedBy: req.user.id,
    notes: notes || 'Hoàn thành thu gom',
    timestamp: new Date()
  });

  await recycleRequest.save();

  // Update user's environmental impact
  const user = recycleRequest.user;
  user.impact.totalRecycleActions += 1;
  
  if (actualWeight > 0) {
    // Distribute weight across materials
    actualItems?.forEach(item => {
      const weight = item.weight || 0;
      switch (item.type) {
        case 'plastic':
          user.impact.totalPlasticRecycled += weight;
          break;
        case 'glass':
          user.impact.totalGlassRecycled += weight;
          break;
        case 'paper':
          user.impact.totalPaperRecycled += weight;
          break;
        case 'metal':
          user.impact.totalMetalRecycled += weight;
          break;
      }
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: recycleRequest,
    message: 'Đã hoàn thành thu gom'
  });
});

// @desc    Get all recycle requests (Admin/Collector)
// @route   GET /api/recycle-requests
// @access  Private/Admin/Collector
exports.getAllRequests = asyncHandler(async (req, res, next) => {
  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by assigned collector
  if (req.query.collector) {
    query.assignedCollector = req.query.collector;
  }

  // Collectors only see their assigned requests
  if (req.user.role === 'collector') {
    query.assignedCollector = req.user.id;
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

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const total = await RecycleRequest.countDocuments(query);

  const requests = await RecycleRequest.find(query)
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'fullName phone email')
    .populate('assignedCollector', 'fullName phone')
    .populate('collectionPoint', 'name address');

  res.status(200).json({
    success: true,
    count: requests.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: requests
  });
});

// @desc    Get recycle request statistics
// @route   GET /api/recycle-requests/stats
// @access  Private/Admin
exports.getRequestStats = asyncHandler(async (req, res, next) => {
  const statusStats = await RecycleRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalWeight: { $sum: '$actualWeight' }
      }
    }
  ]);

  const monthlyStats = await RecycleRequest.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalWeight: { $sum: '$actualWeight' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      byStatus: statusStats,
      monthly: monthlyStats
    }
  });
});
