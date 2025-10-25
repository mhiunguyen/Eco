const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  // QR Code Identifier
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Product Reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'QR Code phải liên kết với sản phẩm']
  },

  // Batch Information
  batchId: {
    type: String,
    required: true,
    index: true
  },
  batchSize: Number,
  serialNumber: Number, // Position in batch (1, 2, 3...)

  // QR Type
  type: {
    type: String,
    enum: ['cashback', 'recycle', 'both'],
    default: 'both'
  },

  // Cashback Information
  cashback: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActivated: {
      type: Boolean,
      default: false
    },
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    activatedAt: Date,
    expiresAt: Date // Cashback expiration
  },

  // Recycle Information
  recycle: {
    isRedeemed: {
      type: Boolean,
      default: false
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    redeemedAt: Date,
    collectionPoint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionPoint'
    },
    recycleRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecycleRequest'
    },
    rewardAmount: {
      type: Number,
      default: 0
    }
  },

  // Scan History
  scanHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scannedAt: {
      type: Date,
      default: Date.now
    },
    location: {
      lat: Number,
      lng: Number
    },
    deviceInfo: {
      userAgent: String,
      platform: String
    },
    action: {
      type: String,
      enum: ['view', 'activate-cashback', 'redeem-recycle'],
      default: 'view'
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'deactivated'],
    default: 'active'
  },

  // Security
  secretKey: {
    type: String,
    required: true,
    select: false // Don't return in queries
  },
  
  // Generation Info
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },

  // Print Status
  isPrinted: {
    type: Boolean,
    default: false
  },
  printedAt: Date,

  // Statistics
  stats: {
    totalScans: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    },
    lastScannedAt: Date
  },

  // Metadata
  metadata: {
    printFormat: String, // sticker, label, box
    location: String, // Where the QR is placed: on-product, in-package
    notes: String
  },

  // Expiration
  expiresAt: Date,
  isExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate unique QR code
qrCodeSchema.statics.generateCode = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `ECO-${timestamp}-${randomStr}`.toUpperCase();
};

// Generate secret key
qrCodeSchema.statics.generateSecretKey = function() {
  return require('crypto').randomBytes(32).toString('hex');
};

// Check if QR code is valid for use
qrCodeSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isExpired = true;
    this.status = 'expired';
    return false;
  }
  return true;
};

// Record scan
qrCodeSchema.methods.recordScan = async function(userId, location, deviceInfo, action = 'view') {
  this.scanHistory.push({
    user: userId,
    location,
    deviceInfo,
    action,
    scannedAt: new Date()
  });

  this.stats.totalScans += 1;
  this.stats.lastScannedAt = new Date();

  // Count unique users
  const uniqueUserIds = [...new Set(this.scanHistory.map(scan => scan.user?.toString()))];
  this.stats.uniqueUsers = uniqueUserIds.length;

  await this.save();
};

// Activate cashback
qrCodeSchema.methods.activateCashback = async function(userId) {
  if (!this.isValid()) {
    throw new Error('QR Code không hợp lệ');
  }
  if (this.cashback.isActivated) {
    throw new Error('Cashback đã được kích hoạt');
  }
  if (this.type === 'recycle') {
    throw new Error('QR Code này chỉ dành cho thu gom bao bì');
  }

  this.cashback.isActivated = true;
  this.cashback.activatedBy = userId;
  this.cashback.activatedAt = new Date();
  
  // Check if fully used
  if (this.type === 'cashback' || this.recycle.isRedeemed) {
    this.status = 'used';
  }

  await this.save();
  return this.cashback.amount;
};

// Redeem recycle
qrCodeSchema.methods.redeemRecycle = async function(userId, collectionPointId, recycleRequestId) {
  if (!this.isValid()) {
    throw new Error('QR Code không hợp lệ');
  }
  if (this.recycle.isRedeemed) {
    throw new Error('Bao bì đã được thu gom');
  }
  if (this.type === 'cashback') {
    throw new Error('QR Code này chỉ dành cho cashback');
  }

  this.recycle.isRedeemed = true;
  this.recycle.redeemedBy = userId;
  this.recycle.redeemedAt = new Date();
  this.recycle.collectionPoint = collectionPointId;
  this.recycle.recycleRequest = recycleRequestId;

  // Check if fully used
  if (this.type === 'recycle' || this.cashback.isActivated) {
    this.status = 'used';
  }

  await this.save();
  return this.recycle.rewardAmount;
};

// Indexes
qrCodeSchema.index({ code: 1 }, { unique: true });
qrCodeSchema.index({ product: 1, status: 1 });
qrCodeSchema.index({ batchId: 1 });
qrCodeSchema.index({ 'cashback.activatedBy': 1 });
qrCodeSchema.index({ 'recycle.redeemedBy': 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
