import mongoose from 'mongoose';
import { config } from './config';

// Traditional connection pattern with proper error handling
let isConnecting = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return mongoose;
  }

  // If currently connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    console.log('⏳ Connection in progress, waiting...');
    return connectionPromise;
  }

  // Validate MongoDB URI
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // CRITICAL CHECK: Fail fast if using localhost in production
  if (config.mongodbUri === 'mongodb://localhost:27017/ride-booking') {
    const errorMsg = '⚠️ Using default localhost MongoDB URI - this will fail in production!';
    console.error(errorMsg);
    if (process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is not set in Vercel. Please add it in Project Settings → Environment Variables');
    }
  }

  // Sanitize and log the URI for debugging
  const sanitizeUri = (uri: string) => {
    try {
      return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.*)/, '$1*****$3');
    } catch {
      return '[INVALID URI FORMAT]';
    }
  };

  console.log(`🔗 Connecting to MongoDB: ${sanitizeUri(config.mongodbUri)}`);
  console.log(`   Full URI length: ${config.mongodbUri.length} characters`);
  console.log(`   Protocol: ${config.mongodbUri.startsWith('mongodb+srv://') ? 'SRV (Atlas)' : 'Standard'}`);

  isConnecting = true;

  const connectionOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for Vercel cold starts
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4
  };

  console.log('🔧 Connection options:', JSON.stringify(connectionOptions, null, 2));

  connectionPromise = mongoose
    .connect(config.mongodbUri, connectionOptions)
    .then((mongooseInstance) => {
      isConnecting = false;
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongooseInstance.connection.name}`);
      console.log(`   Host: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    })
    .catch((error) => {
      isConnecting = false;
      connectionPromise = null;

      // Enhanced error logging
      console.error('❌ MongoDB connection failed');
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);

      // Provide specific error messages based on error type
      if (error.name === 'MongooseServerSelectionError') {
        console.error('   Diagnosis: Cannot reach MongoDB server');
        console.error('   Possible causes:');
        console.error('   1. MongoDB Atlas IP whitelist does not include Vercel IPs (add 0.0.0.0/0)');
        console.error('   2. Invalid connection string');
        console.error('   3. Network connectivity issues');
        console.error('   4. MongoDB Atlas cluster is paused or deleted');
      } else if (error.name === 'MongoParseError') {
        console.error('   Diagnosis: Invalid connection string format');
        console.error('   Check: Connection string syntax and encoding');
      } else if (error.message.includes('authentication') || error.message.includes('auth')) {
        console.error('   Diagnosis: Authentication failed');
        console.error('   Check: Username and password in connection string');
      }

      throw error;
    });

  return connectionPromise;
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});
