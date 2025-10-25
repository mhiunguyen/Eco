const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thương hiệu'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String,
    required: [true, 'Vui lòng upload logo thương hiệu']
  },
  coverImage: String,
  
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả thương hiệu']
  },
  
  // Contact Info
  contact: {
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    phone: String,
    website: String,
    address: String
  },

  // Partnership Info
  partnership: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    contractEndDate: Date,
    commissionRate: {
      type: Number,
      default: 10, // Percentage EcoBack takes
      min: 0,
      max: 30
    }
  },

  // ESG Commitment
  esgCommitment: {
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    certifications: [{
      name: String, // ISO 14001, B Corp, etc.
      image: String,
      verifiedDate: Date
    }],
    greenInitiatives: [{
      title: String,
      description: String,
      impact: String,
      startDate: Date
    }],
    recyclingProgram: {
      hasProgram: {
        type: Boolean,
        default: false
      },
      description: String,
      materialsAccepted: [String] // plastic, glass, paper, metal
    }
  },

  // Cashback Settings
  cashbackSettings: {
    defaultRate: {
      type: Number,
      default: 5, // 5% default cashback
      min: 0,
      max: 50
    },
    maxCashbackPerProduct: {
      type: Number,
      default: 50000 // VND
    }
  },

  // Statistics
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    totalCashbackGiven: {
      type: Number,
      default: 0
    },
    totalRecycleParticipations: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },

  // Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },

  // Account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from name
brandSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Virtual for products
brandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brand',
  justOne: false
});

module.exports = mongoose.model('Brand', brandSchema);
