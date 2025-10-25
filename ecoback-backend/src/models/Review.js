const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Product being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },

  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: [true, 'Vui lòng chọn đánh giá'],
    min: 1,
    max: 5
  },

  // Review Content
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
  },
  comment: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung đánh giá'],
    maxlength: [1000, 'Nội dung không được quá 1000 ký tự']
  },

  // Images (optional)
  images: [{
    url: String,
    publicId: String
  }],

  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  purchaseDate: Date,
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Detailed Ratings (optional)
  detailedRatings: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    packaging: {
      type: Number,
      min: 1,
      max: 5
    },
    sustainability: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Helpful votes
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Reported
  isReported: {
    type: Boolean,
    default: false
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Moderation
  isApproved: {
    type: Boolean,
    default: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNote: String,

  // Brand Response
  brandResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },

  // Status
  isVisible: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Mark as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (this.helpful.users.includes(userId)) {
    // Remove helpful vote
    this.helpful.users = this.helpful.users.filter(id => id.toString() !== userId.toString());
    this.helpful.count = Math.max(0, this.helpful.count - 1);
  } else {
    // Add helpful vote
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  await this.save();
};

// Update product rating after review save/update/delete
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Static method to update product ratings
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        isApproved: true,
        isVisible: true
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const Product = mongoose.model('Product');
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
};

// Static method to check if user can review
reviewSchema.statics.canUserReview = async function(userId, productId) {
  // Check if already reviewed
  const existingReview = await this.findOne({ user: userId, product: productId });
  if (existingReview) {
    return { canReview: false, reason: 'Bạn đã đánh giá sản phẩm này' };
  }

  // Check if user has purchased (optional - can be skipped for MVP)
  // const Transaction = mongoose.model('Transaction');
  // const purchase = await Transaction.findOne({
  //   user: userId,
  //   relatedProduct: productId,
  //   type: 'purchase',
  //   status: 'completed'
  // });
  // if (!purchase) {
  //   return { canReview: false, reason: 'Bạn cần mua sản phẩm trước khi đánh giá' };
  // }

  return { canReview: true };
};

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1, isVisible: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

module.exports = mongoose.model('Review', reviewSchema);
