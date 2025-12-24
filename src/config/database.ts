import mongoose from 'mongoose';
import { config } from './config';

// Define the global type for mongoose caching
// Using 'any' to avoid strict TypeScript checks that are failing on Vercel/local builds
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Sanitize and log the URI for debugging
    const sanitizeUri = (uri: string) => {
      try {
        return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.*)/, '$1*****$3');
      } catch {
        return 'Check env vars';
      }
    };
    console.log(`🔗 Connecting to MongoDB: ${sanitizeUri(config.mongodbUri)}`);

    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    cached.promise = mongoose.connect(config.mongodbUri, opts).then((mongoose) => {
      console.log('✅ New MongoDB connection established');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection promise failed:', e);
    throw e;
  }

  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
