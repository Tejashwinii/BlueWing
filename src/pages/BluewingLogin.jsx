import AuthPage from "../components/AuthPage";
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import "../styles/BlueWingLogin.css";
import javaistanAirplane from '../assets/javaistan-airplane-6867678_1920.jpg';

function BluewingLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (value) => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value.trim()) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const isFormValid = () => {
    return email.trim() && password.trim() && !emailError && !passwordError;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      validateEmail(e.target.value);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) {
      validatePassword(e.target.value);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Admin credentials check
    if (email === 'admin@gmail.com' && password === 'admin@BlueWing') {
      login({ email, firstName: 'Admin', role: 'admin' });
      navigate('/admin-dashboard');
      return;
    }

    // Check registered users in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      login({ email, firstName: user.firstName, role: 'user' });
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <AuthPage>
      <div className="login-page">
        <div className="login-container">
          {/* LEFT SECTION - Travel Image */}
          <div className="login-left">
            <div className="login-image-bg" style={{ backgroundImage: `url(${javaistanAirplane})` }}>
              <div className="image-overlay"></div>
              <div className="image-content">
                <h2 className="cta-heading">Not a BlueWing member yet?</h2>
                <Link to="/registration" className="cta-button">
                  Join Now
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Login Form */}
          <div className="login-right">
            <div className="login-form-wrapper">
              <div className="form-header">
                <h1 className="form-title">Welcome Back</h1>
                <p className="form-subtitle">
                  Sign in to your BlueWing account to manage your bookings and rewards
                </p>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`form-input ${emailError ? 'error' : ''}`}
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail(email)}
                    />
                  </div>
                  {emailError && <p className="error-message">{emailError}</p>}
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`form-input ${passwordError ? 'error' : ''}`}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => validatePassword(password)}
                    />
                  </div>
                  {passwordError && <p className="error-message">{passwordError}</p>}
                </div>

                {/* Remember Me */}
                <div className="form-checkbox">
                  <input type="checkbox" id="remember" defaultChecked />
                  <label htmlFor="remember">Keep me logged in on this device</label>
                </div>

                {/* Error Message */}
                {error && <p className="form-error">{error}</p>}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!isFormValid()}
                >
                  Sign In
                </button>

                {/* Forgot Password Link */}
                <div className="form-footer">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot your password?
                  </Link>
                </div>

                {/* Demo Credentials Info */}
                <div className="demo-credentials">
                  <p className="demo-label">Demo Credentials:</p>
                  <p className="demo-text">
                    Admin: <strong>admin@gmail.com</strong> / <strong>admin@BlueWing</strong>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthPage>
  );
}

export default BluewingLogin;