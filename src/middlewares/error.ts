import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values((error as any).errors).map((err: any) => err.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  if (error.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  }

  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  return sendError(res, message, error.stack, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(res, `Route ${req.originalUrl} not found`, undefined, 404);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
