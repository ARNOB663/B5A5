import { Request, Response } from 'express';
import { Driver } from '../user/userModel';
import { ResponseHelper, asyncHandler } from '../../utils/response';
import { DriverStatus, DriverApprovalStatus } from '../../utils/types';
import { emitToAll } from '../../socket';

interface AuthRequest extends Request {
  user?: any;
}

export const setAvailability = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, location } = req.body;
  const userId = req.user._id;

  // Check if driver exists and is approved
  const driver = await Driver.findOne({ userId });

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  // Prevent suspended drivers from going online
  if (status === DriverStatus.ONLINE && driver.approvalStatus === DriverApprovalStatus.SUSPENDED) {
    ResponseHelper.error(res, 'Suspended drivers cannot set status to online', 403);
    return;
  }

  const updateData: any = { status };

  // Update location if going online
  if (status === DriverStatus.ONLINE && location) {
    updateData.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, runValidators: true }
  );

  ResponseHelper.success(res, 'Availability status updated successfully', { driver: updatedDriver });
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

  // Emit location update
  emitToAll('driver:location_update', {
    driverId: userId,
    location: driver.currentLocation
  });

  ResponseHelper.success(res, 'Location updated successfully', { location: driver.currentLocation });
});

export const getDriverReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { driverId } = req.params;

  // Import Ride model
  const { Ride } = await import('../ride/rideModel');

  const reviews = await Ride.find({
    driverId,
    rating: { $exists: true, $ne: null }
  })
    .populate('riderId', 'name')
    .select('rating feedback createdAt')
    .sort({ createdAt: -1 });

  ResponseHelper.success(res, 'Driver reviews retrieved successfully', { reviews });
});

export const updateVehicleInfo = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { vehicleInfo } = req.body;
  const userId = req.user._id;

  const driver = await Driver.findOne({ userId });

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  // Update allowed fields
  if (vehicleInfo) {
    if (vehicleInfo.make) driver.vehicleInfo.make = vehicleInfo.make;
    if (vehicleInfo.model) driver.vehicleInfo.model = vehicleInfo.model;
    if (vehicleInfo.year) driver.vehicleInfo.year = vehicleInfo.year;
    if (vehicleInfo.plateNumber) driver.vehicleInfo.plateNumber = vehicleInfo.plateNumber;
    if (vehicleInfo.color) driver.vehicleInfo.color = vehicleInfo.color;
  }

  await driver.save();

  ResponseHelper.success(res, 'Vehicle info updated successfully', { driver });
});
