const User = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    fullName: req.body.fullName || req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    'location.fullAddress': req.body.address || req.body.fullAddress,
    avatar: req.body.avatar,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Check if email is already taken
  if (fieldsToUpdate.email) {
    const emailExists = await User.findOne({ 
      email: fieldsToUpdate.email,
      _id: { $ne: req.user.id }
    });
    if (emailExists) {
      return next(new ErrorResponse('Email already exists', 400));
    }
  }

  // Check if phone is already taken
  if (fieldsToUpdate.phone) {
    const phoneExists = await User.findOne({ 
      phone: fieldsToUpdate.phone,
      _id: { $ne: req.user.id }
    });
    if (phoneExists) {
      return next(new ErrorResponse('Phone number already exists', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get environmental impact stats
// @route   GET /api/users/impact
// @access  Private
exports.getImpact = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Calculate impact statistics
  const impact = {
    materials: {
      plastic: user.impact.totalPlasticRecycled || 0,
      glass: user.impact.totalGlassRecycled || 0,
      paper: user.impact.totalPaperRecycled || 0,
      metal: user.impact.totalMetalRecycled || 0,
      total: (user.impact.totalPlasticRecycled || 0) + 
             (user.impact.totalGlassRecycled || 0) + 
             (user.impact.totalPaperRecycled || 0) + 
             (user.impact.totalMetalRecycled || 0)
    },
    environmental: {
      co2Saved: user.impact.co2Saved || 0,
      treesEquivalent: user.impact.treesEquivalent || 0,
      waterSaved: user.impact.waterSaved || 0
    },
    stats: {
      totalActions: user.impact.totalRecycleActions || 0,
      firstRecycleDate: user.impact.firstRecycleDate,
      lastRecycleDate: user.impact.lastRecycleDate,
      consecutiveDays: user.impact.consecutiveDays || 0
    },
    gamification: {
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNextLevel: calculateXPToNextLevel(user.level || 1),
      badges: user.badges || []
    }
  };

  res.status(200).json({
    success: true,
    data: impact
  });
});

// @desc    Get user badges
// @route   GET /api/users/badges
// @access  Private
exports.getBadges = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Define all available badges
  const allBadges = [
    {
      id: 'first_recycle',
      name: 'Người Mới Bắt Đầu',
      description: 'Hoàn thành lần tái chế đầu tiên',
      icon: '🌱',
      requirement: 1,
      type: 'actions',
      unlocked: user.impact.totalRecycleActions >= 1
    },
    {
      id: 'recycle_10',
      name: 'Người Tích Cực',
      description: 'Tái chế 10 sản phẩm',
      icon: '♻️',
      requirement: 10,
      type: 'actions',
      unlocked: user.impact.totalRecycleActions >= 10
    },
    {
      id: 'recycle_50',
      name: 'Chiến Binh Xanh',
      description: 'Tái chế 50 sản phẩm',
      icon: '🌿',
      requirement: 50,
      type: 'actions',
      unlocked: user.impact.totalRecycleActions >= 50
    },
    {
      id: 'recycle_100',
      name: 'Anh Hùng Môi Trường',
      description: 'Tái chế 100 sản phẩm',
      icon: '🏆',
      requirement: 100,
      type: 'actions',
      unlocked: user.impact.totalRecycleActions >= 100
    },
    {
      id: 'plastic_10kg',
      name: 'Diệt Nhựa',
      description: 'Tái chế 10kg nhựa',
      icon: '🥤',
      requirement: 10,
      type: 'plastic',
      unlocked: user.impact.totalPlasticRecycled >= 10
    },
    {
      id: 'paper_20kg',
      name: 'Cứu Rừng',
      description: 'Tái chế 20kg giấy',
      icon: '📄',
      requirement: 20,
      type: 'paper',
      unlocked: user.impact.totalPaperRecycled >= 20
    },
    {
      id: 'glass_15kg',
      name: 'Thủy Tinh Trong',
      description: 'Tái chế 15kg thủy tinh',
      icon: '🍾',
      requirement: 15,
      type: 'glass',
      unlocked: user.impact.totalGlassRecycled >= 15
    },
    {
      id: 'metal_10kg',
      name: 'Kim Loại Quý',
      description: 'Tái chế 10kg kim loại',
      icon: '⚙️',
      requirement: 10,
      type: 'metal',
      unlocked: user.impact.totalMetalRecycled >= 10
    },
    {
      id: 'streak_7',
      name: 'Tuần Lễ Xanh',
      description: 'Tái chế 7 ngày liên tiếp',
      icon: '🔥',
      requirement: 7,
      type: 'streak',
      unlocked: user.impact.consecutiveDays >= 7
    },
    {
      id: 'streak_30',
      name: 'Tháng Bền Vững',
      description: 'Tái chế 30 ngày liên tiếp',
      icon: '⭐',
      requirement: 30,
      type: 'streak',
      unlocked: user.impact.consecutiveDays >= 30
    },
    {
      id: 'co2_100kg',
      name: 'Giảm CO2',
      description: 'Tiết kiệm 100kg CO2',
      icon: '🌍',
      requirement: 100,
      type: 'co2',
      unlocked: user.impact.co2Saved >= 100
    },
    {
      id: 'trees_10',
      name: 'Trồng Cây Ảo',
      description: 'Tương đương trồng 10 cây',
      icon: '🌳',
      requirement: 10,
      type: 'trees',
      unlocked: user.impact.treesEquivalent >= 10
    },
    {
      id: 'referral_5',
      name: 'Người Truyền Cảm Hứng',
      description: 'Giới thiệu 5 người bạn',
      icon: '👥',
      requirement: 5,
      type: 'referral',
      unlocked: (user.referrals?.length || 0) >= 5
    },
    {
      id: 'level_5',
      name: 'Thăng Cấp',
      description: 'Đạt level 5',
      icon: '📈',
      requirement: 5,
      type: 'level',
      unlocked: user.level >= 5
    },
    {
      id: 'level_10',
      name: 'Chuyên Gia',
      description: 'Đạt level 10',
      icon: '💎',
      requirement: 10,
      type: 'level',
      unlocked: user.level >= 10
    }
  ];

  // Auto-unlock badges that meet requirements
  const newBadges = [];
  for (const badge of allBadges) {
    if (badge.unlocked && !user.badges.includes(badge.id)) {
      newBadges.push(badge.id);
    }
  }

  // Update user badges if new ones are unlocked
  if (newBadges.length > 0) {
    user.badges = [...new Set([...user.badges, ...newBadges])];
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: {
      badges: allBadges,
      unlocked: allBadges.filter(b => b.unlocked).length,
      total: allBadges.length,
      newBadges: newBadges
    }
  });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const { type = 'total', limit = 50, period = 'all' } = req.query;

  let sortField = {};
  
  // Determine sort field based on type
  switch (type) {
    case 'total':
      sortField = { 'impact.totalRecycleActions': -1 };
      break;
    case 'plastic':
      sortField = { 'impact.totalPlasticRecycled': -1 };
      break;
    case 'paper':
      sortField = { 'impact.totalPaperRecycled': -1 };
      break;
    case 'glass':
      sortField = { 'impact.totalGlassRecycled': -1 };
      break;
    case 'metal':
      sortField = { 'impact.totalMetalRecycled': -1 };
      break;
    case 'co2':
      sortField = { 'impact.co2Saved': -1 };
      break;
    case 'level':
      sortField = { level: -1, xp: -1 };
      break;
    case 'streak':
      sortField = { 'impact.consecutiveDays': -1 };
      break;
    default:
      sortField = { 'impact.totalRecycleActions': -1 };
  }

  // Get top users
  const users = await User.find()
    .select('name avatar level xp impact badges')
    .sort(sortField)
    .limit(parseInt(limit));

  // Format leaderboard data
  const leaderboard = users.map((user, index) => {
    let value = 0;
    
    switch (type) {
      case 'total':
        value = user.impact.totalRecycleActions || 0;
        break;
      case 'plastic':
        value = user.impact.totalPlasticRecycled || 0;
        break;
      case 'paper':
        value = user.impact.totalPaperRecycled || 0;
        break;
      case 'glass':
        value = user.impact.totalGlassRecycled || 0;
        break;
      case 'metal':
        value = user.impact.totalMetalRecycled || 0;
        break;
      case 'co2':
        value = user.impact.co2Saved || 0;
        break;
      case 'level':
        value = user.level;
        break;
      case 'streak':
        value = user.impact.consecutiveDays || 0;
        break;
    }

    return {
      rank: index + 1,
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      badges: user.badges.length,
      value: value,
      isMe: req.user && user._id.toString() === req.user.id
    };
  });

  // Get current user's rank if authenticated
  let myRank = null;
  if (req.user) {
    const allUsers = await User.find().select('_id').sort(sortField);
    myRank = allUsers.findIndex(u => u._id.toString() === req.user.id) + 1;
  }

  res.status(200).json({
    success: true,
    data: {
      leaderboard,
      myRank,
      type,
      period
    }
  });
});

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  const { avatar } = req.body;

  if (!avatar) {
    return next(new ErrorResponse('Please provide avatar URL', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get transaction stats
  const transactionStats = await Transaction.aggregate([
    { $match: { user: user._id, status: 'completed' } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get monthly activity
  const monthlyActivity = await Transaction.aggregate([
    { 
      $match: { 
        user: user._id, 
        status: 'completed',
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
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const stats = {
    wallet: {
      balance: user.wallet.balance,
      totalEarned: user.wallet.totalEarned,
      totalWithdrawn: user.wallet.totalWithdrawn
    },
    impact: {
      totalActions: user.impact.totalRecycleActions || 0,
      totalWeight: (user.impact.totalPlasticRecycled || 0) + 
                   (user.impact.totalGlassRecycled || 0) + 
                   (user.impact.totalPaperRecycled || 0) + 
                   (user.impact.totalMetalRecycled || 0),
      co2Saved: user.impact.co2Saved || 0,
      treesEquivalent: user.impact.treesEquivalent || 0
    },
    gamification: {
      level: user.level,
      xp: user.xp,
      badges: user.badges.length,
      referrals: user.referrals?.length || 0
    },
    transactions: transactionStats.reduce((acc, stat) => {
      acc[stat._id] = {
        total: stat.total,
        count: stat.count
      };
      return acc;
    }, {}),
    monthlyActivity: monthlyActivity.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total,
      count: item.count
    })),
    memberSince: user.createdAt,
    lastActive: user.updatedAt
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Helper function to calculate XP needed for next level
function calculateXPToNextLevel(currentLevel) {
  return currentLevel * 1000;
}
