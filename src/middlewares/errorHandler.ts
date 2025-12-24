import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { message, statusCode: 400 };
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return { message, statusCode: 400 };
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return { message, statusCode: 400 };
};

const handleJWTError = () => {
  return { message: 'Invalid token. Please log in again!', statusCode: 401 };
};

const handleJWTExpiredError = () => {
  return { message: 'Your token has expired! Please log in again.', statusCode: 401 };
};

const sendErrorDev = (err: ErrorWithStatus, res: Response) => {
  ResponseHelper.error(res, err.message, err.statusCode || 500, err.stack);
};

const sendErrorProd = (err: ErrorWithStatus, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    ResponseHelper.error(res, err.message, err.statusCode || 500);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    ResponseHelper.error(res, 'Something went wrong!', 500);
  }
};

export const globalErrorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    if (error.name === 'CastError') {
      const castError = handleCastErrorDB(error);
      error.message = castError.message;
      error.statusCode = castError.statusCode;
      error.isOperational = true;
    }

    if ((error as any).code === 11000) {
      const duplicateError = handleDuplicateFieldsDB(error);
      error.message = duplicateError.message;
      error.statusCode = duplicateError.statusCode;
      error.isOperational = true;
    }

    if (error.name === 'ValidationError') {
      const validationError = handleValidationErrorDB(error);
      error.message = validationError.message;
      error.statusCode = validationError.statusCode;
      error.isOperational = true;
    }

    if (error.name === 'JsonWebTokenError') {
      const jwtError = handleJWTError();
      error.message = jwtError.message;
      error.statusCode = jwtError.statusCode;
      error.isOperational = true;
    }

    if (error.name === 'TokenExpiredError') {
      const jwtExpiredError = handleJWTExpiredError();
      error.message = jwtExpiredError.message;
      error.statusCode = jwtExpiredError.statusCode;
      error.isOperational = true;
    }

    // Handle DB connectivity errors explicitly (e.g., MongooseServerSelectionError)
    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
      error.message = 'Service unavailable: cannot connect to database';
      error.statusCode = 503;
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};
