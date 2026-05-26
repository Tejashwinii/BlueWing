import mongoose from 'mongoose';

/**
 * MongoDB Connection Configuration
 * 
 * To get your MongoDB URI:
 * 1. Go to https://www.mongodb.com/cloud/atlas
 * 2. Create a free account or sign in
 * 3. Create a new cluster
 * 4. Click "Connect" and select "Connect your application"
 * 5. Copy the connection string
 * 6. Replace <username> and <password> with your credentials
 * 7. Add the URI to your .env file as MONGODB_URI
 * 
 * Database Name: bluewing (will be created automatically)
 */

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection object
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        '❌ MONGODB_URI not defined in .env file. Please add your MongoDB connection string.'
      );
    }

    // Connect to MongoDB (Mongoose 6+ doesn't need deprecated options)
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'bluewing', // Specify the database name
    });

    console.log(`✅ MongoDB Connected`);
    console.log(`📍 Database: ${conn.connection.db.databaseName}`);
    console.log(`🔗 Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Additional helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error(
        '💡 Tip: Make sure MongoDB is running or your Atlas cluster is accessible'
      );
    } else if (error.message.includes('authentication failed')) {
      console.error(
        '💡 Tip: Check your MongoDB username and password in the connection string'
      );
    } else if (error.message.includes('ENOTFOUND')) {
      console.error(
        '💡 Tip: Check your MongoDB URI is correct and you have internet connection'
      );
    }

    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
