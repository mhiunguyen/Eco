const mongoose = require('mongoose');

const collectionPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên điểm thu gom'],
    trim: true
  },
  
  // Address
  address: {
    street: String,
    ward: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    fullAddress: {
      type: String,
      required: true
    }
  },

  // Location Coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },

  // Contact
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: String,
    manager: String
  },

  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },

  // Type
  type: {
    type: String,
    enum: ['dropoff', 'pickup', 'both'],
    default: 'both'
  },

  // Materials Accepted
  materialsAccepted: [{
    type: String,
    enum: ['plastic', 'glass', 'paper', 'metal', 'electronics', 'textiles', 'batteries', 'other']
  }],

  // Capacity
  capacity: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    maximum: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['kg', 'items'],
      default: 'kg'
    }
  },

  // Images
  images: [{
    url: String,
    publicId: String
  }],

  // Description
  description: String,
  instructions: String, // How to use this collection point

  // Facilities
  facilities: [{
    type: String,
    enum: ['parking', 'wheelchair-access', 'indoor', 'outdoor', 'staff-assistance', 'automated']
  }],

  // Statistics
  stats: {
    totalCollections: {
      type: Number,
      default: 0
    },
    totalWeight: {
      type: Number,
      default: 0 // kg
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    rating: {
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
    }
  },

  // Partner Info (if operated by partner)
  partner: {
    name: String,
    logo: String,
    contact: String
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Availability
  isTemporarilyClosed: {
    type: Boolean,
    default: false
  },
  temporaryCloseReason: String,
  temporaryCloseUntil: Date,

  // Managed by
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Recent Activity
  lastCollectionAt: Date,
  lastMaintenanceAt: Date,
  nextMaintenanceAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate capacity percentage
collectionPointSchema.virtual('capacityPercentage').get(function() {
  return Math.round((this.capacity.current / this.capacity.maximum) * 100);
});

// Check if currently open
collectionPointSchema.methods.isCurrentlyOpen = function() {
  if (!this.isActive || this.isTemporarilyClosed) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  
  const hours = this.operatingHours[currentDay];
  if (!hours || hours.isClosed) return false;

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Check if accepting materials
collectionPointSchema.methods.acceptsMaterial = function(material) {
  return this.materialsAccepted.includes(material);
};

// Check if has capacity
collectionPointSchema.methods.hasCapacity = function(amount = 0) {
  return (this.capacity.current + amount) <= this.capacity.maximum;
};

// Add collection
collectionPointSchema.methods.addCollection = async function(weight, userId) {
  this.capacity.current += weight;
  this.stats.totalCollections += 1;
  this.stats.totalWeight += weight;
  
  // Add to unique users set
  if (!this.stats.users) this.stats.users = [];
  if (!this.stats.users.includes(userId)) {
    this.stats.users.push(userId);
    this.stats.totalUsers = this.stats.users.length;
  }
  
  this.lastCollectionAt = new Date();
  await this.save();
};

// Find nearby collection points
collectionPointSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // meters
      }
    },
    isActive: true,
    isTemporarilyClosed: false
  });
};

// Indexes
collectionPointSchema.index({ location: '2dsphere' });
collectionPointSchema.index({ 'address.city': 1, 'address.district': 1 });
collectionPointSchema.index({ isActive: 1, isTemporarilyClosed: 1 });
collectionPointSchema.index({ materialsAccepted: 1 });

module.exports = mongoose.model('CollectionPoint', collectionPointSchema);
