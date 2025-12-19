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

// Base admin route - shows available endpoints (no auth required for info)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API endpoints',
    endpoints: {
      users: {
        list: 'GET /api/v1/admin/users',
        block: 'PATCH /api/v1/admin/users/:userId/block',
        unblock: 'PATCH /api/v1/admin/users/:userId/unblock'
      },
      drivers: {
        list: 'GET /api/v1/admin/drivers',
        approve: 'PATCH /api/v1/admin/drivers/:driverId/approve',
        suspend: 'PATCH /api/v1/admin/drivers/:driverId/suspend'
      },
      rides: {
        list: 'GET /api/v1/admin/rides'
      },
      dashboard: {
        stats: 'GET /api/v1/admin/dashboard/stats'
      }
    },
    note: 'All endpoints require authentication with admin role'
  });
});

// All other routes require authentication and admin role
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
