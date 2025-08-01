import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import User from '../user/user.model';
import Ride from '../ride/ride.model';
import { DriverApprovalInput, UserBlockInput } from '../../utils/validation';

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;

    let filter: any = {};
    if (role && ['admin', 'rider', 'driver'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return sendSuccess(res, 'Users retrieved successfully', {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve users', (error as Error).message, 500);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    return sendSuccess(res, 'User retrieved successfully', user);
  } catch (error) {
    return sendError(res, 'Failed to retrieve user', (error as Error).message, 500);
  }
};

export const getPendingDrivers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const pendingDrivers = await User.find({
      role: 'driver',
      isApproved: false,
      rejectionReason: { $exists: false },
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      role: 'driver',
      isApproved: false,
      rejectionReason: { $exists: false },
    });

    return sendSuccess(res, 'Pending drivers retrieved successfully', {
      drivers: pendingDrivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve pending drivers', (error as Error).message, 500);
  }
};

export const approveDriver = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { driverId } = req.params;
    const { isApproved, rejectionReason }: DriverApprovalInput = req.body;
    const adminId = req.user!.userId;

    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any;

    if (isApproved) {
      driverData.isApproved = true;
      driverData.approvedAt = new Date();
      driverData.approvedBy = adminId;
      driverData.rejectionReason = undefined;
    } else {
      driverData.isApproved = false;
      driverData.rejectionReason = rejectionReason || 'Application rejected';
      driverData.approvedAt = undefined;
      driverData.approvedBy = undefined;
    }

    await driver.save();

    return sendSuccess(res, `Driver ${isApproved ? 'approved' : 'rejected'} successfully`, {
      driverId: driver._id,
      isApproved: driverData.isApproved,
      approvedAt: driverData.approvedAt,
      rejectionReason: driverData.rejectionReason,
    });
  } catch (error) {
    return sendError(res, 'Failed to update driver approval status', (error as Error).message, 500);
  }
};

export const blockUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const { isBlocked, blockReason }: UserBlockInput = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    user.isBlocked = isBlocked;
    user.blockReason = isBlocked ? (blockReason || 'Account blocked by admin') : undefined;

    await user.save();

    return sendSuccess(res, `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, {
      userId: user._id,
      isBlocked: user.isBlocked,
      blockReason: user.blockReason,
    });
  } catch (error) {
    return sendError(res, 'Failed to update user block status', (error as Error).message, 500);
  }
};

export const getAllRides = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    let filter: any = {};
    if (status && ['requested', 'accepted', 'picked_up', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const rides = await Ride.find(filter)
      .populate('riderId', 'firstName lastName email phone')
      .populate('driverId', 'firstName lastName email phone vehicleInfo')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments(filter);

    return sendSuccess(res, 'Rides retrieved successfully', {
      rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve rides', (error as Error).message, 500);
  }
};

export const getRideById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId)
      .populate('riderId', 'firstName lastName email phone')
      .populate('driverId', 'firstName lastName email phone vehicleInfo');

    if (!ride) {
      return sendError(res, 'Ride not found', undefined, 404);
    }

    return sendSuccess(res, 'Ride retrieved successfully', ride);
  } catch (error) {
    return sendError(res, 'Failed to retrieve ride', (error as Error).message, 500);
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get ride statistics
    const rideStats = await Ride.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get financial statistics
    const financialStats = await Ride.aggregate([
      {
        $match: { status: 'completed' },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$actualFare' },
          totalRides: { $sum: 1 },
          averageFare: { $avg: '$actualFare' },
        },
      },
    ]);

    // Get driver approval statistics
    const driverApprovalStats = await User.aggregate([
      {
        $match: { role: 'driver' },
      },
      {
        $group: {
          _id: '$isApproved',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      users: userStats.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      rides: rideStats.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      financial: financialStats[0] || {
        totalRevenue: 0,
        totalRides: 0,
        averageFare: 0,
      },
      driverApprovals: driverApprovalStats.reduce((acc: any, curr) => {
        acc[curr._id ? 'approved' : 'pending'] = curr.count;
        return acc;
      }, {}),
    };

    return sendSuccess(res, 'System statistics retrieved successfully', stats);
  } catch (error) {
    return sendError(res, 'Failed to retrieve system statistics', (error as Error).message, 500);
  }
};
