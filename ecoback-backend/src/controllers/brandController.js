const Brand = require('../models/Brand');
const User = require('../models/User');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
exports.getBrands = async (req, res) => {
  try {
    const { 
      tier,
      isVerified,
      isFeatured,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (tier) query['partnership.tier'] = tier;
    if (isVerified === 'true') query.isVerified = true;
    if (isFeatured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const brands = await Brand.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .select('-user'); // Don't expose user ID

    const total = await Brand.countDocuments(query);

    res.status(200).json({
      success: true,
      count: brands.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thương hiệu',
      error: error.message
    });
  }
};

// @desc    Get featured brands
// @route   GET /api/brands/featured
// @access  Public
exports.getFeaturedBrands = async (req, res) => {
  try {
    const brands = await Brand.find({
      isActive: true,
      isFeatured: true,
      isVerified: true
    })
      .sort({ 'stats.totalProducts': -1 })
      .limit(8)
      .select('-user');

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Get featured brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thương hiệu nổi bật',
      error: error.message
    });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('products')
      .select('-user');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thương hiệu',
      error: error.message
    });
  }
};

// @desc    Get brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
exports.getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug })
      .populate('products')
      .select('-user');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get brand by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thương hiệu',
      error: error.message
    });
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private (User with brand role)
exports.createBrand = async (req, res) => {
  try {
    // Check if user already has a brand
    const existingBrand = await Brand.findOne({ user: req.user.id });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có thương hiệu rồi'
      });
    }

    // Create brand with user reference
    req.body.user = req.user.id;
    const brand = await Brand.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo thương hiệu thành công',
      data: brand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thương hiệu',
      error: error.message
    });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private (Owner/Admin)
exports.updateBrand = async (req, res) => {
  try {
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    // Check ownership
    if (brand.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền chỉnh sửa thương hiệu này'
      });
    }

    brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật thương hiệu thành công',
      data: brand
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thương hiệu',
      error: error.message
    });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private (Owner/Admin)
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thương hiệu'
      });
    }

    // Check ownership
    if (brand.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa thương hiệu này'
      });
    }

    // Soft delete
    brand.isActive = false;
    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Xóa thương hiệu thành công'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thương hiệu',
      error: error.message
    });
  }
};

// @desc    Get my brand
// @route   GET /api/brands/me/info
// @access  Private (Brand role)
exports.getMyBrand = async (req, res) => {
  try {
    const brand = await Brand.findOne({ user: req.user.id })
      .populate('products');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có thương hiệu'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get my brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thương hiệu',
      error: error.message
    });
  }
};
