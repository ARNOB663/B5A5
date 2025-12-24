import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { connectDatabase } from '../config/database';

export const ensureDbConnected = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // If already connected, proceed immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    // Attempt to connect if not ready
    await connectDatabase();
    next();
  } catch (error) {
    const err = error as Error;
    console.error('Database connection failed in middleware:', err);

    // Provide detailed error message to help with debugging
    let errorMessage = 'Service unavailable: database connection failed';

    if (err.name === 'MongooseServerSelectionError') {
      errorMessage += ' - Cannot reach MongoDB server. Check IP whitelist and connection string.';
    } else if (err.name === 'MongoParseError') {
      errorMessage += ' - Invalid MongoDB connection string format.';
    } else if (err.message.includes('authentication')) {
      errorMessage += ' - Authentication failed. Check MongoDB credentials.';
    } else if (err.message) {
      errorMessage += ` - ${err.message}`;
    }

    ResponseHelper.error(res, errorMessage, 503);
  }
};
