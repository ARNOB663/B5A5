import { Request, Response } from 'express';
import { Driver } from '../user/userModel';
import { ResponseHelper, asyncHandler } from '../../utils/response';
import { DriverStatus } from '../../utils/types';

interface AuthRequest extends Request {
  user?: any;
}

export const setAvailability = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, location } = req.body;
  const userId = req.user._id;

  const updateData: any = { status };


  if (status === DriverStatus.ONLINE && location) {
    updateData.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  const driver = await Driver.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  ResponseHelper.success(res, 'Availability status updated successfully', { driver });
});

export const getEarnings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const driver = await Driver.findOne({ userId });

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  // Build date filter if provided
  const dateFilter: any = { driverId: userId, status: 'completed' };

  if (startDate || endDate) {
    dateFilter.completedAt = {};
    if (startDate) {
      dateFilter.completedAt.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.completedAt.$lte = new Date(endDate as string);
    }
  }

  // Import Ride model here to avoid circular dependency
  const { Ride } = await import('../ride/rideModel');

  const rides = await Ride.find(dateFilter)
    .populate('riderId', 'name')
    .sort({ completedAt: -1 });

  const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

  ResponseHelper.success(res, 'Earnings retrieved successfully', {
    totalEarnings: driver.totalEarnings,
    periodEarnings: totalEarnings,
    totalRides: driver.totalRides,
    periodRides: rides.length,
    rides
  });
});

export const updateLocation = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { latitude, longitude } = req.body;
  const userId = req.user._id;

  const driver = await Driver.findOneAndUpdate(
    { userId },
    {
      currentLocation: {
        latitude,
        longitude
      }
    },
    { new: true }
  );

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  ResponseHelper.success(res, 'Location updated successfully', { location: driver.currentLocation });
});
