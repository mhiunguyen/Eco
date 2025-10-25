// Seed Collection Points
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CollectionPoint = require('./src/models/CollectionPoint');
const User = require('./src/models/User');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedCollectionPoints = async () => {
  await connectDB();
  
  try {
    // Find an admin user to be the manager
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin found, using first user...');
      admin = await User.findOne();
      
      if (!admin) {
        console.log('❌ No users in database. Please create a user first.');
        process.exit(1);
      }
    }
    
    console.log(`Using manager: ${admin.fullName} (${admin.email})`);

    // Delete existing collection points
    await CollectionPoint.deleteMany({});

    const collectionPoints = [
      {
        name: 'EcoHub District 1',
        type: 'both',
        address: {
          fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1',
          ward: 'Bến Nghé',
          district: 'Quận 1',
          city: 'Hồ Chí Minh'
        },
        location: {
          type: 'Point',
          coordinates: [106.7009, 10.7741] // District 1, HCMC
        },
        contact: {
          phone: '0281234567',
          email: 'district1@ecohub.vn'
        },
        operatingHours: {
          monday: { open: '08:00', close: '18:00', isClosed: false },
          tuesday: { open: '08:00', close: '18:00', isClosed: false },
          wednesday: { open: '08:00', close: '18:00', isClosed: false },
          thursday: { open: '08:00', close: '18:00', isClosed: false },
          friday: { open: '08:00', close: '18:00', isClosed: false },
          saturday: { open: '09:00', close: '17:00', isClosed: false },
          sunday: { open: '09:00', close: '17:00', isClosed: false }
        },
        materialsAccepted: ['plastic', 'glass', 'paper', 'metal'],
        capacity: {
          current: 150,
          maximum: 1000,
          unit: 'kg'
        },
        facilities: ['parking', 'wheelchair-access', 'staff-assistance'],
        description: 'Trung tâm tái chế lớn tại Quận 1, nhận tất cả các loại vật liệu',
        isActive: true
      },
      {
        name: 'Green Point Binh Thanh',
        type: 'dropoff',
        address: {
          fullAddress: '456 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh',
          ward: 'Phường 25',
          district: 'Bình Thạnh',
          city: 'Hồ Chí Minh'
        },
        location: {
          type: 'Point',
          coordinates: [106.7144, 10.8012] // Binh Thanh, HCMC
        },
        contact: {
          phone: '0287654321',
          email: 'binhthanh@greenpoint.vn'
        },
        operatingHours: {
          monday: { open: '07:00', close: '19:00', isClosed: false },
          tuesday: { open: '07:00', close: '19:00', isClosed: false },
          wednesday: { open: '07:00', close: '19:00', isClosed: false },
          thursday: { open: '07:00', close: '19:00', isClosed: false },
          friday: { open: '07:00', close: '19:00', isClosed: false },
          saturday: { open: '08:00', close: '18:00', isClosed: false },
          sunday: { open: '08:00', close: '18:00', isClosed: false }
        },
        materialsAccepted: ['plastic', 'paper', 'metal'],
        capacity: {
          current: 80,
          maximum: 500,
          unit: 'kg'
        },
        facilities: ['indoor', 'staff-assistance'],
        description: 'Điểm thu gom thuận tiện tại Bình Thạnh',
        isActive: true
      },
      {
        name: 'Thu Duc EcoPark',
        type: 'both',
        address: {
          fullAddress: '12 Đường số 1, Phường Hiệp Bình Chánh, Thủ Đức',
          ward: 'Hiệp Bình Chánh',
          district: 'Thủ Đức',
          city: 'Hồ Chí Minh'
        },
        location: {
          type: 'Point',
          coordinates: [106.7281, 10.8506] // Thu Duc, HCMC
        },
        contact: {
          phone: '0289876543',
          email: 'thuduc@ecopark.vn'
        },
        operatingHours: {
          monday: { open: '06:00', close: '18:00', isClosed: false },
          tuesday: { open: '06:00', close: '18:00', isClosed: false },
          wednesday: { open: '06:00', close: '18:00', isClosed: false },
          thursday: { open: '06:00', close: '18:00', isClosed: false },
          friday: { open: '06:00', close: '18:00', isClosed: false },
          saturday: { open: '07:00', close: '17:00', isClosed: false },
          sunday: { open: '07:00', close: '17:00', isClosed: false }
        },
        materialsAccepted: ['plastic', 'glass', 'paper', 'metal', 'electronics'],
        capacity: {
          current: 200,
          maximum: 2000,
          unit: 'kg'
        },
        facilities: ['parking', 'outdoor', 'staff-assistance'],
        description: 'Trung tâm tái chế rộng lớn tại Thủ Đức, nhận cả thiết bị điện tử',
        isActive: true
      }
    ];

    const created = await CollectionPoint.insertMany(collectionPoints);
    
    console.log(`✅ Seeded ${created.length} collection points`);
    console.log('\nCollection Points:');
    created.forEach(cp => {
      console.log(`  - ${cp.name} (${cp.type})`);
      console.log(`    Address: ${cp.address.fullAddress}`);
      console.log(`    Location: [${cp.location.coordinates[0]}, ${cp.location.coordinates[1]}]`);
      console.log(`    Materials: ${cp.materialsAccepted.join(', ')}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding collection points:', error);
    process.exit(1);
  }
};

seedCollectionPoints();
