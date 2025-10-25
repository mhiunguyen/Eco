const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm']
  },
  
  // Images
  images: [{
    url: String,
    publicId: String, // Cloudinary public_id for deletion
    isMain: {
      type: Boolean,
      default: false
    }
  }],

  // Brand
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Sản phẩm phải thuộc về một thương hiệu']
  },

  // Category
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục'],
    enum: [
      'food-beverage',
      'personal-care',
      'household',
      'fashion',
      'electronics',
      'baby-kids',
      'health-wellness',
      'office-supplies',
      'pet-care',
      'other'
    ]
  },
  subCategory: String,

  // Pricing
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: 0
  },
  originalPrice: Number, // Price before discount
  
  // Cashback
  cashback: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    maxAmount: Number // Max cashback amount if percentage type
  },

  // Packaging Information
  packaging: {
    materials: [{
      type: {
        type: String,
        enum: ['plastic', 'glass', 'paper', 'metal', 'biodegradable', 'mixed'],
        required: true
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      recyclable: {
        type: Boolean,
        default: false
      },
      recycleInstructions: String
    }],
    weight: Number, // grams
    dimensions: {
      length: Number, // cm
      width: Number,
      height: Number
    },
    isRecyclable: {
      type: Boolean,
      default: false
    },
    recycleReward: {
      type: Number,
      default: 0 // VND reward for recycling
    }
  },

  // Green Attributes
  greenAttributes: {
    isEcoFriendly: {
      type: Boolean,
      default: false
    },
    isOrganic: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isCrueltyFree: {
      type: Boolean,
      default: false
    },
    isFairTrade: {
      type: Boolean,
      default: false
    },
    certifications: [{
      name: String,
      image: String
    }],
    carbonFootprint: Number, // kg CO2e
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Product Details
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  manufacturer: String,
  countryOfOrigin: String,

  // Inventory
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  stockStatus: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock'
  },

  // QR Codes
  hasQRCode: {
    type: Boolean,
    default: false
  },
  qrCodeBatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  }],

  // Reviews & Ratings
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    qrScans: {
      type: Number,
      default: 0
    },
    recycleCount: {
      type: Number,
      default: 0
    }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add random string to ensure uniqueness
    this.slug += '-' + Date.now().toString(36);
  }
  next();
});

// Update stock status based on stock quantity
productSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    if (this.stock === 0) {
      this.stockStatus = 'out-of-stock';
    } else if (this.stock <= 10) {
      this.stockStatus = 'low-stock';
    } else {
      this.stockStatus = 'in-stock';
    }
  }
  next();
});

// Calculate cashback amount
productSchema.methods.calculateCashback = function() {
  if (this.cashback.type === 'percentage') {
    let amount = (this.price * this.cashback.value) / 100;
    if (this.cashback.maxAmount && amount > this.cashback.maxAmount) {
      amount = this.cashback.maxAmount;
    }
    return Math.round(amount);
  } else {
    return this.cashback.value;
  }
};

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ 'greenAttributes.isEcoFriendly': 1 });

module.exports = mongoose.model('Product', productSchema);
