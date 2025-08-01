import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../modules/user/userModel';
import { ResponseHelper } from '../utils/response';
import { UserRole } from '../utils/types';
import { config } from '../config/config';

interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      ResponseHelper.error(res, 'Access denied. No token provided.', 401);
      return;
    }

    const decoded = (jwt as any).verify(token, config.jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      ResponseHelper.error(res, 'Invalid token. User not found.', 401);
      return;
    }

    if (user.isBlocked) {
      ResponseHelper.error(res, 'Account is blocked. Contact admin.', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    ResponseHelper.error(res, 'Invalid token.', 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.error(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseHelper.error(res, 'Access denied. Insufficient permissions.', 403);
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = (jwt as any).verify(token, config.jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
