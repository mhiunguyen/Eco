const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Brand = require('./src/models/Brand');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create brand user
    const brandUser = await User.findOne({ email: 'testapi@test.com' });
    
    if (!brandUser) {
      console.log('❌ Please register a user first');
      process.exit(1);
    }

    // Create brands
    const brands = await Brand.create([
      {
        name: 'EcoLife Vietnam',
        logo: 'https://via.placeholder.com/200x200?text=EcoLife',
        coverImage: 'https://via.placeholder.com/1200x400?text=EcoLife+Cover',
        description: 'Thương hiệu sản phẩm xanh hàng đầu Việt Nam, cam kết bảo vệ môi trường',
        contact: {
          email: 'contact@ecolife.vn',
          phone: '0901234567',
          website: 'https://ecolife.vn',
          address: 'Hà Nội, Việt Nam'
        },
        partnership: {
          tier: 'platinum',
          commissionRate: 8
        },
        esgCommitment: {
          sustainabilityScore: 95,
          certifications: [
            { name: 'ISO 14001', verifiedDate: new Date() },
            { name: 'B Corp Certified', verifiedDate: new Date() }
          ],
          recyclingProgram: {
            hasProgram: true,
            description: 'Thu gom và tái chế 100% bao bì sản phẩm',
            materialsAccepted: ['plastic', 'glass', 'paper']
          }
        },
        cashbackSettings: {
          defaultRate: 8,
          maxCashbackPerProduct: 100000
        },
        user: brandUser._id,
        isVerified: true,
        isFeatured: true
      },
      {
        name: 'Green Choice',
        logo: 'https://via.placeholder.com/200x200?text=GreenChoice',
        description: 'Lựa chọn xanh cho cuộc sống bền vững',
        contact: {
          email: 'hello@greenchoice.vn',
          phone: '0907654321',
          website: 'https://greenchoice.vn'
        },
        partnership: {
          tier: 'gold',
          commissionRate: 10
        },
        esgCommitment: {
          sustainabilityScore: 88,
          recyclingProgram: {
            hasProgram: true,
            materialsAccepted: ['plastic', 'paper']
          }
        },
        user: brandUser._id,
        isVerified: true,
        isFeatured: true
      },
      {
        name: 'Pure Nature',
        logo: 'https://via.placeholder.com/200x200?text=PureNature',
        description: 'Sản phẩm organic từ thiên nhiên',
        contact: {
          email: 'info@purenature.vn',
          phone: '0909876543'
        },
        partnership: {
          tier: 'silver',
          commissionRate: 12
        },
        esgCommitment: {
          sustainabilityScore: 92,
          certifications: [
            { name: 'Organic Certified', verifiedDate: new Date() }
          ]
        },
        user: brandUser._id,
        isVerified: true
      }
    ]);

    console.log(`✅ Created ${brands.length} brands`);

    // Create products
    const products = await Product.create([
      // EcoLife Products
      {
        name: 'Bộ đồ ăn tre tự nhiên cao cấp',
        description: 'Bộ đồ ăn làm từ tre 100% tự nhiên, không chứa hóa chất độc hại. Phân hủy sinh học sau 6 tháng.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Bamboo+Set', isMain: true }
        ],
        brand: brands[0]._id,
        category: 'household',
        price: 350000,
        originalPrice: 450000,
        cashback: {
          type: 'percentage',
          value: 8,
          maxAmount: 50000
        },
        packaging: {
          materials: [
            { type: 'paper', percentage: 80, recyclable: true },
            { type: 'biodegradable', percentage: 20, recyclable: true }
          ],
          weight: 500,
          dimensions: { length: 30, width: 20, height: 10 },
          isRecyclable: true,
          recycleReward: 15000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          isVegan: true,
          isCrueltyFree: true,
          certifications: [
            { name: 'FSC Certified' }
          ],
          carbonFootprint: 0.8,
          sustainabilityScore: 95
        },
        sku: 'ECO-BAMBOO-001',
        stock: 100,
        hasQRCode: true
      },
      {
        name: 'Túi vải canvas organic  có thể tái sử dụng',
        description: 'Túi vải canvas làm từ bông organic, bền chắc, có thể giặt máy. Thay thế túi nilon hoàn hảo.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Canvas+Bag', isMain: true }
        ],
        brand: brands[0]._id,
        category: 'fashion',
        price: 120000,
        cashback: {
          type: 'fixed',
          value: 10000
        },
        packaging: {
          materials: [
            { type: 'paper', percentage: 100, recyclable: true }
          ],
          weight: 200,
          isRecyclable: true,
          recycleReward: 8000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          sustainabilityScore: 90
        },
        sku: 'ECO-BAG-001',
        stock: 200,
        hasQRCode: true
      },
      {
        name: 'Bàn chải đánh răng tre biodegradable',
        description: 'Bàn chải tre với lông bàn chải từ sợi tre tự nhiên. Phân hủy hoàn toàn sau 6-12 tháng.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Bamboo+Toothbrush', isMain: true }
        ],
        brand: brands[0]._id,
        category: 'personal-care',
        price: 45000,
        cashback: {
          type: 'percentage',
          value: 10
        },
        packaging: {
          materials: [
            { type: 'paper', percentage: 100, recyclable: true }
          ],
          weight: 30,
          isRecyclable: true,
          recycleReward: 3000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isVegan: true,
          isCrueltyFree: true,
          sustainabilityScore: 98
        },
        sku: 'ECO-BRUSH-001',
        stock: 500,
        hasQRCode: true,
        isFeatured: true
      },

      // Green Choice Products
      {
        name: 'Nước rửa chén hữu cơ chiết xuất chanh',
        description: 'Nước rửa chén từ nguyên liệu tự nhiên, không chứa hóa chất độc hại. An toàn cho da tay và môi trường.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Dish+Soap', isMain: true }
        ],
        brand: brands[1]._id,
        category: 'household',
        price: 85000,
        originalPrice: 120000,
        cashback: {
          type: 'percentage',
          value: 7
        },
        packaging: {
          materials: [
            { type: 'plastic', percentage: 100, recyclable: true }
          ],
          weight: 600,
          isRecyclable: true,
          recycleReward: 10000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          isCrueltyFree: true,
          sustainabilityScore: 85
        },
        sku: 'GC-DISH-001',
        stock: 150,
        hasQRCode: true,
        isFeatured: true
      },
      {
        name: 'Giấy vệ sinh tre không tẩy trắng',
        description: 'Giấy vệ sinh làm từ 100% sợi tre, không tẩy trắng, mềm mại và thân thiện với môi trường.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Bamboo+Tissue', isMain: true }
        ],
        brand: brands[1]._id,
        category: 'household',
        price: 65000,
        cashback: {
          type: 'percentage',
          value: 5
        },
        packaging: {
          materials: [
            { type: 'paper', percentage: 100, recyclable: true }
          ],
          weight: 400,
          isRecyclable: true,
          recycleReward: 5000
        },
        greenAttributes: {
          isEcoFriendly: true,
          sustainabilityScore: 88
        },
        sku: 'GC-TISSUE-001',
        stock: 300,
        hasQRCode: true
      },

      // Pure Nature Products
      {
        name: 'Dầu gội organic chiết xuất bưởi',
        description: 'Dầu gội từ tinh dầu bưởi tự nhiên, giúp tóc chắc khỏe, giảm rụng tóc. Không chứa sulfate và paraben.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Organic+Shampoo', isMain: true }
        ],
        brand: brands[2]._id,
        category: 'personal-care',
        price: 180000,
        cashback: {
          type: 'percentage',
          value: 10
        },
        packaging: {
          materials: [
            { type: 'glass', percentage: 100, recyclable: true }
          ],
          weight: 350,
          isRecyclable: true,
          recycleReward: 12000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          isVegan: true,
          isCrueltyFree: true,
          certifications: [
            { name: 'USDA Organic' }
          ],
          sustainabilityScore: 92
        },
        sku: 'PN-SHAMPOO-001',
        stock: 120,
        hasQRCode: true,
        isFeatured: true
      },
      {
        name: 'Kem dưỡng da organic tinh chất trà xanh',
        description: 'Kem dưỡng da từ tinh chất trà xanh organic, giúp dưỡng ẩm và chống lão hóa tự nhiên.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Organic+Cream', isMain: true }
        ],
        brand: brands[2]._id,
        category: 'personal-care',
        price: 250000,
        originalPrice: 320000,
        cashback: {
          type: 'fixed',
          value: 30000
        },
        packaging: {
          materials: [
            { type: 'glass', percentage: 80, recyclable: true },
            { type: 'paper', percentage: 20, recyclable: true }
          ],
          weight: 200,
          isRecyclable: true,
          recycleReward: 15000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          isVegan: true,
          isCrueltyFree: true,
          sustainabilityScore: 94
        },
        sku: 'PN-CREAM-001',
        stock: 80,
        hasQRCode: true,
        isFeatured: true
      },
      {
        name: 'Combo 3 xà phòng handmade organic',
        description: 'Bộ 3 xà phòng thủ công từ tinh dầu thiên nhiên: Lavender, Trà xanh, Nghệ mật ong.',
        images: [
          { url: 'https://via.placeholder.com/600x600?text=Handmade+Soap', isMain: true }
        ],
        brand: brands[2]._id,
        category: 'personal-care',
        price: 150000,
        cashback: {
          type: 'percentage',
          value: 12
        },
        packaging: {
          materials: [
            { type: 'paper', percentage: 100, recyclable: true }
          ],
          weight: 300,
          isRecyclable: true,
          recycleReward: 10000
        },
        greenAttributes: {
          isEcoFriendly: true,
          isOrganic: true,
          isVegan: true,
          isCrueltyFree: true,
          isFairTrade: true,
          sustainabilityScore: 96
        },
        sku: 'PN-SOAP-COMBO-001',
        stock: 150,
        hasQRCode: true
      }
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Update brand stats
    for (const brand of brands) {
      const productCount = products.filter(p => p.brand.toString() === brand._id.toString()).length;
      brand.stats.totalProducts = productCount;
      await brand.save();
    }

    console.log('✅ Updated brand stats');
    console.log('\n🎉 Seed data created successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- ${brands.length} Brands`);
    console.log(`- ${products.length} Products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
