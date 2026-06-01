import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthContext } from '../context/AuthContext';
import AuthPage from '../components/AuthPage';
import '../styles/Registration.css';

const registrationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, { message: 'First Name is required' })
      .regex(/^[A-Za-z]+$/, { message: 'Only characters are allowed' }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: 'Last Name is required' })
      .regex(/^[A-Za-z]+$/, { message: 'Only characters are allowed' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email format' }),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, { message: 'Date of Birth is required' })
      .refine((value) => {
        const date = new Date(value);
        return value && !Number.isNaN(date.getTime()) && date < new Date();
      }, { message: 'Date of Birth must be a past date' }),
    phoneNumber: z
      .string()
      .trim()
      .min(1, { message: 'Phone Number is required' })
      .regex(/^[0-9]{10}$/, { message: 'Phone Number must be exactly 10 digits' }),
    gender: z.enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Gender is required' }),
    }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
        message: 'Password must contain uppercase, lowercase, and number',
      }),
    confirmPassword: z.string().min(1, { message: 'Confirm Password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      phoneNumber: '',
      gender: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const result = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      });

      if (result.success) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        reset();
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setApiError('');
    setSuccessMessage('');
    navigate('/login');
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

            <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    {...formRegister('firstName')}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'input-error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    {...formRegister('lastName')}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'input-error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email ID *</label>
                <input
                  type="email"
                  id="email"
                  {...formRegister('email')}
                  placeholder="Enter your email address"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email.message}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    {...formRegister('dateOfBirth')}
                    className={errors.dateOfBirth ? 'input-error' : ''}
                  />
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    {...formRegister('phoneNumber')}
                    placeholder="10-digit phone number"
                    className={errors.phoneNumber ? 'input-error' : ''}
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  {...formRegister('gender')}
                  className={errors.gender ? 'input-error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="password-icon">🔐</span> Password *
                </label>
                <input
                  type="password"
                  id="password"
                  {...formRegister('password')}
                  placeholder="Enter a strong password"
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password.message}</span>}
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
                  {...formRegister('confirmPassword')}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
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