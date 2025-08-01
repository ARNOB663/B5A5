import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        return sendError(res, 'Validation failed', errorMessages, 400);
      }
      return sendError(res, 'Invalid request data', undefined, 400);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        return sendError(res, 'Invalid parameters', errorMessages, 400);
      }
      return sendError(res, 'Invalid request parameters', undefined, 400);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        return sendError(res, 'Invalid query parameters', errorMessages, 400);
      }
      return sendError(res, 'Invalid query parameters', undefined, 400);
    }
  };
};
