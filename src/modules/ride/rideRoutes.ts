import { Router } from 'express';
import {
  requestRide,
  getRideHistory,
  cancelRide,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getCurrentRide,
  rateRide
} from './rideController';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import {
  requestRideValidation,
  updateRideStatusValidation,
  cancelRideValidation,
  rateRideValidation
} from './rideValidation';
import { UserRole } from '../../utils/types';

const router = Router();


router.use(authenticate);


router.post('/request', authorize(UserRole.RIDER), validate(requestRideValidation), requestRide);
router.get('/history', getRideHistory);
router.post('/:rideId/cancel', validate(cancelRideValidation), cancelRide);
router.get('/current', getCurrentRide);
router.post('/:rideId/rate', authorize(UserRole.RIDER), validate(rateRideValidation), rateRide);


router.get('/available', authorize(UserRole.DRIVER), getAvailableRides);
router.post('/:rideId/accept', authorize(UserRole.DRIVER), acceptRide);
router.patch('/:rideId/status', authorize(UserRole.DRIVER), validate(updateRideStatusValidation), updateRideStatus);

export default router;
