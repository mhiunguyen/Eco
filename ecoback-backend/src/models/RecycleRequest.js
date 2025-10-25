const mongoose = require('mongoose');

const recycleRequestSchema = new mongoose.Schema({
  // User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Request Type
  type: {
    type: String,
    enum: ['pickup', 'dropoff'],
    required: true
  },

  // Items to recycle
  items: [{
    qrCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    material: {
      type: String,
      enum: ['plastic', 'glass', 'paper', 'metal', 'mixed'],
      required: true
    },
    weight: Number, // kg
    quantity: {
      type: Number,
      default: 1
    },
    condition: {
      type: String,
      enum: ['clean', 'dirty', 'damaged', 'intact'],
      default: 'intact'
    },
    images: [{
      url: String,
      publicId: String
    }]
  }],

  // Total Weight
  totalWeight: {
    type: Number,
    default: 0
  },

  // Collection Point (for dropoff)
  collectionPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionPoint'
  },

  // Pickup Address (for pickup)
  pickupAddress: {
    fullAddress: String,
    ward: String,
    district: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    notes: String // Delivery instructions
  },

  // Scheduling
  scheduledDate: Date,
  scheduledTimeSlot: {
    start: String, // "09:00"
    end: String    // "12:00"
  },

  // Status
  status: {
    type: String,
    enum: [
      'pending',       // Request created
      'confirmed',     // Admin confirmed
      'in-progress',   // Pickup/collection in progress
      'collected',     // Items collected
      'verified',      // Items verified by admin
      'completed',     // Reward given
      'cancelled',     // Cancelled
      'rejected'       // Rejected by admin
    ],
    default: 'pending'
  },

  // Verification
  verification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    actualWeight: Number,
    actualItems: Number,
    qualityNotes: String,
    verificationImages: [{
      url: String,
      publicId: String
    }]
  },

  // Reward
  reward: {
    amount: {
      type: Number,
      default: 0
    },
    xpEarned: {
      type: Number,
      default: 0
    },
    badgesEarned: [String],
    bonusReason: String, // If bonus applied
    paidAt: Date
  },

  // Environmental Impact (calculated)
  impact: {
    co2Saved: Number,    // kg
    waterSaved: Number,  // liters
    energySaved: Number  // kWh
  },

  // Collector Info (for pickup)
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collectorNotes: String,

  // Tracking
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Cancellation/Rejection
  cancellationReason: String,
  rejectionReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,

  // QR Codes used
  qrCodesUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  }],

  // Transaction
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Notes
  userNotes: String,
  adminNotes: String,

  // Completion
  completedAt: Date
}, {
  timestamps: true
});

// Calculate total weight from items
recycleRequestSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalWeight = this.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  }
  next();
});

// Calculate environmental impact
recycleRequestSchema.methods.calculateImpact = function() {
  // Impact factors per kg of material
  const impactFactors = {
    plastic: { co2: 1.5, water: 20, energy: 5 },
    glass: { co2: 0.5, water: 10, energy: 2 },
    paper: { co2: 1.0, water: 50, energy: 3 },
    metal: { co2: 2.0, water: 30, energy: 8 },
    mixed: { co2: 1.0, water: 25, energy: 4 }
  };

  let totalCO2 = 0;
  let totalWater = 0;
  let totalEnergy = 0;

  this.items.forEach(item => {
    const factor = impactFactors[item.material] || impactFactors.mixed;
    const weight = item.weight || 0;
    
    totalCO2 += weight * factor.co2;
    totalWater += weight * factor.water;
    totalEnergy += weight * factor.energy;
  });

  this.impact = {
    co2Saved: Math.round(totalCO2 * 100) / 100,
    waterSaved: Math.round(totalWater),
    energySaved: Math.round(totalEnergy * 100) / 100
  };
};

// Calculate reward amount
recycleRequestSchema.methods.calculateReward = function() {
  // Base reward per kg by material
  const rewardRates = {
    plastic: 2000,  // 2,000 VND/kg
    glass: 1000,    // 1,000 VND/kg
    paper: 1500,    // 1,500 VND/kg
    metal: 5000,    // 5,000 VND/kg
    mixed: 1000     // 1,000 VND/kg
  };

  let totalReward = 0;

  this.items.forEach(item => {
    const rate = rewardRates[item.material] || rewardRates.mixed;
    const weight = item.weight || 0;
    totalReward += weight * rate;
  });

  // Quality bonus
  const cleanItems = this.items.filter(item => item.condition === 'clean').length;
  const qualityBonus = cleanItems > 0 ? totalReward * 0.1 : 0;

  // Weight bonus (for large collections)
  const weightBonus = this.totalWeight > 10 ? totalReward * 0.2 : 0;

  this.reward.amount = Math.round(totalReward + qualityBonus + weightBonus);
  
  // Calculate XP (1 XP per 1,000 VND + 10 XP per kg)
  this.reward.xpEarned = Math.floor(this.reward.amount / 1000) + Math.floor(this.totalWeight * 10);

  return this.reward.amount;
};

// Add timeline event
recycleRequestSchema.methods.addTimelineEvent = function(status, note, userId) {
  this.timeline.push({
    status,
    note,
    by: userId,
    timestamp: new Date()
  });
};

// Update status with timeline
recycleRequestSchema.methods.updateStatus = async function(newStatus, note, userId) {
  this.status = newStatus;
  this.addTimelineEvent(newStatus, note, userId);
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  await this.save();
};

// Indexes
recycleRequestSchema.index({ user: 1, status: 1 });
recycleRequestSchema.index({ status: 1, createdAt: -1 });
recycleRequestSchema.index({ collectionPoint: 1, status: 1 });
recycleRequestSchema.index({ collector: 1, status: 1 });
recycleRequestSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('RecycleRequest', recycleRequestSchema);
