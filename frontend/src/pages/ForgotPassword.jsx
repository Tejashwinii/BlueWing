import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

const API_URL = 'http://localhost:5000/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const currentStep = otpVerified ? 3 : otpSent ? 2 : 1;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSuccess('');
    setDevOtp('');
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSuccess(data.message);
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Server error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setSuccess('OTP verified! Now set your new password.');
        setDevOtp('');
      } else {
        setError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.message || 'Reset failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setDevOtp('');
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('New OTP sent!');
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setError(data.message || 'Failed to resend.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-left">
        <div className="fp-left-overlay"></div>
        <div className="fp-left-content">
          <div className="fp-plane-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.3 3.2-3.8 3.8-2.1-.4c-.4-.1-.8.1-1 .4l-.6 1c-.2.4-.1.9.3 1.1l2.5 1.5 1.5 2.5c.2.4.7.5 1.1.3l1-.6c.3-.2.5-.6.4-1l-.4-2.1 3.8-3.8 3.2 5.3c.2.4.7.5 1.1.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
            </svg>
          </div>
          <h2 className="fp-left-title">Reset Your Password</h2>
          <p className="fp-left-text">Do not worry! It happens to the best of us. We will help you get back to booking flights in no time.</p>
          <div className="fp-left-features">
            <div className="fp-feature">
              <span className="fp-feature-icon">🔒</span>
              <span>Secure OTP verification</span>
            </div>
            <div className="fp-feature">
              <span className="fp-feature-icon">⚡</span>
              <span>Quick 3-step process</span>
            </div>
            <div className="fp-feature">
              <span className="fp-feature-icon">✈️</span>
              <span>Back to flying in minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fp-right">
        <div className="fp-card">
          <div className="fp-logo">
            <span className="fp-logo-icon">✈</span>
            <span className="fp-logo-text">BlueWing</span>
          </div>

          <div className="fp-steps">
            <div className={'fp-step ' + (currentStep >= 1 ? 'active' : '') + ' ' + (currentStep > 1 ? 'done' : '')}>
              <div className="fp-step-circle">{currentStep > 1 ? '✓' : '1'}</div>
              <span className="fp-step-label">Email</span>
            </div>
            <div className={'fp-step-line ' + (currentStep >= 2 ? 'active' : '')}></div>
            <div className={'fp-step ' + (currentStep >= 2 ? 'active' : '') + ' ' + (currentStep > 2 ? 'done' : '')}>
              <div className="fp-step-circle">{currentStep > 2 ? '✓' : '2'}</div>
              <span className="fp-step-label">Verify</span>
            </div>
            <div className={'fp-step-line ' + (currentStep >= 3 ? 'active' : '')}></div>
            <div className={'fp-step ' + (currentStep >= 3 ? 'active' : '')}>
              <div className="fp-step-circle">3</div>
              <span className="fp-step-label">Reset</span>
            </div>
          </div>

          <h1 className="fp-title">
            {currentStep === 1 && 'Forgot Password?'}
            {currentStep === 2 && 'Verify OTP'}
            {currentStep === 3 && 'Set New Password'}
          </h1>
          <p className="fp-subtitle">
            {currentStep === 1 && 'Enter your registered email address and we will send you a verification code.'}
            {currentStep === 2 && 'We have sent a 6-digit code to ' + email + '. Enter it below.'}
            {currentStep === 3 && 'Create a strong password to secure your account.'}
          </p>

          {error && (
            <div className="fp-alert fp-alert-error">
              <span className="fp-alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="fp-alert fp-alert-success">
              <span className="fp-alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}
          {devOtp && (
            <div className="fp-otp-display">
              <div className="fp-otp-label">Your Verification Code</div>
              <div className="fp-otp-code">
                {devOtp.split('').map((d, i) => (
                  <span key={i} className="fp-otp-digit">{d}</span>
                ))}
              </div>
              <p className="fp-otp-note">Email delivery unavailable on this network</p>
            </div>
          )}

          {!otpSent && (
            <form className="fp-form" onSubmit={handleSendOtp}>
              <div className="fp-field">
                <label className="fp-label" htmlFor="email">Email Address</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">📧</span>
                  <input
                    id="email"
                    type="email"
                    className="fp-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="fp-button fp-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="fp-spinner"></span> Sending...
                  </>
                ) : (
                  <>
                    Send Verification Code <span className="fp-btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {otpSent && !otpVerified && (
            <form className="fp-form" onSubmit={handleVerifyOtp}>
              <div className="fp-field">
                <label className="fp-label" htmlFor="otp">Verification Code</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">🔑</span>
                  <input
                    id="otp"
                    type="text"
                    className="fp-input"
                    value={otp}
                    maxLength="6"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="fp-button fp-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="fp-spinner"></span> Verifying...
                  </>
                ) : (
                  <>
                    Verify Code <span className="fp-btn-arrow">→</span>
                  </>
                )}
              </button>
              <button type="button" className="fp-resend-btn" onClick={handleResendOtp} disabled={loading}>
                Did not receive the code? <strong>Resend</strong>
              </button>
            </form>
          )}

          {otpVerified && (
            <form className="fp-form" onSubmit={handleSubmit}>
              <div className="fp-field">
                <label className="fp-label" htmlFor="newPassword">New Password</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">🔒</span>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="fp-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="fp-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="fp-field">
                <label className="fp-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">��</span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="fp-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                  />
                </div>
                {confirmPassword && newPassword && (
                  <div className={'fp-match-indicator ' + (newPassword === confirmPassword ? 'match' : 'no-match')}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>
              <button type="submit" className="fp-button fp-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="fp-spinner"></span> Resetting...
                  </>
                ) : (
                  <>
                    Reset Password <span className="fp-btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="fp-footer">
            <Link to="/login" className="fp-back-link">
              <span>←</span> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
