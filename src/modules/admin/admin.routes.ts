import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getPendingDrivers,
  approveDriver,
  blockUser,
  getAllRides,
  getRideById,
  getSystemStats,
} from './admin.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate, validateParams } from '../../middlewares/validation';
import { driverApprovalSchema, userBlockSchema } from '../../utils/validation';
import { z } from 'zod';

const router = Router();

const idParamSchema = z.object({
  userId: z.string().min(1),
});

const driverIdParamSchema = z.object({
  driverId: z.string().min(1),
});

const rideIdParamSchema = z.object({
  rideId: z.string().min(1),
});

// Admin-only routes
router.get('/users', 
  authenticate, 
  authorize('admin'), 
  getAllUsers
);

router.get('/users/:userId', 
  authenticate, 
  authorize('admin'),
  validateParams(idParamSchema),
  getUserById
);

router.get('/drivers/pending', 
  authenticate, 
  authorize('admin'), 
  getPendingDrivers
);

router.patch('/drivers/:driverId/approve', 
  authenticate, 
  authorize('admin'),
  validateParams(driverIdParamSchema),
  validate(driverApprovalSchema),
  approveDriver
);

router.patch('/users/:userId/block', 
  authenticate, 
  authorize('admin'),
  validateParams(idParamSchema),
  validate(userBlockSchema),
  blockUser
);

router.get('/rides', 
  authenticate, 
  authorize('admin'), 
  getAllRides
);

router.get('/rides/:rideId', 
  authenticate, 
  authorize('admin'),
  validateParams(rideIdParamSchema),
  getRideById
);

router.get('/stats', 
  authenticate, 
  authorize('admin'), 
  getSystemStats
);

export default router;
