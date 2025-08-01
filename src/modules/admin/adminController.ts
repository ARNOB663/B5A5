import { Request, Response } from 'express';
import { User, Driver } from '../user/userModel';
import { Ride } from '../ride/rideModel';
import { ResponseHelper, asyncHandler } from '../../utils/response';
import { DriverApprovalStatus, UserRole } from '../../utils/types';

interface AuthRequest extends Request {
  user?: any;
}

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, role, search } = req.query;

  const filter: any = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await User.countDocuments(filter);

  ResponseHelper.success(res, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalUsers: total
    }
  });
});

export const getAllDrivers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, approvalStatus } = req.query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (approvalStatus) {
    filter.approvalStatus = approvalStatus;
  }

  const drivers = await Driver.find(filter)
    .populate('userId', 'name email phone isBlocked')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Driver.countDocuments(filter);

  ResponseHelper.success(res, 'Drivers retrieved successfully', {
    drivers,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalDrivers: total
    }
  });
});

export const getAllRides = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate as string);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate as string);
    }
  }

  const rides = await Ride.find(filter)
    .populate('riderId', 'name email phone')
    .populate('driverId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Ride.countDocuments(filter);

  ResponseHelper.success(res, 'Rides retrieved successfully', {
    rides,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalRides: total
    }
  });
});

export const approveDriver = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { driverId } = req.params;

  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { approvalStatus: DriverApprovalStatus.APPROVED },
    { new: true }
  ).populate('userId', 'name email phone');

  if (!driver) {
    ResponseHelper.error(res, 'Driver not found', 404);
    return;
  }

  ResponseHelper.success(res, 'Driver approved successfully', { driver });
});

export const suspendDriver = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { driverId } = req.params;

  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { 
      approvalStatus: DriverApprovalStatus.SUSPENDED,
      status: 'offline'
    },
    { new: true }
  ).populate('userId', 'name email phone');

  if (!driver) {
    ResponseHelper.error(res, 'Driver not found', 404);
    return;
  }

  ResponseHelper.success(res, 'Driver suspended successfully', { driver });
});

export const blockUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    { new: true }
  ).select('-password');

  if (!user) {
    ResponseHelper.error(res, 'User not found', 404);
    return;
  }

  // If user is a driver, also suspend them
  if (user.role === UserRole.DRIVER) {
    await Driver.findOneAndUpdate(
      { userId },
      { 
        approvalStatus: DriverApprovalStatus.SUSPENDED,
        status: 'offline'
      }
    );
  }

  ResponseHelper.success(res, 'User blocked successfully', { user });
});

export const unblockUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    { new: true }
  ).select('-password');

  if (!user) {
    ResponseHelper.error(res, 'User not found', 404);
    return;
  }

  ResponseHelper.success(res, 'User unblocked successfully', { user });
});

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const totalUsers = await User.countDocuments();
  const totalDrivers = await Driver.countDocuments();
  const totalRides = await Ride.countDocuments();
  const completedRides = await Ride.countDocuments({ status: 'completed' });
  const activeRides = await Ride.countDocuments({ 
    status: { $in: ['requested', 'accepted', 'picked_up', 'in_transit'] } 
  });

  const totalRevenue = await Ride.aggregate([
    { $match: { status: 'completed', fare: { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$fare' } } }
  ]);

  const pendingDriverApprovals = await Driver.countDocuments({ 
    approvalStatus: DriverApprovalStatus.PENDING 
  });

  const stats = {
    totalUsers,
    totalDrivers,
    totalRides,
    completedRides,
    activeRides,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingDriverApprovals,
    averageRidesPerDay: completedRides / 30, // Approximate
    rideCompletionRate: totalRides > 0 ? (completedRides / totalRides) * 100 : 0
  };

  ResponseHelper.success(res, 'Dashboard statistics retrieved successfully', { stats });
});
