# 🌿 EcoBack - Hệ sinh thái mua sắm xanh & Tái chế thông minh

> Ứng dụng kết nối người tiêu dùng với sản phẩm xanh, khuyến khích tái chế thông qua hệ thống cashback và điểm thưởng.

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.1.1-blue.svg)](https://react.dev/)

## 📸 Screenshots

```
[Sẽ thêm screenshots sau khi deploy]
```

---

## 📋 Tổng quan

**EcoBack** là nền tảng số hóa hoạt động mua sắm xanh và tái chế, giúp:
- 🛍️ Tìm kiếm sản phẩm thân thiện môi trường
- ♻️ Tái chế rác thải hiệu quả
- 💰 Nhận cashback và điểm thưởng
- 📱 Quét QR code trên bao bì để tích điểm
- 📍 Tìm điểm thu gom rác gần nhất
- 🤖 Chatbot AI hỗ trợ 24/7

---

## 🏗️ Kiến trúc Dự án

```
Eco/
├── ecoback-backend/          # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Database, Cloudinary config
│   │   ├── controllers/      # Business logic
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── QRCode.js
│   │   │   ├── Transaction.js
│   │   │   ├── CollectionPoint.js
│   │   │   ├── RecycleRequest.js
│   │   │   ├── Chat.js       # Chatbot AI
│   │   │   └── ...
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── ecoback-frontend/        # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── ChatBot.jsx  # AI Chatbot widget
│   │   │   └── layout/
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ChatPage.jsx # Full chat interface
│   │   │   └── ...
│   │   ├── services/       # API integration
│   │   │   ├── api.js
│   │   │   └── chatService.js
│   │   ├── store/          # State management (Zustand)
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Helper functions
│   ├── .env                # Environment variables
│   └── package.json
│
├── CHATBOT_README.md        # Chatbot documentation
├── IMPLEMENTATION_SUMMARY.md # Development summary
└── README.md               # This file
```

---

## 🚀 Hướng dẫn Cài đặt

### 📦 Prerequisites

Đảm bảo đã cài đặt:
- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **MongoDB** ([Community Server](https://www.mongodb.com/try/download/community) hoặc [Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))
- **npm** hoặc **yarn**

### 🔧 Clone Repository

```bash
git clone https://github.com/mhiunguyen/Eco.git
cd Eco
```

---

## ⚙️ Backend Setup

### 1. Cài đặt Dependencies

```bash
cd ecoback-backend
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `ecoback-backend/`:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoback
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecoback

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Cloudinary (Upload ảnh)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173

# Payment Gateways (Optional - Phase 2)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
```

### 3. Start MongoDB

**Option A: MongoDB Local**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Tạo cluster miễn phí tại: https://www.mongodb.com/cloud/atlas
- Whitelist IP: `0.0.0.0/0` (cho development)
- Copy connection string vào `MONGODB_URI`

### 4. Chạy Backend

```bash
npm run dev
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

---

## 🎨 Frontend Setup

### 1. Cài đặt Dependencies

```bash
cd ecoback-frontend
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `ecoback-frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key-optional
```

### 3. Chạy Frontend

```bash
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

---

## 🗄️ Database Models

| Model | Mô tả |
|-------|-------|
| **User** | Người dùng, ví điện tử, environmental impact |
| **Product** | Sản phẩm, thuộc tính xanh, packaging info |
| **Brand** | Thương hiệu, ESG commitments |
| **QRCode** | Mã QR trên sản phẩm, tracking, rewards |
| **Transaction** | Giao dịch cashback, tái chế, rút tiền |
| **CollectionPoint** | Điểm thu gom rác, smart bins |
| **RecycleRequest** | Yêu cầu thu gom, lịch hẹn |
| **Review** | Đánh giá sản phẩm và dịch vụ |
| **Chat** | Lịch sử chat với AI bot |

---

## 🔌 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register       # Đăng ký
POST   /api/auth/login          # Đăng nhập
GET    /api/auth/me             # Thông tin user hiện tại
```

### 🛍️ Products
```
GET    /api/products            # Danh sách sản phẩm
GET    /api/products/green      # Sản phẩm xanh
GET    /api/products/:id        # Chi tiết sản phẩm
POST   /api/products            # Tạo sản phẩm (Admin)
```

### 📱 QR Codes
```
GET    /api/qr/scan/:code       # Quét QR code
POST   /api/qr/activate         # Kích hoạt cashback
POST   /api/qr/recycle          # Đánh dấu đã tái chế
```

### 💰 Wallet & Transactions
```
GET    /api/wallet/balance      # Số dư ví
GET    /api/transactions        # Lịch sử giao dịch
POST   /api/transactions/withdrawal # Yêu cầu rút tiền
```

### 📍 Collection Points
```
GET    /api/collection-points   # Danh sách điểm thu gom
GET    /api/collection-points/nearby # Điểm gần nhất
```

### ♻️ Recycle Requests
```
POST   /api/recycle/request-pickup # Đặt lịch thu gom
GET    /api/recycle/requests    # Lịch sử yêu cầu
```

### 🤖 AI Chatbot
```
POST   /api/chat/message        # Gửi tin nhắn
GET    /api/chat/history/:sessionId # Lịch sử chat
DELETE /api/chat/session/:sessionId # Xóa chat
GET    /api/chat/sessions       # Các phiên chat (Protected)
```

---

## 📱 Frontend Pages

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products/:id` | Chi tiết sản phẩm |
| `/scan` | Quét QR code (Protected) |
| `/wallet` | Ví điện tử (Protected) |
| `/profile` | Thông tin cá nhân (Protected) |
| `/map` | Bản đồ điểm thu gom |
| `/chat` | Chat với AI bot |
| `/leaderboard` | Bảng xếp hạng |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1
- **Database**: MongoDB + Mongoose 8.19
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password Hashing**: Bcryptjs 3.0
- **File Upload**: Multer 2.0 + Sharp 0.34
- **Cloud Storage**: Cloudinary 2.8
- **Validation**: Express Validator 7.3
- **Security**: Helmet 8.1, CORS 2.8
- **Logging**: Morgan 1.10

### Frontend
- **Library**: React 19.1
- **Build Tool**: Vite 7.1
- **Styling**: TailwindCSS 4.1
- **Routing**: React Router DOM 7.9
- **State Management**: Zustand 5.0
- **Data Fetching**: Axios 1.12
- **Forms**: React Hook Form 7.65 + Zod 4.1
- **Maps**: Leaflet 1.9 + React Leaflet 5.0
- **QR Scanner**: html5-qrcode 2.3
- **Icons**: Lucide React 0.548
- **PWA**: Vite Plugin PWA

---

## 🎯 Tính năng Chính

### ✅ Đã hoàn thành (Phase 1)
- ✅ Đăng ký / Đăng nhập người dùng
- ✅ Danh mục sản phẩm xanh
- ✅ Quét QR code trên bao bì
- ✅ Hệ thống cashback tự động
- ✅ Ví điện tử & lịch sử giao dịch
- ✅ Bản đồ điểm thu gom rác
- ✅ Đặt lịch thu gom tận nhà
- ✅ Hồ sơ người dùng & tác động môi trường
- ✅ Hệ thống đánh giá sản phẩm
- ✅ **AI Chatbot hỗ trợ 24/7** 🤖

### 🚧 Đang phát triển (Phase 2)
- 🚧 Tích hợp OpenAI/Gemini cho chatbot
- 🚧 Gợi ý sản phẩm cá nhân hóa
- 🚧 Tích hợp thanh toán (MoMo, VNPay)
- 🚧 Admin dashboard
- 🚧 Thống kê & báo cáo
- 🚧 Push notifications
- 🚧 Voice search

---

## 🤖 AI Chatbot

EcoBot là trợ lý AI thông minh, hỗ trợ:
- 🛍️ Tư vấn sản phẩm xanh
- ♻️ Hướng dẫn tái chế
- 💰 Hỗ trợ về ví điện tử
- 📱 Hướng dẫn sử dụng app
- 📍 Tìm điểm thu gom

**Xem chi tiết:** [CHATBOT_README.md](CHATBOT_README.md)

### Sử dụng Chatbot:
1. Click nút chat nổi ở góc phải màn hình
2. Hoặc truy cập: `/chat`
3. Hỏi bất kỳ câu hỏi nào về EcoBack!

---

## 📝 Development Workflow

### 1️⃣ Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 2️⃣ Start Backend
```bash
cd ecoback-backend
npm run dev
```
✅ Backend: http://localhost:5000

### 3️⃣ Start Frontend
```bash
cd ecoback-frontend
npm run dev
```
✅ Frontend: http://localhost:5173

### 4️⃣ Test API
```bash
# Health check
curl http://localhost:5000/health

# Test chatbot
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Xin chào","sessionId":"test123"}'
```

---

## 🧪 Testing

### Backend Tests
```bash
cd ecoback-backend
npm test

# Test chatbot
node test-chatbot.js
```

### Frontend Tests
```bash
cd ecoback-frontend
npm test
```

---

## 🐛 Troubleshooting

### ❌ Backend không start
```bash
# Kiểm tra MongoDB đang chạy
mongosh

# Kiểm tra port 5000
netstat -ano | findstr :5000

# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### ❌ Frontend không start
```bash
# Xóa cache Vite
rm -rf node_modules/.vite-temp

# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### ❌ MongoDB connection error
- Kiểm tra MongoDB service đang chạy
- Nếu dùng Atlas, whitelist IP: `0.0.0.0/0`
- Kiểm tra `MONGODB_URI` trong `.env`

### ❌ CORS errors
- Kiểm tra `CLIENT_URL` trong backend `.env`
- Đảm bảo frontend URL match với CORS config

---

## 📦 Deployment

### Backend (Vercel/Render)
```bash
# Build
npm run build

# Deploy
vercel deploy --prod
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy
vercel deploy --prod
```

---

## 📊 Roadmap

### Phase 1 ✅ (Hoàn thành)
- Authentication & Authorization
- Product catalog
- QR code system
- Wallet & transactions
- Collection points
- AI Chatbot

### Phase 2 🚧 (Q1 2026)
- Advanced AI with GPT-4/Gemini
- Payment gateway integration
- Admin dashboard
- Real-time notifications
- Analytics & reporting

### Phase 3 📅 (Q2 2026)
- Mobile app (React Native)
- IoT integration (smart bins)
- Blockchain rewards
- Gamification
- Social features

---

## 👥 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! 

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Liên hệ

**Email**: mhiuqrqq1411@gmail.com  
**GitHub**: [@mhiunguyen](https://github.com/mhiunguyen)  
**Project Link**: [https://github.com/mhiunguyen/Eco](https://github.com/mhiunguyen/Eco)

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Lucide Icons](https://lucide.dev/)
- [Leaflet](https://leafletjs.com/)

---

<div align="center">

**Built with 💚 for a sustainable future**

⭐ Star us on GitHub — it helps!

[Report Bug](https://github.com/mhiunguyen/Eco/issues) · [Request Feature](https://github.com/mhiunguyen/Eco/issues)

</div>

```
ecoback/
├── ecoback-backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database, Cloudinary config
│   │   ├── controllers/      # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
│
└── ecoback-frontend/        # React + Vite
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API calls
    │   ├── hooks/          # Custom React hooks
    │   ├── store/          # Zustand state management
    │   ├── utils/          # Helper functions
    │   ├── config/         # App configuration
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── .env                # Environment variables
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd ecoback-backend

# Install dependencies
npm install

# Configure environment
# Update .env file with your credentials

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd ecoback-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App runs on http://localhost:5173
```

## 🗄️ Database Models

- **Users**: Authentication, wallet, environmental impact
- **Products**: Catalog, green attributes, packaging info
- **Brands**: Partner brands, ESG commitments
- **QRCodes**: Product QR codes, tracking, rewards
- **Transactions**: Cashback, recycling rewards, withdrawals
- **CollectionPoints**: Recycling locations, smart bins
- **RecycleRequests**: Pickup requests, drop-off records
- **Reviews**: Product and service reviews

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/green` - Green products only
- `GET /api/products/:id` - Product details
- `POST /api/products` - Create product (Admin)

### QR Codes
- `GET /api/qr/scan/:qrCode` - Scan QR code
- `POST /api/qr/activate` - Activate cashback
- `POST /api/qr/recycle` - Mark as recycled

### Wallet & Transactions
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/transactions` - Transaction history
- `POST /api/transactions/withdrawal` - Request withdrawal

### Collection Points
- `GET /api/collection-points` - List all points
- `GET /api/collection-points/nearby` - Nearby points

### Recycle Requests
- `POST /api/recycle/request-pickup` - Request pickup
- `GET /api/recycle/requests` - User's requests

## 📱 Frontend Pages

- `/` - Homepage
- `/products` - Product catalog
- `/products/:id` - Product detail
- `/products/green` - Green products
- `/scan` - QR scanner
- `/wallet` - User wallet
- `/profile` - User profile
- `/collection-points` - Map view
- `/recycle/request` - Request pickup
- `/login` - Login page
- `/register` - Register page

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for passwords
- Multer + Sharp (image upload)
- Cloudinary (cloud storage)
- Express Validator

### Frontend
- React 18 + Vite
- TailwindCSS
- React Router v6
- Zustand (state management)
- React Query (data fetching)
- Axios (HTTP client)
- React Hook Form + Zod
- Leaflet (maps)
- Lucide React (icons)

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecoback
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
```

## 📝 Development Workflow

1. **Start MongoDB** (if local)
2. **Start Backend**: `cd ecoback-backend && npm run dev`
3. **Start Frontend**: `cd ecoback-frontend && npm run dev`
4. **Access App**: http://localhost:5173

## 🎯 Phase 1 MVP Features

✅ User authentication (register/login)
✅ Product catalog with green products
✅ QR code scanning system
✅ Cashback activation
✅ Wallet & transaction history
✅ Collection points map
✅ Pickup request system
✅ User profile & environmental impact
✅ Reviews system

⏸️ **AI Recommendations** - Phase 2

## 📊 Next Steps

- [ ] Complete all database models
- [ ] Implement authentication system
- [ ] Build product catalog
- [ ] QR code generation & scanning
- [ ] Wallet & transactions
- [ ] Collection points map
- [ ] User profile & impact tracking
- [ ] Admin dashboard
- [ ] Payment gateway integration
- [ ] Testing & deployment

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify .env file exists and is configured
- Check port 5000 is not in use

### Frontend won't start
- Clear node_modules and reinstall
- Check .env file
- Verify backend is running

## 📞 Support

- Email: mhiuqrqq1411@gmail.com

---

**Built with 💚 for a sustainable future**
