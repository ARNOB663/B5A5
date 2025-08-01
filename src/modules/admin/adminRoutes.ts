import { Router } from 'express';
import {
  getAllUsers,
  getAllDrivers,
  getAllRides,
  approveDriver,
  suspendDriver,
  blockUser,
  unblockUser,
  getDashboardStats
} from './adminController';
import { authenticate, authorize } from '../../middlewares/auth';
import { UserRole } from '../../utils/types';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorize(UserRole.ADMIN));

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/block', blockUser);
router.patch('/users/:userId/unblock', unblockUser);

// Driver management
router.get('/drivers', getAllDrivers);
router.patch('/drivers/:driverId/approve', approveDriver);
router.patch('/drivers/:driverId/suspend', suspendDriver);

// Ride management
router.get('/rides', getAllRides);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

export default router;
