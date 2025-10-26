const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CollectionPoint = require('../models/CollectionPoint');

dotenv.config();

const collectionPoints = [
  {
    name: 'Trung tâm tái chế Quận 1',
    address: {
      street: '123 Nguyễn Huệ',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'TP.HCM',
      fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.7009, 10.7756]
    },
    type: 'both',
    materialsAccepted: ['plastic', 'glass', 'paper', 'metal'],
    capacity: {
      current: 250,
      maximum: 1000,
      unit: 'kg'
    },
    contact: {
      phone: '0901234567',
      email: 'q1@ecoback.vn',
      manager: 'Nguyễn Văn A'
    },
    operatingHours: {
      monday: { open: '08:00', close: '18:00', isClosed: false },
      tuesday: { open: '08:00', close: '18:00', isClosed: false },
      wednesday: { open: '08:00', close: '18:00', isClosed: false },
      thursday: { open: '08:00', close: '18:00', isClosed: false },
      friday: { open: '08:00', close: '18:00', isClosed: false },
      saturday: { open: '08:00', close: '16:00', isClosed: false },
      sunday: { open: '09:00', close: '15:00', isClosed: false }
    },
    facilities: ['parking', 'indoor', 'staff-assistance'],
    description: 'Trung tâm tái chế lớn nhất Quận 1',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Điểm thu gom Bình Thạnh',
    address: {
      street: '456 Điện Biên Phủ',
      ward: 'Phường 25',
      district: 'Quận Bình Thạnh',
      city: 'TP.HCM',
      fullAddress: '456 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.7054, 10.8142]
    },
    type: 'dropoff',
    materialsAccepted: ['plastic', 'paper', 'electronics'],
    capacity: {
      current: 150,
      maximum: 800,
      unit: 'kg'
    },
    contact: {
      phone: '0902345678',
      email: 'binhthanh@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '07:00', close: '19:00', isClosed: false },
      tuesday: { open: '07:00', close: '19:00', isClosed: false },
      wednesday: { open: '07:00', close: '19:00', isClosed: false },
      thursday: { open: '07:00', close: '19:00', isClosed: false },
      friday: { open: '07:00', close: '19:00', isClosed: false },
      saturday: { open: '08:00', close: '17:00', isClosed: false },
      sunday: { open: '00:00', close: '00:00', isClosed: true }
    },
    facilities: ['outdoor', 'wheelchair-access'],
    description: 'Điểm thu gom chuyên về nhựa và giấy',
    isActive: true
  },
  {
    name: 'Trạm tái chế Tân Bình',
    address: {
      street: '789 Cộng Hòa',
      ward: 'Phường 13',
      district: 'Quận Tân Bình',
      city: 'TP.HCM',
      fullAddress: '789 Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.6525, 10.8006]
    },
    type: 'pickup',
    materialsAccepted: ['plastic', 'glass', 'metal', 'electronics'],
    capacity: {
      current: 300,
      maximum: 1200,
      unit: 'kg'
    },
    contact: {
      phone: '0903456789',
      email: 'tanbinh@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '06:00', close: '20:00', isClosed: false },
      tuesday: { open: '06:00', close: '20:00', isClosed: false },
      wednesday: { open: '06:00', close: '20:00', isClosed: false },
      thursday: { open: '06:00', close: '20:00', isClosed: false },
      friday: { open: '06:00', close: '20:00', isClosed: false },
      saturday: { open: '07:00', close: '18:00', isClosed: false },
      sunday: { open: '08:00', close: '16:00', isClosed: false }
    },
    facilities: ['parking', 'indoor'],
    description: 'Dịch vụ thu gom tận nơi',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Trung tâm môi trường Phú Nhuận',
    address: {
      street: '321 Phan Đăng Lưu',
      ward: 'Phường 1',
      district: 'Quận Phú Nhuận',
      city: 'TP.HCM',
      fullAddress: '321 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.6833, 10.7972]
    },
    type: 'both',
    materialsAccepted: ['plastic', 'glass', 'paper', 'metal', 'electronics'],
    capacity: {
      current: 400,
      maximum: 1500,
      unit: 'kg'
    },
    contact: {
      phone: '0904567890',
      email: 'phunhuan@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '08:00', close: '17:00', isClosed: false },
      tuesday: { open: '08:00', close: '17:00', isClosed: false },
      wednesday: { open: '08:00', close: '17:00', isClosed: false },
      thursday: { open: '08:00', close: '17:00', isClosed: false },
      friday: { open: '08:00', close: '17:00', isClosed: false },
      saturday: { open: '08:00', close: '12:00', isClosed: false },
      sunday: { open: '00:00', close: '00:00', isClosed: true }
    },
    facilities: ['staff-assistance', 'indoor'],
    description: 'Trung tâm xử lý rác điện tử',
    isActive: true,
    isVerified: true,
    isFeatured: true
  },
  {
    name: 'Điểm xanh Quận 3',
    address: {
      street: '555 Võ Văn Tần',
      ward: 'Phường 5',
      district: 'Quận 3',
      city: 'TP.HCM',
      fullAddress: '555 Võ Văn Tần, Phường 5, Quận 3, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.6894, 10.7867]
    },
    type: 'dropoff',
    materialsAccepted: ['plastic', 'paper'],
    capacity: {
      current: 100,
      maximum: 500,
      unit: 'kg'
    },
    contact: {
      phone: '0905678901',
      email: 'q3@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '07:00', close: '18:00', isClosed: false },
      tuesday: { open: '07:00', close: '18:00', isClosed: false },
      wednesday: { open: '07:00', close: '18:00', isClosed: false },
      thursday: { open: '07:00', close: '18:00', isClosed: false },
      friday: { open: '07:00', close: '18:00', isClosed: false },
      saturday: { open: '08:00', close: '15:00', isClosed: false },
      sunday: { open: '08:00', close: '15:00', isClosed: false }
    },
    facilities: ['outdoor'],
    description: 'Điểm thu gom Quận 3',
    isActive: true
  },
  {
    name: 'Trạm thu gom Gò Vấp',
    address: {
      street: '888 Quang Trung',
      ward: 'Phường 8',
      district: 'Quận Gò Vấp',
      city: 'TP.HCM',
      fullAddress: '888 Quang Trung, Phường 8, Quận Gò Vấp, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.6670, 10.8384]
    },
    type: 'both',
    materialsAccepted: ['plastic', 'glass', 'metal'],
    capacity: {
      current: 200,
      maximum: 900,
      unit: 'kg'
    },
    contact: {
      phone: '0906789012',
      email: 'govap@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '06:30', close: '19:00', isClosed: false },
      tuesday: { open: '06:30', close: '19:00', isClosed: false },
      wednesday: { open: '06:30', close: '19:00', isClosed: false },
      thursday: { open: '06:30', close: '19:00', isClosed: false },
      friday: { open: '06:30', close: '19:00', isClosed: false },
      saturday: { open: '07:00', close: '17:00', isClosed: false },
      sunday: { open: '08:00', close: '16:00', isClosed: false }
    },
    facilities: ['parking', 'outdoor'],
    description: 'Trạm thu gom rộng rãi',
    isActive: true
  },
  {
    name: 'Trung tâm tái chế Thủ Đức',
    address: {
      street: '999 Kha Vạn Cân',
      ward: 'Phường Linh Chiểu',
      district: 'TP.Thủ Đức',
      city: 'TP.HCM',
      fullAddress: '999 Kha Vạn Cân, Phường Linh Chiểu, TP.Thủ Đức, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.7583, 10.8507]
    },
    type: 'pickup',
    materialsAccepted: ['plastic', 'glass', 'paper', 'metal', 'electronics'],
    capacity: {
      current: 500,
      maximum: 2000,
      unit: 'kg'
    },
    contact: {
      phone: '0907890123',
      email: 'thuduc@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '07:00', close: '20:00', isClosed: false },
      tuesday: { open: '07:00', close: '20:00', isClosed: false },
      wednesday: { open: '07:00', close: '20:00', isClosed: false },
      thursday: { open: '07:00', close: '20:00', isClosed: false },
      friday: { open: '07:00', close: '20:00', isClosed: false },
      saturday: { open: '08:00', close: '18:00', isClosed: false },
      sunday: { open: '08:00', close: '17:00', isClosed: false }
    },
    facilities: ['parking', 'indoor', 'staff-assistance'],
    description: 'Trung tâm hiện đại Thủ Đức',
    isActive: true,
    isVerified: true,
    isFeatured: true
  },
  {
    name: 'Điểm xanh Quận 7',
    address: {
      street: '246 Nguyễn Văn Linh',
      ward: 'Phường Tân Phú',
      district: 'Quận 7',
      city: 'TP.HCM',
      fullAddress: '246 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM'
    },
    location: {
      type: 'Point',
      coordinates: [106.7219, 10.7333]
    },
    type: 'dropoff',
    materialsAccepted: ['plastic', 'glass', 'paper'],
    capacity: {
      current: 180,
      maximum: 700,
      unit: 'kg'
    },
    contact: {
      phone: '0908901234',
      email: 'q7@ecoback.vn'
    },
    operatingHours: {
      monday: { open: '08:00', close: '18:00', isClosed: false },
      tuesday: { open: '08:00', close: '18:00', isClosed: false },
      wednesday: { open: '08:00', close: '18:00', isClosed: false },
      thursday: { open: '08:00', close: '18:00', isClosed: false },
      friday: { open: '08:00', close: '18:00', isClosed: false },
      saturday: { open: '08:00', close: '16:00', isClosed: false },
      sunday: { open: '00:00', close: '00:00', isClosed: true }
    },
    facilities: ['parking', 'wheelchair-access'],
    description: 'Điểm thu gom Phú Mỹ Hưng',
    isActive: true
  }
];

const seedCollectionPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await CollectionPoint.deleteMany({});
    console.log('Cleared existing collection points');

    const createdPoints = await CollectionPoint.insertMany(collectionPoints);
    console.log(`Created ${createdPoints.length} collection points`);

    console.log('\nCollection Points:');
    createdPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point.name} - ${point.location.address}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedCollectionPoints();
