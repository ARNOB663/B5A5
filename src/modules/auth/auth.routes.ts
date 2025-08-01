import { Router } from 'express';
import { 
  register, 
  registerDriver, 
  login, 
  getProfile 
} from './auth.controller';
import { validate } from '../../middlewares/validation';
import { authenticate } from '../../middlewares/auth';
import { 
  registerSchema, 
  driverRegistrationSchema, 
  loginSchema 
} from '../../utils/validation';

const router = Router();


router.post('/register', validate(registerSchema), register);
router.post('/register/driver', validate(driverRegistrationSchema), registerDriver);
router.post('/login', validate(loginSchema), login);


router.get('/profile', authenticate, getProfile);

export default router;
