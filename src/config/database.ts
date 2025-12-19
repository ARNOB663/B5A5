import mongoose from 'mongoose';
import { config } from './config';

// Cache the connection to reuse in serverless environments
let cachedConnection: typeof mongoose | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Reuse existing connection if available (for serverless)
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }

    // Close existing connection if it exists but is not ready
    if (cachedConnection) {
      await mongoose.connection.close();
    }

    await mongoose.connect(config.mongodbUri);
    cachedConnection = mongoose;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit process in serverless environment
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
