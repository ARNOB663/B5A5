import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import User from '../user/user.model';
import Ride from '../ride/ride.model';

export const getDriverStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any;

  
    const rideStats = await Ride.aggregate([
      { $match: { driverId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalEarnings: { $sum: '$actualFare' },
          averageRating: { $avg: '$driverRating' },
        },
      },
    ]);

    const stats = rideStats[0] || {
      totalRides: 0,
      totalEarnings: 0,
      averageRating: 0,
    };

    const response = {
      driver: {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        vehicleInfo: driverData.vehicleInfo,
        licenseNumber: driverData.licenseNumber,
        isApproved: driverData.isApproved,
        isOnline: driverData.isOnline,
        rating: driverData.rating,
        approvedAt: driverData.approvedAt,
      },
      stats: {
        totalRides: stats.totalRides,
        totalEarnings: stats.totalEarnings,
        averageRating: stats.averageRating || driverData.rating,
      },
    };

    return sendSuccess(res, 'Driver stats retrieved successfully', response);
  } catch (error) {
    return sendError(res, 'Failed to retrieve driver stats', (error as Error).message, 500);
  }
};

export const updateVehicleInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const vehicleInfo = req.body;

    const driver = await User.findOneAndUpdate(
      { _id: driverId, role: 'driver' },
      { $set: { vehicleInfo } },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any;

    return sendSuccess(res, 'Vehicle information updated successfully', {
      vehicleInfo: driverData.vehicleInfo,
    });
  } catch (error) {
    return sendError(res, 'Failed to update vehicle information', (error as Error).message, 500);
  }
};

export const getActiveRide = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;

    const activeRide = await Ride.findOne({
      driverId,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] },
    }).populate('riderId', 'firstName lastName phone');

    if (!activeRide) {
      return sendSuccess(res, 'No active ride found', null);
    }

    return sendSuccess(res, 'Active ride retrieved successfully', activeRide);
  } catch (error) {
    return sendError(res, 'Failed to retrieve active ride', (error as Error).message, 500);
  }
};

export const getRideHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ driverId })
      .populate('riderId', 'firstName lastName phone')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ driverId });

    return sendSuccess(res, 'Ride history retrieved successfully', {
      rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve ride history', (error as Error).message, 500);
  }
};
