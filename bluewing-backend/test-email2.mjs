import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

console.log('EMAIL_USER:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log('Verifying SMTP (IPv4 forced, port 587)...');
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
