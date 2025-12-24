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

    // Basic check: if mongodbUri is using the fallback local value in production, warn
    if (!config.mongodbUri || config.mongodbUri === 'mongodb://localhost:27017/ride-booking') {
      console.warn('⚠️ MongoDB URI not configured or using local fallback. Connection will likely fail in production.');
    }

    // Log host only (do not print credentials)
    try {
      let host = config.mongodbUri;
      if (host.startsWith('mongodb+srv://')) {
        host = host.replace('mongodb+srv://', '').split('/')[0];
      } else if (host.startsWith('mongodb://')) {
        host = host.replace('mongodb://', '').split('/')[0];
      }
      console.log('🔗 MongoDB host:', host);
    } catch (e) {
      // ignore
    }

    await mongoose.connect(config.mongodbUri);
    cachedConnection = mongoose;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit process in serverless environment
    if ((process.env.VERCEL !== '1') && (process.env.vercel !== '1')) {
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
