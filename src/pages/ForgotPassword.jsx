import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const correctOtp = '123456';

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpVerified(false);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.trim() === correctOtp) {
      setError('');
      setOtpVerified(true);
    } else {
      setError('Incorrect OTP. Please try again.');
      setOtpVerified(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError('Please verify your OTP before resetting your password.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    alert('Password reset successfully. You can now sign in with your new password.');
  };

  return (
    <AuthPage>
      <div className="fp-page">
        <h1 className="fp-title">Forgot Password</h1>
        <p className="fp-subtitle">
          Enter your registered email address and verify the OTP to reset your password.
        </p>
        <form className="fp-form" onSubmit={handleSendOtp}>
          <label className="fp-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="fp-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button type="submit" className="fp-button fp-primary-btn">
            Send OTP
          </button>
        </form>

        {otpSent && (
          <form className="fp-form" onSubmit={handleVerifyOtp}>
            <label className="fp-label" htmlFor="otp">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              className="fp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
            />
            <button type="submit" className="fp-button fp-secondary-btn">
              Verify OTP
            </button>
          </form>
        )}

        {otpVerified && (
          <form className="fp-form" onSubmit={handleSubmit}>
            <label className="fp-label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="fp-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label className="fp-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="fp-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit" className="fp-button fp-primary-btn">
              Set new password
            </button>
          </form>
        )}

        {error && <p className="fp-error">{error}</p>}

        <div className="fp-actions">
          <Link to="/login" className="fp-link">
            Back to login
          </Link>
        </div>
      </div>
    </AuthPage>
  );
}

export default ForgotPassword;
