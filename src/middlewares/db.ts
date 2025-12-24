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
    console.error('Database connection failed in middleware:', error);
    ResponseHelper.error(res, 'Service unavailable: database connection failed', 503);
  }
};
