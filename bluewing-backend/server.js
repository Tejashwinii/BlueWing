import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// =====================
// MIDDLEWARE (Order matters!)
// =====================

// 1. CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 2. JSON parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// ROUTES
// =====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server running',
    timestamp: new Date().toISOString()
  });
});

// 3. Auth routes
app.use('/api/auth', authRoutes);

// 4. Flight routes
app.use('/api/flights', flightRoutes);

// =====================
// ERROR HANDLING
// =====================

// 4. Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// =====================
// START SERVER
// =====================

const PORT = process.env.PORT || 5000;

/**
 * Start server and connect to database
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('🛫 ===================================');
      console.log('   BLUEWING AIRLINES BACKEND API');
      console.log('🛫 ===================================');
      console.log('');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
      console.log(`✈️  Flight routes: http://localhost:${PORT}/api/flights`);
      console.log('');
      console.log('📌 Available Auth Endpoints:');
      console.log('   POST /api/auth/register - Register new user');
      console.log('   POST /api/auth/login    - Login user');
      console.log('   GET  /api/auth/profile  - Get user profile (protected)');
      console.log('');
      console.log('📌 Available Flight Endpoints:');
      console.log('   GET  /api/flights               - Get all flights (paginated)');
      console.log('   GET  /api/flights/featured      - Get featured flights');
      console.log('   POST /api/flights/search        - Search flights by route & date');
      console.log('   GET  /api/flights/:id           - Get flight by ID');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
