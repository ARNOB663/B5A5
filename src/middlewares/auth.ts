import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import User from '../modules/user/user.model';


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { isBlocked?: boolean };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded = verifyToken(token);

 
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User not found', undefined, 401);
    }

    if (user.isBlocked) {
      return sendError(res, 'Account has been blocked', user.blockReason, 403);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', undefined, 403);
    }

    req.user = {
      ...decoded,
      isBlocked: user.isBlocked,
    };

    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', (error as Error).message, 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return sendError(res, 'Authentication required', undefined, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', undefined, 403);
    }

    next();
  };
};


export const checkDriverApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    if (!req.user || req.user.role !== 'driver') {
      return sendError(res, 'Driver access required', undefined, 403);
    }

    const driver = await User.findById(req.user.userId);
    if (!driver || driver.role !== 'driver') {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any; 
    if (!driverData.isApproved) {
      return sendError(res, 'Driver account not approved yet', undefined, 403);
    }

    next();
  } catch (error) {
    return sendError(res, 'Error checking driver approval', (error as Error).message, 500);
  }
};
