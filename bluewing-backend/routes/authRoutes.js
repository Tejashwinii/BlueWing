/**
 * Authentication Routes
 *
 * Purpose:
 * Maps auth, profile, OTP, and password reset HTTP endpoints to controller functions.
 *
 * Workflow:
 * Client Auth UI -> /api/auth route -> Auth/Otp Controller -> User collection / email service
 *
 * Used By:
 * server.js mounts this router at /api/auth.
 *
 * Dependencies:
 * controllers/authController.js handles registration, login, and profile updates.
 * controllers/otpController.js handles OTP delivery, verification, and password reset.
 * middleware/auth.js protects profile routes by validating JWTs.
 * middleware/validation.js validates register/login request bodies before controllers run.
 *
 * Request Lifecycle:
 * Runs after global Express middleware parses JSON. Route-specific validation or
 * authentication runs first, then the controller reads/writes MongoDB and returns JSON.
 */
import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { sendOtp, verifyOtp, resetPassword } from '../controllers/otpController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

// Validate registration payload -> create User document -> return JWT/user summary.
router.post('/register', validateRequest(registerSchema), register);
// Validate credentials -> compare User password hash -> return JWT/user summary.
router.post('/login', validateRequest(loginSchema), login);
// Verify JWT -> load current User profile -> return profile fields.
router.get('/profile', protect, getProfile);
// Verify JWT -> update allowed User profile fields -> return updated profile.
router.put('/profile', protect, updateProfile);

// OTP / Forgot Password routes
// Generate password-reset OTP -> send email -> store temporary OTP in memory.
router.post('/send-otp', sendOtp);
// Validate password-reset OTP -> mark temporary OTP as verified.
router.post('/verify-otp', verifyOtp);
// Require verified OTP -> update User password using User pre-save hashing.
router.post('/reset-password', resetPassword);

// Convert validation, duplicate email, and unhandled auth-route errors into JSON responses.
router.use((err, req, res, next) => {
  console.error('Auth Route Error:', err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
  }
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' });
});

export default router;