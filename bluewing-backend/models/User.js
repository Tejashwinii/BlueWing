
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Schema for BlueWing Airlines
 * Stores customer and admin user information
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: [true, 'Email already registered'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email'],
      index: true, // Index for faster queries
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password by default in queries
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      match: [/^[0-9]{10}$/, 'Please provide valid 10-digit phone number'],
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin'],
        message: 'Role must be either customer or admin',
      },
      default: 'customer',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended'],
        message: 'Status must be either active or suspended',
      },
      default: 'active',
    },
    gender: {
      type: String,
      required: [true, 'Please provide gender'],
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female, or other',
      },
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot be more than 200 characters'],
      default: '',
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot be more than 50 characters'],
      default: '',
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot be more than 50 characters'],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds updatedAt automatically
  }
);

/**
 * Pre-save middleware to hash password
 * Only hashes if password is modified
 * Note: For Mongoose 6+, async functions don't need `next` callback
 */
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt with 10 rounds
  const salt = await bcryptjs.genSalt(10);

  // Hash the password
  this.password = await bcryptjs.hash(this.password, salt);
});

/**
 * Instance method to compare passwords
 * @param {String} enteredPassword - Password to compare
 * @returns {Boolean} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcryptjs.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method to get public user data (without password)
 * @returns {Object} User object without password
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

/**
 * Create indexes
 */
userSchema.index({ email: 1 }); // Single field index
userSchema.index({ createdAt: -1 }); // For sorting by date

// Export the User model
export default mongoose.model('User', userSchema);
