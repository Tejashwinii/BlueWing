import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { releaseSeats } from './seatLockingUtil.js';
import { calculateRefund, canCancelBooking } from '../config/fareTypes.js';
import bcrypt from 'bcryptjs';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const otpStore = {};

// Build a storage key for OTPs. Keys are feature-scoped (booking vs email)
const buildOtpKey = ({ bookingId, email }) => {
  if (bookingId) return `booking:${bookingId}`;
  if (email) return `email:${email.toLowerCase()}`;
  return null;
};

// 6-digit OTP generator (100000 - 999999)
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Small helper to attempt delivery and return detailed result
const attemptEmailDelivery = async ({ toEmail, otp, userName, subject, purposeText }) => {
  console.log(`OTP delivery: attempting to send to ${toEmail} for ${purposeText}`);
  const result = await sendOtpEmail(toEmail, otp, userName, subject, purposeText);
  console.log(`OTP delivery result for ${toEmail}:`, result);
  return result;
};

// Reuse the same Nodemailer configuration used elsewhere (password reset)
// Create a single transporter factory used by other functions in this file
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
      connectionTimeout: 10000,
    });
  }
  return null;
};

const sendOtpEmail = async (toEmail, otp, userName, subject, purposeText) => {
  const htmlContent = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:12px;background:#f8fbff;">
      <h2 style="color:#1a73e8;text-align:center;margin-bottom:10px;">BlueWing Airlines</h2>
      <p style="color:#333;font-size:15px;">Hello <strong>${userName}</strong>,</p>
      <p style="color:#555;font-size:14px;">Your one-time password for <strong>${purposeText}</strong> is:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;color:#1a73e8;background:#eef5ff;padding:16px 26px;border-radius:12px;">${otp}</span>
      </div>
      <p style="color:#555;font-size:14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  // Prefer Nodemailer transporter (reusing existing mailer config)
  const transporter = createTransporter();
  if (transporter) {
    try {
      // Verify transporter before sending to surface auth/connect issues early
      try {
        await transporter.verify();
      } catch (verifyErr) {
        console.error('Nodemailer transporter verification failed:', verifyErr);
        throw verifyErr;
      }
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'bluewingairliness@gmail.com',
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log('Cancellation OTP email sent via Nodemailer:', info.messageId);
      return { sent: true, method: 'nodemailer' };
    } catch (err) {
      console.error('Nodemailer send failed:', err);
    }
  }

  // Optional: As a fallback, try Resend if configured (non-blocking)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'BlueWing Airlines <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html: htmlContent,
      });
      if (error) throw new Error(error.message);
      console.log('Cancellation OTP email sent via Resend:', data.id);
      return { sent: true, method: 'resend' };
    } catch (err) {
      console.error('Resend failed for cancellation OTP:', err.message);
    }
  }

  console.log('All email methods failed for cancellation OTP. Using dev fallback.');
  return { sent: false, method: 'fallback' };
};

export const sendOtp = async (req, res) => {
  try {
    const { email, bookingId } = req.body;

    // Determine flow type: booking cancellation vs forgot-password
    const flowType = bookingId ? 'CANCEL_TICKET' : 'FORGOT_PASSWORD';

    // For logging
    console.log(`Send OTP requested. Flow: ${flowType}, bookingId: ${bookingId || 'N/A'}, email: ${email || 'N/A'}`);

    // Enforce email delivery for sensitive flows (forgot password)
    const enforceEmailDelivery = flowType === 'FORGOT_PASSWORD';

    if (bookingId) {
      const booking = await Booking.findById(bookingId).populate('userId', 'firstName email');
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.userId._id.toString() !== req.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to send OTP for this booking' });
      }
      if (booking.bookingStatus === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      const destinationEmail = email || booking.contactDetails?.email || booking.userId?.email;
      if (!destinationEmail) {
        return res.status(400).json({ success: false, message: 'No email address found for this booking' });
      }

      const otp = generateOtp();
      const key = buildOtpKey({ bookingId });
      otpStore[key] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        email: destinationEmail.toLowerCase(),
        purpose: 'booking-cancel',
      };
      console.log(`Cancellation OTP generated for booking ${bookingId}: ${otp}`);
      console.log(`Email value extracted for OTP: ${destinationEmail}`);

      const result = await attemptEmailDelivery({
        toEmail: destinationEmail,
        otp,
        userName: booking.userId?.firstName || destinationEmail.split('@')[0],
        subject: 'BlueWing Airlines - Ticket Cancellation OTP',
        purposeText: 'ticket cancellation',
      });

      console.log(`sendMail triggered for cancel ticket. Result:`, result);

      if (result.sent) {
        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
      }

      console.error(`Failed to send cancellation OTP to ${destinationEmail}. Delivery result:`, result);
      return res.status(502).json({ success: false, message: 'Failed to send OTP email. Please try again later.' });
    }

    // Forgot-password flow (email-based)
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = generateOtp();
    const key = buildOtpKey({ email: email.toLowerCase() });
    otpStore[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, purpose: 'password-reset' };
    console.log(`Password-reset OTP generated for ${email}: ${otp}`);

    const result = await attemptEmailDelivery({
      toEmail: email,
      otp,
      userName: user.firstName || email.split('@')[0],
      subject: 'BlueWing Airlines - Password Reset OTP',
      purposeText: 'password reset',
    });

    // For password reset we REQUIRE email delivery. If delivery failed, return an error so frontend shows failure.
    if (result.sent) {
      return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    }

    // Log failure details and return an error to the client (do not silently return fallback)
    console.error(`Failed to send password-reset OTP to ${email}. Delivery result:`, result);
    return res.status(502).json({ success: false, message: 'Failed to send OTP email. Please try again later.' });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, bookingId } = req.body;

    if (bookingId) {
      if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
      }

      const key = buildOtpKey({ bookingId });
      const stored = otpStore[key];
      if (!stored) {
        return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
      }
      if (Date.now() > stored.expiresAt) {
        delete otpStore[key];
        return res.status(400).json({ success: false, message: 'OTP expired.' });
      }
      if (stored.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
      }
      if (stored.purpose !== 'booking-cancel') {
        return res.status(400).json({ success: false, message: 'Invalid OTP purpose.' });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.userId._id ? booking.userId._id.toString() !== req.userId : booking.userId.toString() !== req.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      }
      if (booking.bookingStatus === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }
      if (!canCancelBooking(booking.fareType.name)) {
        return res.status(400).json({ success: false, message: `Cancellation not allowed for ${booking.fareType.name} fare type` });
      }

      await releaseSeats(booking.flightId, booking.selectedSeats);
      const refundAmount = calculateRefund(booking.pricing.totalAmount, booking.fareType.name);

      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: 'refunded',
        refundAmount,
        refundId: `REF-${Date.now()}`,
        refundStatus: 'success',
        refundDate: new Date(),
      });

      const cancelledBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          bookingStatus: 'cancelled',
          'cancellationDetails.isCancelled': true,
          'cancellationDetails.cancelledAt': new Date(),
          'cancellationDetails.refundAmount': refundAmount,
        },
        { new: true }
      ).populate('paymentId');

      delete otpStore[key];
      return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: cancelledBooking });
    }

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const key = buildOtpKey({ email: email.toLowerCase() });
    const stored = otpStore[key];
    if (!stored) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
    if (Date.now() > stored.expiresAt) {
      delete otpStore[key];
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }
    if (stored.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Incorrect OTP.' });

    otpStore[key].verified = true;
    console.log('OTP verified for ' + email);
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password required' });

    // Use the same key builder as other OTP flows to locate the stored OTP
    const key = buildOtpKey({ email: email.toLowerCase() });
    const stored = otpStore[key];
    if (!stored || !stored.verified) return res.status(400).json({ success: false, message: 'OTP not verified.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Set plain text password - the pre-save hook in User model will hash it
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // Clean up the OTP entry after successful reset
    delete otpStore[key];
    console.log('Password reset for ' + email);
    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};