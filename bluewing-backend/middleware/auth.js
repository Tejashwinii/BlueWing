import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * @param {String} userId - User ID to encode in token
 * @returns {String} JWT token
 */
export const generateToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId }, // Payload
      process.env.JWT_SECRET, // Secret key
      { expiresIn: '7d', algorithm: 'HS256' } // Options
    );

    return token;
  } catch (error) {
    console.error('❌ Token generation error:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Protect Middleware - Verify JWT Token
 * Extracts token from Authorization header and verifies it
 * Sets req.userId if token is valid
 */
export const protect = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Extract token from "Bearer token" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) // Remove "Bearer " prefix
      : authHeader;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Set userId on request object
    req.userId = decoded.userId;

    // Continue to next middleware/route
    next();
  } catch (error) {
    // Handle different JWT errors
    let message = 'Token invalid or expired';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not yet valid';
    }

    console.error(`❌ Authentication error: ${message}`, error.message);

    return res.status(401).json({
      status: 'error',
      message: 'Token invalid or expired',
    });
  }
};

/**
 * Admin Only Middleware
 * Must be used AFTER protect middleware
 * Checks if the authenticated user has admin role
 */
export const adminOnly = async (req, res, next) => {
  try {
    const { default: User } = await import('../models/User.js');
    const user = await User.findById(req.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.',
      });
    }

    next();
  } catch (error) {
    console.error('❌ Admin check error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Authorization check failed',
    });
  }
};

/**
 * Optional Middleware - Get user if token exists
 * Does not throw error if no token provided
 * Useful for public routes that allow authenticated users
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Silently fail - allow request to continue without authentication
    console.warn('⚠️ Optional auth failed:', error.message);
    next();
  }
};
