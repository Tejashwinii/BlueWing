import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Activity Log Schema (embedded in Admin)
 * Tracks all admin actions for audit purposes
 */
const activityLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_flight',
      'update_flight',
      'delete_flight',
      'cancel_booking',
      'suspend_user',
      'reactivate_user',
      'view_report',
      'update_settings',
      'failed_login',
      'password_change',
      'other'
    ]
  },
  details: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['Flight', 'Booking', 'User', 'Payment', 'Report', 'Settings', 'Auth', null],
    default: null
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

/**
 * Admin Schema
 * Separate model from User for admin-specific functionality
 */
const adminSchema = new Schema({
  // Reference to User model (the user account associated with this admin)
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },

  // Admin personal info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number']
  },

  // Admin role determines base permissions
  adminRole: {
    type: String,
    required: [true, 'Admin role is required'],
    enum: {
      values: ['flight_manager', 'payment_manager', 'support_admin', 'super_admin'],
      message: '{VALUE} is not a valid admin role'
    }
  },

  // Specific permissions array (can override role-based permissions)
  permissions: {
    type: [String],
    enum: ['manage_flights', 'manage_bookings', 'manage_users', 'view_reports'],
    default: []
  },

  // Account status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },

  // Department for organizational purposes
  department: {
    type: String,
    trim: true,
    default: ''
  },

  // Reference to the user who created this admin account
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Last login tracking
  lastLogin: {
    type: Date,
    default: null
  },

  // Account locking for security
  loginAttempts: {
    type: Number,
    default: 0
  },

  isLocked: {
    type: Boolean,
    default: false
  },

  lockedUntil: {
    type: Date,
    default: null
  },

  // Activity log for audit trail
  activityLog: {
    type: [activityLogSchema],
    default: []
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =====================
// INDEXES
// =====================

// Index on email for fast lookups
adminSchema.index({ email: 1 }, { unique: true });

// Index on adminRole for filtering
adminSchema.index({ adminRole: 1 });

// Index on userId for user-admin relationship queries
adminSchema.index({ userId: 1 });

// Compound index for status and role filtering
adminSchema.index({ status: 1, adminRole: 1 });

// Index on createdAt for sorting
adminSchema.index({ createdAt: -1 });

// =====================
// VIRTUAL PROPERTIES
// =====================

/**
 * Get full name of admin
 */
adminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Check if account is currently locked
 */
adminSchema.virtual('isCurrentlyLocked').get(function () {
  if (!this.isLocked) return false;
  if (!this.lockedUntil) return true;
  return new Date() < this.lockedUntil;
});

// =====================
// INSTANCE METHODS
// =====================

/**
 * Check if admin has a specific permission
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if admin has permission
 */
adminSchema.methods.hasPermission = function (permission) {
  // Super admin has all permissions
  if (this.adminRole === 'super_admin') {
    return true;
  }

  // Check explicit permissions array
  if (this.permissions.includes(permission)) {
    return true;
  }

  // Check role-based default permissions
  const rolePermissions = {
    flight_manager: ['manage_flights', 'view_reports'],
    payment_manager: ['manage_bookings', 'view_reports'],
    support_admin: ['manage_users', 'view_reports']
  };

  const defaultPermissions = rolePermissions[this.adminRole] || [];
  return defaultPermissions.includes(permission);
};

/**
 * Lock admin account after failed login attempts
 * @param {number} lockDurationMinutes - Duration to lock account (default: 30 minutes)
 */
adminSchema.methods.lockAccount = function (lockDurationMinutes = 30) {
  this.isLocked = true;
  this.lockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
  console.log(`🔒 Admin account locked: ${this.email} until ${this.lockedUntil}`);
  return this.save();
};

/**
 * Unlock admin account
 */
adminSchema.methods.unlockAccount = function () {
  this.isLocked = false;
  this.lockedUntil = null;
  this.loginAttempts = 0;
  console.log(`🔓 Admin account unlocked: ${this.email}`);
  return this.save();
};

/**
 * Increment failed login attempts
 * Locks account after 5 failed attempts
 */
adminSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    await this.unlockAccount();
    this.loginAttempts = 1;
  } else {
    this.loginAttempts += 1;
  }

  // Lock after 5 failed attempts
  if (this.loginAttempts >= 5 && !this.isLocked) {
    await this.lockAccount();
  } else {
    await this.save();
  }

  return this.loginAttempts;
};

/**
 * Record admin activity in activity log
 * @param {string} action - The action performed
 * @param {object} details - Additional details about the action
 */
adminSchema.methods.recordActivity = function (action, details = {}) {
  const activity = {
    action: action,
    details: details.description || '',
    resourceType: details.resourceType || null,
    resourceId: details.resourceId || null,
    ipAddress: details.ipAddress || '',
    userAgent: details.userAgent || '',
    status: details.status || 'success',
    timestamp: new Date()
  };

  // Keep only last 100 activities to prevent document bloat
  if (this.activityLog.length >= 100) {
    this.activityLog.shift(); // Remove oldest activity
  }

  this.activityLog.push(activity);
  console.log(`📝 Admin activity logged: ${this.email} - ${action}`);
  return this.save();
};

/**
 * Update last login timestamp
 */
adminSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginAttempts = 0; // Reset on successful login
  return this.save();
};

/**
 * Get recent activities
 * @param {number} limit - Number of activities to return (default: 10)
 * @returns {Array} - Recent activities
 */
adminSchema.methods.getRecentActivities = function (limit = 10) {
  return this.activityLog
    .slice(-limit)
    .reverse();
};

// =====================
// STATIC METHODS
// =====================

/**
 * Find admin by email
 * @param {string} email - Admin email
 * @returns {Promise<Admin>} - Admin document
 */
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find all active admins
 * @returns {Promise<Array>} - Array of active admin documents
 */
adminSchema.statics.findActiveAdmins = function () {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

/**
 * Find admins by role
 * @param {string} role - Admin role
 * @returns {Promise<Array>} - Array of admin documents
 */
adminSchema.statics.findByRole = function (role) {
  return this.find({ adminRole: role, status: 'active' });
};

/**
 * Get admin statistics
 * @returns {Promise<Object>} - Statistics object
 */
adminSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const roleStats = await this.aggregate([
    {
      $group: {
        _id: '$adminRole',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    byStatus: stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    byRole: roleStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    total: await this.countDocuments()
  };
};

// =====================
// PRE-SAVE HOOKS
// =====================

/**
 * Set default permissions based on role before saving
 */
adminSchema.pre('save', function (next) {
  // Only set default permissions if permissions array is empty
  if (this.isNew && this.permissions.length === 0) {
    const rolePermissions = {
      flight_manager: ['manage_flights'],
      payment_manager: ['manage_bookings'],
      support_admin: ['manage_users'],
      super_admin: ['manage_flights', 'manage_bookings', 'manage_users', 'view_reports']
    };

    this.permissions = rolePermissions[this.adminRole] || [];
  }

  next();
});

// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
