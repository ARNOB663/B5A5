import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ResponseHelper } from '../utils/response';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      ResponseHelper.error(res, errorMessage, 400);
      return;
    }

    next();
  };
};
