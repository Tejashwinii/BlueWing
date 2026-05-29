import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const otpStore = {};

const sendOtpEmail = async (toEmail, otp, userName) => {
  const htmlContent = '<div style="font-family:Arial;max-width:480px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;"><h2 style="color:#1a73e8;text-align:center;">BlueWing Airlines</h2><p>Hello <strong>' + userName + '</strong>,</p><p>Your OTP for password reset is:</p><div style="text-align:center;margin:20px 0;"><span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a73e8;background:#f0f4ff;padding:12px 24px;border-radius:8px;">' + otp + '</span></div><p style="color:#666;">Valid for <strong>10 minutes</strong>.</p></div>';

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'BlueWing Airlines <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Password Reset OTP - BlueWing Airlines',
        html: htmlContent,
      });
      if (error) throw new Error(error.message);
      console.log('Email sent via Resend:', data.id);
      return { sent: true, method: 'resend' };
    } catch (err) {
      console.error('Resend failed:', err.message);
    }
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
        connectionTimeout: 10000,
      });
      const info = await transporter.sendMail({
        from: '"BlueWing Airlines" <' + process.env.EMAIL_USER + '>',
        to: toEmail,
        subject: 'Password Reset OTP - BlueWing Airlines',
        html: htmlContent,
      });
      console.log('Email sent via Gmail:', info.messageId);
      return { sent: true, method: 'gmail' };
    } catch (err) {
      console.error('Gmail SMTP failed:', err.message);
    }
  }

  console.log('All email methods failed. Using dev fallback.');
  return { sent: false, method: 'fallback' };
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log('OTP for ' + email + ': ' + otp);

    const result = await sendOtpEmail(email, otp, user.firstName);

    if (result.sent) {
      return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } else {
      return res.status(200).json({ success: true, message: 'OTP generated (email unavailable on this network).', devOtp: otp });
    }
  } catch (error) {
    console.error('Send OTP error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const stored = otpStore[email.toLowerCase()];
    if (!stored) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
    if (Date.now() > stored.expiresAt) { delete otpStore[email.toLowerCase()]; return res.status(400).json({ success: false, message: 'OTP expired.' }); }
    if (stored.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Incorrect OTP.' });

    otpStore[email.toLowerCase()].verified = true;
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

    const stored = otpStore[email.toLowerCase()];
    if (!stored || !stored.verified) return res.status(400).json({ success: false, message: 'OTP not verified.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Set plain text password - the pre-save hook in User model will hash it
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    delete otpStore[email.toLowerCase()];
    console.log('Password reset for ' + email);
    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};