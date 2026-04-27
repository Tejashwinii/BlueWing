import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import '../styles/Registration.css';
 
const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
  });
 
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
 
  // Password validation rules
  const validatePassword = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    return rules;
  };
 
  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
 
  // Phone number validation (10 digits)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };
 
  // Date of Birth validation (must be past date)
  const validateDateOfBirth = (dob) => {
    const selectedDate = new Date(dob);
    const today = new Date();
    return selectedDate < today;
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
 
    // Validate First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }
 
    // Validate Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
 
    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
 
    // Validate Phone Number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number must be 10 digits';
    }
 
    // Validate Date of Birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    } else if (!validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of Birth must be a past date';
    }
 
    // Validate Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRules = validatePassword(formData.password);
      if (!passwordRules.length) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!passwordRules.uppercase) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!passwordRules.lowercase) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!passwordRules.digit) {
        newErrors.password = 'Password must contain at least one digit';
      } else if (!passwordRules.special) {
        newErrors.password = 'Password must contain at least one special character';
      }
    }
 
    // Validate Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
 
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }
 
    // Simulate user registration (store in localStorage)
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = existingUsers.some((user) => user.email === formData.email);
 
    if (userExists) {
      setErrors({ email: 'Email already registered' });
      return;
    }
 
    existingUsers.push({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      phoneNumber: formData.phoneNumber,
    });
 
    localStorage.setItem('users', JSON.stringify(existingUsers));
    setSuccessMessage('Registration successful! Redirecting to login...');
    setErrors({});
 
    // Clear form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      phoneNumber: '',
    });
 
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };
 
  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      phoneNumber: '',
    });
    setErrors({});
    setSuccessMessage('');
    navigate('/login');
  };
 
  return (
    <AuthPage>
      <div className="registration-page">
        {/* HEADER OUTSIDE FORM */}
        <div className="registration-header-outside">
          <h1 className="header-title-outside">Join BlueWing Airlines</h1>
          <p className="header-intro-outside">Create your account and start earning miles with every flight. Experience premium travel rewards with BlueWing.</p>
        </div>

        <div className="registration-container">
          <div className="registration-card">
            <h2 className="registration-form-title">Create Account</h2>
            <p className="subtitle">Join us for a seamless flight booking experience</p>          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
 
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'input-error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>
 
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'input-error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>
 
            <div className="form-group">
              <label htmlFor="email">Email ID *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
 
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={errors.dateOfBirth ? 'input-error' : ''}
                />
                {errors.dateOfBirth && (
                  <span className="error-message">{errors.dateOfBirth}</span>
                )}
              </div>
 
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={errors.phoneNumber ? 'input-error' : ''}
                />
                {errors.phoneNumber && (
                  <span className="error-message">{errors.phoneNumber}</span>
                )}
              </div>
            </div>
 
            <div className="form-group">
              <label htmlFor="password">
                <span className="password-icon">🔐</span> Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              <p className="password-hint">
                Password must contain at least 8 characters, including uppercase, lowercase, digit, and special character
              </p>
            </div>
 
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <span className="password-icon">🔑</span> Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
 
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                Sign Up
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
 
          <p className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>

     
    </div>
    </AuthPage>
  );
};
export default RegistrationPage;