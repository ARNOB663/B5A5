import { Router } from 'express';
import { setAvailability, getEarnings, updateLocation } from './driverController';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { setAvailabilityValidation, updateLocationValidation } from './driverValidation';
import { UserRole } from '../../utils/types';

const router = Router();


router.use(authenticate, authorize(UserRole.DRIVER));

router.patch('/availability', validate(setAvailabilityValidation), setAvailability);
router.get('/earnings', getEarnings);
router.patch('/location', validate(updateLocationValidation), updateLocation);

export default router;
