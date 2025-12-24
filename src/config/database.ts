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

  if (config.mongodbUri === 'mongodb://localhost:27017/ride-booking') {
    console.warn('⚠️ Using default localhost MongoDB URI - this will fail in production!');
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

  isConnecting = true;

  const connectionOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000, // 10 seconds to find a server
    socketTimeoutMS: 45000, // 45 seconds for socket operations
    family: 4, // Use IPv4, skip trying IPv6
  };

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

      // Provide specific error messages based on error type
      if (error.name === 'MongooseServerSelectionError') {
        console.error('❌ MongoDB Server Selection Error - Cannot reach database server');
        console.error('   Possible causes:');
        console.error('   1. MongoDB Atlas IP whitelist does not include your deployment IP');
        console.error('   2. Invalid connection string');
        console.error('   3. Network connectivity issues');
      } else if (error.name === 'MongoParseError') {
        console.error('❌ MongoDB Parse Error - Invalid connection string format');
      } else if (error.message.includes('authentication')) {
        console.error('❌ MongoDB Authentication Error - Invalid credentials');
      } else {
        console.error('❌ MongoDB connection error:', error.message);
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
