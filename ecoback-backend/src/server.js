const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://192.168.100.174:5173',
    process.env.CLIENT_URL
  ],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/qrcodes', require('./routes/qrcodeRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/collection-points', require('./routes/collectionPointRoutes'));
app.use('/api/recycle-requests', require('./routes/recycleRequestRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EcoBack API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be after routes)
const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`📡 Network: http://192.168.100.174:${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
