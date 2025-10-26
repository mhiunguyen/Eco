const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/default-avatar.png'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  role: {
    type: String,
    enum: ['user', 'brand', 'admin', 'collector'],
    default: 'user'
  },
  
  // Wallet Info
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    }
  },

  // Environmental Impact Stats
  impact: {
    totalPlasticRecycled: { type: Number, default: 0 }, // kg
    totalGlassRecycled: { type: Number, default: 0 }, // kg
    totalPaperRecycled: { type: Number, default: 0 }, // kg
    totalMetalRecycled: { type: Number, default: 0 }, // kg
    co2Saved: { type: Number, default: 0 }, // kg
    treesEquivalent: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 }, // liters
    totalRecycleActions: { type: Number, default: 0 }
  },

  // Gamification
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  xp: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    description: String,
    earnedAt: Date
  }],

  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Address
  addresses: [{
    label: String, // Home, Work, etc.
    fullAddress: String,
    ward: String,
    district: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi'
    }
  },

  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  lastLogin: Date
}, {
  timestamps: true
});

// Generate referral code before save
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = this._id.toString().substring(0, 8).toUpperCase();
  }
  next();
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(xp / 100))
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  if (this.level > 100) this.level = 100;
};

// Add XP and check level up
userSchema.methods.addXP = async function(amount) {
  const oldLevel = this.level;
  this.xp += amount;
  this.calculateLevel();
  
  const leveledUp = this.level > oldLevel;
  await this.save();
  
  return { leveledUp, newLevel: this.level, totalXP: this.xp };
};

module.exports = mongoose.model('User', userSchema);
