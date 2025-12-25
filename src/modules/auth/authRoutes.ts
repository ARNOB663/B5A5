import { Router } from 'express';
import { register, login, getProfile, updateProfile, registerDriver } from './authController';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { registerValidation, loginValidation, driverRegistrationValidation } from './authValidation';
import { UserRole } from '../../utils/types';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/driver/register',
  authenticate,
  authorize(UserRole.DRIVER),
  validate(driverRegistrationValidation),
  registerDriver
);

export default router;
