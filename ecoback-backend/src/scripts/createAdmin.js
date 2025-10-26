const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@ecoback.com',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'admin',
      phone: '0999999999',
      isVerified: true,
      wallet: {
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      },
      statistics: {
        totalScans: 0,
        totalPoints: 0,
        level: 1,
        currentXP: 0,
        totalCO2Saved: 0,
        totalTreesEquivalent: 0,
        totalWaterSaved: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@ecoback.com');
    console.log('Role: admin');
    console.log('================================');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdminUser();
