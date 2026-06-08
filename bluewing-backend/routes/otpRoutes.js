import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendOtp, verifyOtp } from '../controllers/otpController.js';

const router = express.Router();

// Send OTP to an email or booking (body: { email?, bookingId? })
router.post('/send-otp', protect, sendOtp);

// Verify OTP for booking cancellation or password flow (body: { otp, bookingId?, email? })
router.post('/verify-otp', protect, verifyOtp);

export default router;
