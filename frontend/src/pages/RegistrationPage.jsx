import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import AuthPage from '../components/AuthPage';
import '../styles/Registration.css';

const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First Name is required')
    .matches(/^[A-Za-z\s]+$/, 'Only characters and spaces are allowed'),
  lastName: Yup.string()
    .trim()
    .required('Last Name is required')
    .matches(/^[A-Za-z\s]+$/, 'Only characters and spaces are allowed'),
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Invalid email format'),
  dateOfBirth: Yup.date()
    .required('Date of Birth is required')
    .max(new Date(), 'Date of Birth must be a past date')
    .typeError('Invalid date format'),
  phoneNumber: Yup.string()
    .trim()
    .required('Phone Number is required')
    .matches(/^[0-9]{10}$/, 'Phone Number must be exactly 10 digits'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Gender is required'),
  address: Yup.string()
    .trim()
    .max(200, 'Address cannot be more than 200 characters'),
  city: Yup.string()
    .trim()
    .max(50, 'City cannot be more than 50 characters'),
  country: Yup.string()
    .trim()
    .max(50, 'Country cannot be more than 50 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, digit, and special character'
    ),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords do not match'),
});

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiErrorsList, setApiErrorsList] = useState([]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      phoneNumber: '',
      gender: '',
      address: '',
      city: '',
      country: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registrationSchema,
    validateOnChange: true,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      setApiError('');
      setSuccessMessage('');

      try {
        const result = await register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phoneNumber,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          address: values.address,
          city: values.city,
          country: values.country,
        });

        if (result.success) {
          setSuccessMessage('Registration successful! Redirecting to login...');
          resetForm();
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setApiError(result.message || 'Registration failed. Please try again.');
          setApiErrorsList(result.errors || []);
        }
      } catch (error) {
        setApiError(error.message || 'Registration failed. Please try again.');
        setApiErrorsList(error.errors || []);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    setApiError('');
    setSuccessMessage('');
    navigate('/login');
  };

  const hasError = (field) => {
    return formik.errors[field] && (formik.touched[field] || String(formik.values[field]).length > 0);
  };

  return (
    <AuthPage>
      <div className="registration-page">
        <div className="registration-header-outside">
          <h1 className="header-title-outside">Join BlueWing Airlines</h1>
          <p className="header-intro-outside">
            Create your account and start earning miles with every flight. Experience premium travel rewards with BlueWing.
          </p>
        </div>

        <div className="registration-container">
          <div className="registration-card">
            <h2 className="registration-form-title">Create Account</h2>
            <p className="subtitle">Join us for a seamless flight booking experience</p>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {apiError && <div className="error-message api-error">{apiError}</div>}
            {apiErrorsList.length > 0 && (
              <ul className="error-list">
                {apiErrorsList.map((err, idx) => (
                  <li key={idx} className="error-message">{err}</li>
                ))}
              </ul>
            )}

            <form onSubmit={formik.handleSubmit} className="registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                    placeholder="Enter your first name"
                    className={hasError('firstName') ? 'input-error' : ''}
                  />
                  {hasError('firstName') && (
                    <span className="error-message">{formik.errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                    placeholder="Enter your last name"
                    className={hasError('lastName') ? 'input-error' : ''}
                  />
                  {hasError('lastName') && (
                    <span className="error-message">{formik.errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email ID *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  placeholder="Enter your email address"
                  className={hasError('email') ? 'input-error' : ''}
                />
                {hasError('email') && (
                  <span className="error-message">{formik.errors.email}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dateOfBirth}
                    className={hasError('dateOfBirth') ? 'input-error' : ''}
                  />
                  {hasError('dateOfBirth') && (
                    <span className="error-message">{formik.errors.dateOfBirth}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phoneNumber}
                    placeholder="10-digit phone number"
                    className={hasError('phoneNumber') ? 'input-error' : ''}
                  />
                  {hasError('phoneNumber') && (
                    <span className="error-message">{formik.errors.phoneNumber}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.gender}
                  className={hasError('gender') ? 'input-error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {hasError('gender') && (
                  <span className="error-message">{formik.errors.gender}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address (Optional)</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  placeholder="Enter your address"
                  className={hasError('address') ? 'input-error' : ''}
                />
                {hasError('address') && (
                  <span className="error-message">{formik.errors.address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City (Optional)</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.city}
                    placeholder="Enter city"
                    className={hasError('city') ? 'input-error' : ''}
                  />
                  {hasError('city') && (
                    <span className="error-message">{formik.errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country (Optional)</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.country}
                    placeholder="Enter country"
                    className={hasError('country') ? 'input-error' : ''}
                  />
                  {hasError('country') && (
                    <span className="error-message">{formik.errors.country}</span>
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
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  placeholder="Enter a strong password"
                  className={hasError('password') ? 'input-error' : ''}
                />
                {hasError('password') && (
                  <span className="error-message">{formik.errors.password}</span>
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
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  placeholder="Confirm your password"
                  className={hasError('confirmPassword') ? 'input-error' : ''}
                />
                {hasError('confirmPassword') && (
                  <span className="error-message">{formik.errors.confirmPassword}</span>
                )}
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={isLoading}>
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
