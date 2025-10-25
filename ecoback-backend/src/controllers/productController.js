const Product = require('../models/Product');
const Brand = require('../models/Brand');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      isEcoFriendly,
      isOrganic,
      isRecyclable,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (isEcoFriendly === 'true') query['greenAttributes.isEcoFriendly'] = true;
    if (isOrganic === 'true') query['greenAttributes.isOrganic'] = true;
    if (isRecyclable === 'true') query['packaging.isRecyclable'] = true;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'ratings.average': -1 };
    if (sort === 'popular') sortOption = { 'stats.purchases': -1 };
    if (sort === 'green') sortOption = { 'greenAttributes.sustainabilityScore': -1 };

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .populate('brand', 'name logo')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    // Get total count
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
      .populate('brand', 'name logo')
      .limit(8)
      .sort({ 'ratings.average': -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm nổi bật',
      error: error.message
    });
  }
};

// @desc    Get green products
// @route   GET /api/products/green
// @access  Public
exports.getGreenProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const products = await Product.find({
      isActive: true,
      'greenAttributes.isEcoFriendly': true
    })
      .populate('brand', 'name logo')
      .sort({ 'greenAttributes.sustainabilityScore': -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get green products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm xanh',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name logo description contact esgCommitment');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Increment view count
    product.stats.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Brand/Admin)
exports.createProduct = async (req, res) => {
  try {
    // Add user's brand to product
    if (req.user.role === 'brand') {
      const brand = await Brand.findOne({ user: req.user.id });
      if (!brand) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy thông tin thương hiệu'
        });
      }
      req.body.brand = brand._id;
    }

    const product = await Product.create(req.body);

    // Update brand stats
    await Brand.findByIdAndUpdate(product.brand, {
      $inc: { 'stats.totalProducts': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Brand/Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check ownership (if brand role)
    if (req.user.role === 'brand') {
      const brand = await Brand.findOne({ user: req.user.id });
      if (product.brand.toString() !== brand._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền chỉnh sửa sản phẩm này'
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Brand/Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check ownership (if brand role)
    if (req.user.role === 'brand') {
      const brand = await Brand.findOne({ user: req.user.id });
      if (product.brand.toString() !== brand._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa sản phẩm này'
        });
      }
    }

    // Soft delete - just set isActive to false
    product.isActive = false;
    await product.save();

    // Update brand stats
    await Brand.findByIdAndUpdate(product.brand, {
      $inc: { 'stats.totalProducts': -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'food-beverage', label: 'Thực phẩm & Đồ uống', icon: '🍎' },
      { value: 'personal-care', label: 'Chăm sóc cá nhân', icon: '🧴' },
      { value: 'household', label: 'Đồ gia dụng', icon: '🏠' },
      { value: 'fashion', label: 'Thời trang', icon: '👕' },
      { value: 'electronics', label: 'Điện tử', icon: '📱' },
      { value: 'baby-kids', label: 'Mẹ & Bé', icon: '👶' },
      { value: 'health-wellness', label: 'Sức khỏe', icon: '💊' },
      { value: 'office-supplies', label: 'Văn phòng phẩm', icon: '📚' },
      { value: 'pet-care', label: 'Thú cưng', icon: '🐾' },
      { value: 'other', label: 'Khác', icon: '📦' }
    ];

    // Get product count per category
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoriesWithCount = categories.map(cat => {
      const countData = counts.find(c => c._id === cat.value);
      return {
        ...cat,
        count: countData ? countData.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh mục',
      error: error.message
    });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats/overview
// @access  Private (Admin)
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalGreenProducts = await Product.countDocuments({ 
      isActive: true,
      'greenAttributes.isEcoFriendly': true 
    });
    const totalRecyclableProducts = await Product.countDocuments({ 
      isActive: true,
      'packaging.isRecyclable': true 
    });

    const topRated = await Product.find({ isActive: true })
      .sort({ 'ratings.average': -1 })
      .limit(5)
      .select('name ratings.average');

    const topSelling = await Product.find({ isActive: true })
      .sort({ 'stats.purchases': -1 })
      .limit(5)
      .select('name stats.purchases');

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalGreenProducts,
        totalRecyclableProducts,
        greenPercentage: Math.round((totalGreenProducts / totalProducts) * 100),
        recyclablePercentage: Math.round((totalRecyclableProducts / totalProducts) * 100),
        topRated,
        topSelling
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê sản phẩm',
      error: error.message
    });
  }
};
