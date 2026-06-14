/**
 * Email Diagnostic Script - SMTP 465 SSL Mode
 *
 * Purpose:
 * Verifies Gmail SMTP on port 465 with SSL and IPv4 preference, then sends a test OTP email.
 *
 * Workflow:
 * Developer CLI -> dotenv/dns -> Nodemailer verify/send -> SMTP provider
 *
 * Used By:
 * Developers troubleshooting the same SSL SMTP path used by otpController.js.
 *
 * Dependencies:
 * dotenv, nodemailer, and dns.
 *
 * Request Lifecycle:
 * Not part of HTTP request handling. Runs manually and exits after SMTP verification/send attempt.
 */
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

console.log('EMAIL_USER:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log('Verifying SMTP (IPv4, port 465, SSL)...');
try {
  await transporter.verify();
  console.log('SMTP OK!');
} catch (err) {
  console.error('SMTP FAILED:', err.message);
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log('OTP:', otp, '- Sending...');
try {
  const info = await transporter.sendMail({
    from: '"BlueWing Airlines" <' + process.env.EMAIL_USER + '>',
    to: process.env.EMAIL_USER,
    subject: 'Test OTP',
    html: '<h2>OTP: ' + otp + '</h2>',
  });
  console.log('SENT! ID:', info.messageId);
} catch (err) {
  console.error('Send FAILED:', err.message);
}
process.exit(0);
