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

    console.log('🔗 Connecting to MongoDB...');

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
