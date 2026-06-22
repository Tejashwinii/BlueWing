/**
 * Auth Controller
 *
 * Purpose:
 * Handles registration, login, profile retrieval, and profile updates for BlueWing users.
 *
 * Workflow:
 * Auth Routes -> Auth Controller -> User model -> users collection -> JWT response/profile response
 *
 * Used By:
 * routes/authRoutes.js.
 *
 * Dependencies:
 * models/User.js persists user accounts and hashes/compares passwords.
 * middleware/auth.js provides generateToken for JWT creation.
 *
 * Request Lifecycle:
 * Triggered after auth-route validation or JWT protection. It reads/writes users and returns
 * frontend-friendly JSON without exposing password hashes.
 */
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Register a new user and issue a JWT.
 *
 * Workflow:
 * Registration Form -> validateRequest(registerSchema) -> Auth Controller -> users collection -> JWT
 *
 * Inputs:
 * - firstName, lastName, email, password, phone, gender, dateOfBirth, address, city, country.
 *
 * Returns:
 * Created user summary and JWT token.
 *
 * Collections:
 * - users: checks for duplicate email and creates a new User document.
 *
 * Why:
 * Creates the passenger account needed to own bookings, payments, reviews, and profile data.
 */
export const register = async (req, res) => {
  try {
    // Extract user data from request body
    const { firstName, lastName, email, password, phone, gender, dateOfBirth, address, city, country } = req.body;

    // Check if user already exists by email
    // Read users to prevent duplicate passenger/admin login accounts for the same email.
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    // Create a User document in users. The User model pre-save hook hashes the password.
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      gender,
      dateOfBirth,
      address,
      city,
      country,
    });

    // Return success response (password excluded by toJSON method)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        }
      }
    });

    console.log(`✅ New user registered: ${user.email}`);

  } catch (error) {
    console.error('❌ Registration error:', error);
    // Handle Mongoose validation errors specifically to return useful messages to the client
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    // Duplicate key (e.g., email) - more friendly response
    if (error.code === 11000) {
      const dupKey = Object.keys(error.keyValue || {}).join(', ') || 'field';
      return res.status(400).json({ success: false, message: `${dupKey} already exists` });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Authenticate a user and issue a JWT.
 *
 * Workflow:
 * Login Form -> validateRequest(loginSchema) -> Auth Controller -> users collection -> password compare -> JWT
 *
 * Inputs:
 * - email and password.
 *
 * Returns:
 * User summary and JWT token when credentials are valid.
 *
 * Collections:
 * - users: reads account including password hash for credential verification.
 *
 * Why:
 * Establishes authenticated identity for protected booking, profile, admin, and review workflows.
 */
export const login = async (req, res) => {
  try {
    // Extract credentials from request body
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    // Read the User document with password selected because login must compare the stored hash.
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Compare passwords using instance method
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return success response (exclude password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        token
      }
    });

    console.log(`✅ User logged in: ${user.email}`);

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Return the authenticated user's profile.
 *
 * Workflow:
 * Profile Page -> protect middleware -> Auth Controller -> users collection
 *
 * Inputs:
 * - req.userId from JWT.
 *
 * Returns:
 * User profile fields without password.
 *
 * Collections:
 * - users: reads the current account document.
 *
 * Why:
 * Lets the frontend display account details used across booking and contact workflows.
 */
export const getProfile = async (req, res) => {
  try {
    // Get userId from JWT middleware (req.userId)
    const userId = req.userId;

    // Find user by ID (password excluded by default due to select: false)
    // Read users by JWT subject; password remains excluded by schema default.
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user profile
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || null,
          address: user.address || '',
          city: user.city || '',
          country: user.country || '',
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update allowed profile fields for the authenticated user.
 *
 * Workflow:
 * Profile Edit Form -> protect middleware -> Auth Controller -> users collection
 *
 * Inputs:
 * - req.userId from JWT.
 * - Optional firstName, lastName, phone, gender, dateOfBirth, address, city, country.
 *
 * Returns:
 * Updated user profile fields.
 *
 * Collections:
 * - users: updates the current account document.
 *
 * Why:
 * Keeps passenger contact/profile information current without allowing email/password changes here.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, gender, dateOfBirth, address, city, country } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;

    // Find and update user (excluding password and email changes)
    // Update users with only allowed profile fields; email/password are intentionally excluded here.
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || null,
          address: user.address || '',
          city: user.city || '',
          country: user.country || '',
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

    console.log(`✅ Profile updated: ${user.email}`);

  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export all controller functions
export default {
  register,
  login,
  getProfile,
  updateProfile
};
