import { Response } from 'express';
import { ApiResponse } from './types';

export class ResponseHelper {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 400, error?: string): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    return res.status(statusCode).json(response);
  }
}

export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
