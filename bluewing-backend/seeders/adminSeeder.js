/**
 * Admin Seeder
 *
 * Purpose:
 * Creates or updates the default admin login account used for local/admin testing.
 *
 * Workflow:
 * Developer CLI -> adminSeeder -> User model -> users collection
 *
 * Used By:
 * Developers running the script manually during setup.
 *
 * Dependencies:
 * dotenv loads MongoDB settings, mongoose opens the database connection, User stores the admin account.
 *
 * Request Lifecycle:
 * Not part of HTTP request handling. Executes as a one-off script, writes users, then closes MongoDB.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Create or update the default admin user.
 *
 * Workflow:
 * Seeder command -> MongoDB connection -> users collection upsert-style create/update -> close connection
 *
 * Inputs:
 * - MONGODB_URI from environment.
 *
 * Returns:
 * Exits process with 0 on success or 1 on failure.
 *
 * Collections:
 * - users: reads admin@gmail.com, then creates or updates that User document.
 *
 * Why:
 * Ensures local environments have an admin account for protected flight-management routes.
 */
const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI not defined in .env file');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Read users to see whether the default admin account already exists.
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (existingAdmin) {
      // Update existing user to ensure admin role and correct password
      existingAdmin.role = 'admin';
      existingAdmin.password = 'admin@BlueWing';
      existingAdmin.isEmailVerified = true;
      existingAdmin.status = 'active';
      await existingAdmin.save(); // pre-save hook will hash the password
      console.log('✅ Existing admin user updated successfully');
    } else {
      // Create the admin User document in users when no default admin exists.
      await User.create({
        firstName: 'Admin',
        lastName: 'BlueWing',
        email: 'admin@gmail.com',
        password: 'admin@BlueWing', // will be hashed by pre-save hook
        phone: '9999999999',
        dateOfBirth: new Date('2000-01-01'),
        gender: 'male',
        role: 'admin',
        isEmailVerified: true,
        status: 'active',
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin@BlueWing');
    console.log('   Role: admin');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
