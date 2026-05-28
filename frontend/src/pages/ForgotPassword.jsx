import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import '../styles/ForgotPassword.css';

const API_URL = 'http://localhost:5000/api/auth';

function ForgotPassword() {
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
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setSuccess(''); setDevOtp(''); setLoading(true);
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
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch(API_URL + '/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setSuccess('OTP verified! Set your new password.');
        setDevOtp('');
      } else {
        setError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError('Please fill both password fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch(API_URL + '/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Reset failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthPage>
      <div className="fp-page">
        <h1 className="fp-title">Forgot Password</h1>
        <p className="fp-subtitle">Enter your registered email to receive an OTP.</p>

        {error && <p className="fp-error">{error}</p>}
        {success && <p className="fp-success">{success}</p>}
        {devOtp && (
          <div className="fp-dev-otp">
            <strong>Your OTP:</strong> <span>{devOtp}</span>
            <p style={{fontSize:'12px',marginTop:'4px',color:'#666'}}>Email delivery unavailable on this network</p>
          </div>
        )}

        {!otpSent && (
          <form className="fp-form" onSubmit={handleSendOtp}>
            <label className="fp-label" htmlFor="email">Email address</label>
            <input id="email" type="email" className="fp-input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <button type="submit" className="fp-button fp-primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {otpSent && !otpVerified && (
          <form className="fp-form" onSubmit={handleVerifyOtp}>
            <label className="fp-label" htmlFor="otp">Enter OTP</label>
            <input id="otp" type="text" className="fp-input" value={otp}
              onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
            <button type="submit" className="fp-button fp-secondary-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {otpVerified && (
          <form className="fp-form" onSubmit={handleSubmit}>
            <label className="fp-label" htmlFor="newPassword">New password</label>
            <input id="newPassword" type="password" className="fp-input" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} />
            <label className="fp-label" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" className="fp-input" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="submit" className="fp-button fp-primary-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Set new password'}
            </button>
          </form>
        )}

        <div className="fp-actions">
          <Link to="/login" className="fp-link">Back to login</Link>
        </div>
      </div>
    </AuthPage>
  );
}

export default ForgotPassword;
