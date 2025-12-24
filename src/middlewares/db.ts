import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';

export const ensureDbConnected = (req: Request, res: Response, next: NextFunction): void => {
  if (mongoose.connection.readyState !== 1) {
    ResponseHelper.error(res, 'Service unavailable: database not connected', 503);
    return;
  }
  next();
};
