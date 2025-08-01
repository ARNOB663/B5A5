import { Router } from 'express';
import { updateProfile, changePassword, deactivateAccount } from './user.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { updateProfileSchema } from '../../utils/validation';
import { z } from 'zod';

const router = Router();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});


router.patch('/profile', 
  authenticate, 
  validate(updateProfileSchema), 
  updateProfile
);

router.patch('/change-password', 
  authenticate, 
  validate(changePasswordSchema), 
  changePassword
);

router.patch('/deactivate', 
  authenticate, 
  deactivateAccount
);

export default router;
