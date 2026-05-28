import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { sendOtp, verifyOtp, resetPassword } from '../controllers/otpController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// OTP / Forgot Password routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

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