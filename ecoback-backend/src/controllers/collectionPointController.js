const CollectionPoint = require('../models/CollectionPoint');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all collection points
// @route   GET /api/collection-points
// @access  Public
exports.getCollectionPoints = asyncHandler(async (req, res, next) => {
  let query = { isActive: true };

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Filter by accepted materials
  if (req.query.material) {
    query['acceptedMaterials.type'] = req.query.material;
  }

  // Search by name or address
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { 'address.fullAddress': { $regex: req.query.search, $options: 'i' } },
      { 'address.district': { $regex: req.query.search, $options: 'i' } },
      { 'address.city': { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const collectionPoints = await CollectionPoint.find(query)
    .sort('name');

  res.status(200).json({
    success: true,
    count: collectionPoints.length,
    data: collectionPoints
  });
});

// @desc    Find nearby collection points (geospatial)
// @route   GET /api/collection-points/nearby
// @access  Public
exports.getNearbyPoints = asyncHandler(async (req, res, next) => {
  const { lng, lat, maxDistance = 5000 } = req.query; // Default 5km radius

  if (!lng || !lat) {
    return next(new ErrorResponse('Vui lòng cung cấp tọa độ (lng, lat)', 400));
  }

  const longitude = parseFloat(lng);
  const latitude = parseFloat(lat);

  if (isNaN(longitude) || isNaN(latitude)) {
    return next(new ErrorResponse('Tọa độ không hợp lệ', 400));
  }

  // Geospatial query
  const collectionPoints = await CollectionPoint.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: parseInt(maxDistance)
      }
    }
  })
    .limit(20);

  // Calculate distance for each point
  const pointsWithDistance = collectionPoints.map(point => {
    const distance = calculateDistance(
      latitude,
      longitude,
      point.location.coordinates[1],
      point.location.coordinates[0]
    );

    return {
      ...point.toObject(),
      distance: Math.round(distance * 100) / 100 // Round to 2 decimals
    };
  });

  res.status(200).json({
    success: true,
    count: pointsWithDistance.length,
    data: pointsWithDistance
  });
});

// @desc    Get single collection point
// @route   GET /api/collection-points/:id
// @access  Public
exports.getCollectionPoint = asyncHandler(async (req, res, next) => {
  const collectionPoint = await CollectionPoint.findById(req.params.id);

  if (!collectionPoint) {
    return next(new ErrorResponse('Không tìm thấy điểm thu gom', 404));
  }

  res.status(200).json({
    success: true,
    data: collectionPoint
  });
});

// @desc    Create collection point
// @route   POST /api/collection-points
// @access  Private/Admin
exports.createCollectionPoint = asyncHandler(async (req, res, next) => {
  const collectionPoint = await CollectionPoint.create(req.body);

  res.status(201).json({
    success: true,
    data: collectionPoint
  });
});

// @desc    Update collection point
// @route   PUT /api/collection-points/:id
// @access  Private/Admin/Manager
exports.updateCollectionPoint = asyncHandler(async (req, res, next) => {
  let collectionPoint = await CollectionPoint.findById(req.params.id);

  if (!collectionPoint) {
    return next(new ErrorResponse('Không tìm thấy điểm thu gom', 404));
  }

  // Check authorization - removed since managedBy doesn't exist in schema
  // Admin can update any collection point
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Không có quyền cập nhật điểm thu gom này', 403));
  }

  collectionPoint = await CollectionPoint.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: collectionPoint
  });
});

// @desc    Delete collection point
// @route   DELETE /api/collection-points/:id
// @access  Private/Admin
exports.deleteCollectionPoint = asyncHandler(async (req, res, next) => {
  const collectionPoint = await CollectionPoint.findById(req.params.id);

  if (!collectionPoint) {
    return next(new ErrorResponse('Không tìm thấy điểm thu gom', 404));
  }

  // Soft delete
  collectionPoint.isActive = false;
  await collectionPoint.save();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Đã xóa điểm thu gom'
  });
});

// @desc    Record dropoff at collection point
// @route   POST /api/collection-points/:id/dropoff
// @access  Private
exports.recordDropoff = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ErrorResponse('Vui lòng cung cấp danh sách vật phẩm', 400));
  }

  const collectionPoint = await CollectionPoint.findById(req.params.id);

  if (!collectionPoint) {
    return next(new ErrorResponse('Không tìm thấy điểm thu gom', 404));
  }

  if (!collectionPoint.isActive) {
    return next(new ErrorResponse('Điểm thu gom này đã ngừng hoạt động', 400));
  }

  // Check if collection point accepts these materials
  const acceptedTypes = collectionPoint.acceptedMaterials.map(m => m.type);
  const invalidItems = items.filter(item => !acceptedTypes.includes(item.type));

  if (invalidItems.length > 0) {
    return next(
      new ErrorResponse(
        `Điểm thu gom này không nhận: ${invalidItems.map(i => i.type).join(', ')}`,
        400
      )
    );
  }

  // Update collection point stats
  let totalWeight = 0;
  items.forEach(item => {
    totalWeight += item.weight || 0;
    
    const materialIndex = collectionPoint.acceptedMaterials.findIndex(
      m => m.type === item.type
    );
    
    if (materialIndex !== -1) {
      collectionPoint.acceptedMaterials[materialIndex].collectedAmount += item.weight || 0;
    }
  });

  collectionPoint.stats.totalDropoffs += 1;
  collectionPoint.stats.totalWeightCollected += totalWeight;
  
  // Add to recent dropoffs
  collectionPoint.stats.recentDropoffs.unshift({
    user: req.user.id,
    items,
    totalWeight,
    droppedAt: new Date()
  });

  // Keep only last 50 dropoffs
  if (collectionPoint.stats.recentDropoffs.length > 50) {
    collectionPoint.stats.recentDropoffs = collectionPoint.stats.recentDropoffs.slice(0, 50);
  }

  await collectionPoint.save();

  res.status(200).json({
    success: true,
    message: 'Đã ghi nhận thu gom thành công',
    data: {
      collectionPoint: collectionPoint.name,
      totalWeight,
      items
    }
  });
});

// @desc    Get collection point statistics
// @route   GET /api/collection-points/:id/stats
// @access  Public
exports.getPointStats = asyncHandler(async (req, res, next) => {
  const collectionPoint = await CollectionPoint.findById(req.params.id);

  if (!collectionPoint) {
    return next(new ErrorResponse('Không tìm thấy điểm thu gom', 404));
  }

  // Calculate daily/weekly/monthly stats
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const recentDropoffs = collectionPoint.stats.recentDropoffs || [];

  const stats = {
    total: {
      dropoffs: collectionPoint.stats.totalDropoffs,
      weight: collectionPoint.stats.totalWeightCollected
    },
    daily: {
      dropoffs: recentDropoffs.filter(d => d.droppedAt >= dayAgo).length,
      weight: recentDropoffs
        .filter(d => d.droppedAt >= dayAgo)
        .reduce((sum, d) => sum + d.totalWeight, 0)
    },
    weekly: {
      dropoffs: recentDropoffs.filter(d => d.droppedAt >= weekAgo).length,
      weight: recentDropoffs
        .filter(d => d.droppedAt >= weekAgo)
        .reduce((sum, d) => sum + d.totalWeight, 0)
    },
    monthly: {
      dropoffs: recentDropoffs.filter(d => d.droppedAt >= monthAgo).length,
      weight: recentDropoffs
        .filter(d => d.droppedAt >= monthAgo)
        .reduce((sum, d) => sum + d.totalWeight, 0)
    },
    byMaterial: collectionPoint.acceptedMaterials.map(m => ({
      type: m.type,
      collected: m.collectedAmount,
      unit: 'kg'
    }))
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
