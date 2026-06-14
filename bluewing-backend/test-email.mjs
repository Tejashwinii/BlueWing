/**
 * Email Diagnostic Script - Gmail Service Mode
 *
 * Purpose:
 * Verifies basic Nodemailer Gmail credentials and sends a test OTP email.
 *
 * Workflow:
 * Developer CLI -> dotenv -> Nodemailer verify/send -> SMTP provider
 *
 * Used By:
 * Developers troubleshooting OTP email configuration.
 *
 * Dependencies:
 * dotenv and nodemailer.
 *
 * Request Lifecycle:
 * Not part of HTTP request handling. Runs manually and exits after SMTP verification/send attempt.
 */
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.substring(0,4) + '****' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log('\n--- Verifying SMTP connection ---');
try {
  await transporter.verify();
  console.log('SMTP connection verified!');
} catch (err) {
  console.error('SMTP FAILED:', err.message);
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('OTP:', otp);
console.log('Sending test email...');

try {
  const info = await transporter.sendMail({
    from: '"BlueWing Airlines" <' + process.env.EMAIL_USER + '>',
    to: process.env.EMAIL_USER,
    subject: 'Test OTP - BlueWing',
    html: '<h2>Your OTP: ' + otp + '</h2>',
  });
  console.log('Email sent! ID:', info.messageId);
} catch (err) {
  console.error('Send FAILED:', err.message);
}
process.exit(0);
