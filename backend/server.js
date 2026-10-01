const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body parser & CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food-items', require('./routes/foodItemRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Ordering REST API Server Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      foodItems: '/api/food-items',
      orders: '/api/orders',
    },
  });
});

// 404 Handler for non-existent routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} Not Found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
