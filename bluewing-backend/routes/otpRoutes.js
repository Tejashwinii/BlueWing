/**
 * OTP Routes
 *
 * Purpose:
 * Exposes protected OTP endpoints used mainly by booking cancellation workflows.
 *
 * Workflow:
 * Ticket Summary/History -> /api/send-otp or /api/verify-otp -> OTP Controller -> Booking/Payment/Flight collections
 *
 * Used By:
 * server.js mounts this router at /api.
 *
 * Dependencies:
 * middleware/auth.js verifies the logged-in passenger before OTP work starts.
 * controllers/otpController.js sends email OTPs and verifies cancellation OTPs.
 *
 * Request Lifecycle:
 * The JWT middleware attaches req.userId. The OTP controller then checks booking ownership,
 * stores/verifies the OTP, and may cancel the booking after verification.
 */
import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendOtp, verifyOtp } from '../controllers/otpController.js';

const router = express.Router();

// Validate JWT -> send OTP to the booking contact email or user email.
// Send OTP to an email or booking (body: { email?, bookingId? })
router.post('/send-otp', protect, sendOtp);

// Validate JWT -> verify OTP -> for booking cancellation, release seats and update refund state.
// Verify OTP for booking cancellation or password flow (body: { otp, bookingId?, email? })
router.post('/verify-otp', protect, verifyOtp);

export default router;
