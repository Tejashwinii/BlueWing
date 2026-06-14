import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/**
 * Backend Application Entry Point
 *
 * Purpose:
 * Creates the Express app, connects MongoDB, registers global middleware,
 * mounts API route modules, and starts the BlueWing backend server.
 *
 * Workflow:
 * Client -> Express Middleware -> Route Module -> Controller -> Mongoose Model -> MongoDB
 *
 * Used By:
 * package.json scripts (`npm start`, `npm run dev`) and test imports that need the app.
 *
 * Dependencies:
 * config/database.js
 * routes/authRoutes.js
 * routes/flightRoutes.js
 * routes/bookingRoutes.js
 * routes/reviewRoutes.js
 * routes/otpRoutes.js
 *
 * Request Lifecycle:
 * Runs once at process startup. For each request, middleware executes first,
 * then the matching route delegates to a controller, and errors fall through
 * to the centralized error/404 handlers below.
 */

// connectDB opens the MongoDB connection before routes use Mongoose models.
import connectDB from './config/database.js';

// Route modules keep URL registration separate from controller logic.
import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import otpRoutes from './routes/otpRoutes.js';

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

// 2. Cache control middleware - disable caching for development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// 3. JSON parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// ROUTES
// =====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Request flow:
  // Receive health probe -> avoid database write -> return current server timestamp.
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

// 5. Booking routes
app.use('/api/bookings', bookingRoutes);

// 6. Review routes
app.use('/api/reviews', reviewRoutes);

// 7. OTP routes (send & verify)
app.use('/api', otpRoutes);

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
 *
 * Workflow:
 * Process startup -> MongoDB connection -> Express listen -> API requests can be served
 *
 * Inputs:
 * - PORT from environment or default 5000.
 *
 * Returns:
 * No response value; starts the HTTP listener as a side effect.
 *
 * Collections:
 * - None directly. connectDB initializes access to all collections.
 *
 * Why:
 * Centralizes startup ordering so controllers never run before MongoDB is connected.
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
