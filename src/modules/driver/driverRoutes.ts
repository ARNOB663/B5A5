import { Router } from 'express';
import { setAvailability, getEarnings, updateLocation, getDriverReviews, updateVehicleInfo } from './driverController';
import { getAvailableRides } from '../ride/rideController';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { setAvailabilityValidation, updateLocationValidation } from './driverValidation';
import { UserRole } from '../../utils/types';

const router = Router();


router.use(authenticate, authorize(UserRole.DRIVER));

router.get('/requests', getAvailableRides);
router.get('/:driverId/reviews', getDriverReviews); // Public or authenticated? Assuming authenticated as per base use
router.patch('/availability', validate(setAvailabilityValidation), setAvailability);
router.get('/earnings', getEarnings);
router.patch('/location', validate(updateLocationValidation), updateLocation);
router.patch('/vehicle', updateVehicleInfo); // Should add validation middleware in real app

export default router;
