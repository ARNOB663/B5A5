import { Router } from 'express';
import { setAvailability, getEarnings, updateLocation } from './driverController';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../utils/types';

const router = Router();


router.use(authenticate, authorize(UserRole.DRIVER));

router.patch('/availability', setAvailability);
router.get('/earnings', getEarnings);
router.patch('/location', updateLocation);

export default router;
