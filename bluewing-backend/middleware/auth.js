/**
 * Authentication and Authorization Middleware
 *
 * Purpose:
 * Generates JWTs and protects private/admin routes by validating tokens and user roles.
 *
 * Workflow:
 * Client sends Authorization header -> protect middleware -> Controller receives req.userId
 *
 * Used By:
 * routes/authRoutes.js, routes/bookingRoutes.js, routes/flightRoutes.js, routes/otpRoutes.js,
 * routes/reviewRoutes.js.
 *
 * Dependencies:
 * jsonwebtoken signs/verifies tokens; adminOnly dynamically imports User for role checks.
 *
 * Request Lifecycle:
 * Runs before protected controllers. Successful auth attaches req.userId; failed auth stops
 * the request with a 401 or 403 response.
 */
import jwt from 'jsonwebtoken';

/**
 * Generate a JWT for an authenticated user.
 *
 * Workflow:
 * Register/Login Controller -> generateToken -> frontend stores token -> protect middleware validates later requests
 *
 * Inputs:
 * - userId: User _id to encode in the token payload.
 *
 * Returns:
 * Signed JWT string valid for seven days.
 *
 * Collections:
 * - None. The user id comes from an already-created/read users document.
 *
 * Why:
 * Gives the frontend a portable proof of identity for profile, booking, admin, and review workflows.
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
 * Verify JWT and attach the authenticated user id to the request.
 *
 * Workflow:
 * Protected Route -> protect -> Controller receives req.userId
 *
 * Inputs:
 * - Authorization header containing a Bearer token or raw token.
 *
 * Returns:
 * Calls next() with req.userId on success, otherwise sends 401.
 *
 * Collections:
 * - None directly. Controllers use req.userId to query users/bookings/reviews.
 *
 * Why:
 * Enforces authentication before private profile, booking, OTP cancellation, and admin workflows.
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
 * Authorize a protected request as admin-only.
 *
 * Workflow:
 * Admin Route -> protect -> adminOnly -> admin controller action
 *
 * Inputs:
 * - req.userId set by protect.
 *
 * Returns:
 * Calls next() for admin users, sends 403/500 otherwise.
 *
 * Collections:
 * - users: reads the authenticated User document to check role === "admin".
 *
 * Why:
 * Protects flight creation/deletion and future admin operations from customer accounts.
 */
export const adminOnly = async (req, res, next) => {
  try {
    const { default: User } = await import('../models/User.js');
    // Read users to confirm the authenticated account has admin privileges.
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
 * Attach req.userId when a valid token is present, but allow anonymous requests.
 *
 * Workflow:
 * Public Route -> optionalAuth -> Controller can personalize if req.userId exists
 *
 * Inputs:
 * - Optional Authorization Bearer token.
 *
 * Returns:
 * Always calls next(), with req.userId only when verification succeeds.
 *
 * Collections:
 * - None directly.
 *
 * Why:
 * Supports public endpoints that can optionally behave differently for logged-in users.
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
