# 🌿 EcoBack - Hệ sinh thái mua sắm xanh

## 📋 Project Structure

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
