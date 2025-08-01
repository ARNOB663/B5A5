import { Router } from 'express';
import {
  requestRide,
  cancelRide,
  getRideHistory,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverEarnings,
  setDriverOnlineStatus,
} from './ride.controller';
import { authenticate, authorize, checkDriverApproval } from '../../middlewares/auth';
import { validate, validateParams } from '../../middlewares/validation';
import { rideRequestSchema, rideStatusUpdateSchema } from '../../utils/validation';
import { z } from 'zod';

const router = Router();

router.post('/request', 
  authenticate, 
  authorize('rider'), 
  validate(rideRequestSchema), 
  requestRide
);

router.patch('/:rideId/cancel', 
  authenticate, 
  authorize('rider'),
  validateParams(z.object({ rideId: z.string().min(1) })),
  cancelRide
);

router.get('/history', 
  authenticate, 
  authorize('rider'), 
  getRideHistory
);

router.get('/available', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  getAvailableRides
);

router.patch('/:rideId/accept', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  validateParams(z.object({ rideId: z.string().min(1) })),
  acceptRide
);

router.patch('/:rideId/status', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  validateParams(z.object({ rideId: z.string().min(1) })),
  validate(rideStatusUpdateSchema),
  updateRideStatus
);

router.get('/earnings', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  getDriverEarnings
);

router.patch('/status', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  validate(z.object({ isOnline: z.boolean() })),
  setDriverOnlineStatus
);

export default router;
