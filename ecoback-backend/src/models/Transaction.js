const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Transaction Type
  type: {
    type: String,
    enum: [
      'cashback',          // Cashback from product purchase
      'recycle-reward',    // Reward from recycling
      'referral-bonus',    // Referral commission
      'withdrawal',        // User withdraws money
      'refund',           // Refund to user
      'adjustment',       // Admin adjustment
      'purchase'          // User purchase (negative)
    ],
    required: true
  },

  // Amount
  amount: {
    type: Number,
    required: true
  },
  
  // Balance after transaction
  balanceAfter: {
    type: Number,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'processing'],
    default: 'pending'
  },

  // Description
  description: {
    type: String,
    required: true
  },

  // Related References
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  relatedQRCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  },
  relatedRecycleRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecycleRequest'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // For referral transactions
  },

  // Withdrawal Specific (if type = withdrawal)
  withdrawal: {
    method: {
      type: String,
      enum: ['bank-transfer', 'momo', 'zalopay', 'vnpay'],
    },
    bankName: String,
    accountNumber: String,
    accountName: String,
    phoneNumber: String,
    
    // Processing info
    requestedAt: Date,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactionCode: String, // External transaction ID
    
    // Rejection info
    rejectionReason: String
  },

  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    location: {
      lat: Number,
      lng: Number
    }
  },

  // Admin notes
  adminNotes: String,

  // Timestamps for different statuses
  completedAt: Date,
  failedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Calculate XP reward for transaction
transactionSchema.methods.calculateXPReward = function() {
  const xpRates = {
    'cashback': 10,           // 10 XP per cashback
    'recycle-reward': 20,     // 20 XP per recycle (more eco-friendly)
    'referral-bonus': 50,     // 50 XP per referral
    'withdrawal': 0,          // No XP for withdrawals
    'refund': 0,
    'adjustment': 0,
    'purchase': 5
  };

  const baseXP = xpRates[this.type] || 0;
  
  // Bonus XP based on amount (1 XP per 10,000 VND)
  const amountBonus = Math.floor(Math.abs(this.amount) / 10000);
  
  return baseXP + amountBonus;
};

// Auto-update user wallet
transactionSchema.post('save', async function(doc) {
  if (doc.status === 'completed' && doc.type !== 'withdrawal') {
    const User = mongoose.model('User');
    const user = await User.findById(doc.user);
    
    if (user) {
      // Update wallet balance
      user.wallet.balance = doc.balanceAfter;
      
      // Update earnings/withdrawals
      if (doc.amount > 0) {
        user.wallet.totalEarned += doc.amount;
      } else {
        user.wallet.totalWithdrawn += Math.abs(doc.amount);
      }

      // Add XP
      const xpReward = doc.calculateXPReward();
      if (xpReward > 0) {
        await user.addXP(xpReward);
      } else {
        await user.save();
      }
    }
  }
});

// Indexes for performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ 'withdrawal.method': 1, status: 1 });

// Static method to create transaction
transactionSchema.statics.createTransaction = async function(data) {
  const { userId, type, amount, description, relatedRefs, metadata, withdrawal } = data;
  
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Calculate new balance
  let newBalance = user.wallet.balance + amount;
  
  // Validate withdrawal
  if (type === 'withdrawal') {
    if (amount > 0) {
      throw new Error('Withdrawal amount must be negative');
    }
    if (Math.abs(amount) > user.wallet.balance) {
      throw new Error('Insufficient balance');
    }
  }

  // Create transaction
  const transaction = await this.create({
    user: userId,
    type,
    amount,
    balanceAfter: newBalance,
    description,
    status: type === 'withdrawal' ? 'pending' : 'completed',
    completedAt: type === 'withdrawal' ? undefined : new Date(),
    ...relatedRefs,
    metadata,
    withdrawal
  });

  return transaction;
};

module.exports = mongoose.model('Transaction', transactionSchema);
