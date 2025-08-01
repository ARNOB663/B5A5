import { Router } from 'express';
import {
  getDriverStats,
  updateVehicleInfo,
  getActiveRide,
  getRideHistory,
} from './driver.controller';
import { authenticate, authorize, checkDriverApproval } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();


const vehicleInfoSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1900).max(new Date().getFullYear()),
  licensePlate: z.string().min(1, 'License plate is required'),
  color: z.string().min(1, 'Vehicle color is required'),
});


router.get('/stats', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  getDriverStats
);

router.patch('/vehicle', 
  authenticate, 
  authorize('driver'),
  validate(vehicleInfoSchema),
  updateVehicleInfo
);

router.get('/active-ride', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  getActiveRide
);

router.get('/ride-history', 
  authenticate, 
  authorize('driver'),
  checkDriverApproval,
  getRideHistory
);

export default router;
