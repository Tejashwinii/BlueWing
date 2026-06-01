
import AuthPage from "../components/AuthPage";
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import "../styles/BlueWingLogin.css";
import javaistanAirplane from '../assets/login_page2.png';

function BluewingLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {

        const pendingBookingStr = sessionStorage.getItem('pendingBooking');
        if (pendingBookingStr) {
          try {
            const pendingBooking = JSON.parse(pendingBookingStr);
            sessionStorage.removeItem('pendingBooking');
            navigate('/passenger-details', { state: pendingBooking });
            return;
          } catch {
            sessionStorage.removeItem('pendingBooking');
          }
        }

        if (result.user?.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/flights');
        }

      } else {
        setError(result.message || 'Invalid email or password');
      }

    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage>
      <div className="login-page">
        <div className="login-container">

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

          <div className="login-right">
            <div className="login-form-wrapper">
              <div className="form-header">
                <h1 className="form-title">Welcome Back</h1>
                <p className="form-subtitle">
                  Sign in to your BlueWing account to manage your bookings
                </p>
              </div>

              <form onSubmit={handleLogin} className="login-form">

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
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

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
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

                {error && <p className="form-error">{error}</p>}

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="form-footer">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot your password?
                  </Link>
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
