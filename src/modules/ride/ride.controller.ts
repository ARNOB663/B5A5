import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import Ride from './ride.model';
import User from '../user/user.model';
import { RideRequestInput, RideStatusUpdateInput } from '../../utils/validation';

export const requestRide = async (req: Request, res: Response): Promise<Response> => {
  try {
    const riderId = req.user!.userId;
    const rideData: RideRequestInput = req.body;

    const activeRide = await Ride.findOne({
      riderId,
      status: { $in: ['requested', 'accepted', 'picked_up', 'in_transit'] }
    });

    if (activeRide) {
      return sendError(res, 'You already have an active ride', undefined, 400);
    }

    const estimatedFare = calculateEstimatedFare(
      rideData.pickupLocation.coordinates,
      rideData.destinationLocation.coordinates,
      rideData.rideType
    );

    const ride = new Ride({
      riderId,
      pickupLocation: rideData.pickupLocation,
      destinationLocation: rideData.destinationLocation,
      rideType: rideData.rideType,
      scheduledTime: rideData.scheduledTime,
      estimatedFare,
    });

    await ride.save();

    return sendSuccess(res, 'Ride requested successfully', {
      rideId: ride._id,
      estimatedFare,
      status: ride.status,
      requestedAt: ride.requestedAt,
    }, 201);
  } catch (error) {
    return sendError(res, 'Failed to request ride', (error as Error).message, 500);
  }
};

export const cancelRide = async (req: Request, res: Response): Promise<Response> => {
  try {
    const riderId = req.user!.userId;
    const { rideId } = req.params;

    const ride = await Ride.findOne({ _id: rideId, riderId });
    if (!ride) {
      return sendError(res, 'Ride not found', undefined, 404);
    }

    if (!['requested', 'accepted'].includes(ride.status)) {
      return sendError(res, 'Ride cannot be cancelled at this stage', undefined, 400);
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    ride.cancelledBy = 'rider';
    ride.cancellationReason = req.body.reason || 'Cancelled by rider';

    await ride.save();

    return sendSuccess(res, 'Ride cancelled successfully', {
      rideId: ride._id,
      status: ride.status,
      cancelledAt: ride.cancelledAt,
    });
  } catch (error) {
    return sendError(res, 'Failed to cancel ride', (error as Error).message, 500);
  }
};

export const getRideHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const riderId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ riderId })
      .populate('driverId', 'firstName lastName phone vehicleInfo rating')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ riderId });

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

export const getAvailableRides = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any;
    if (!driverData.isOnline) {
      return sendError(res, 'Driver must be online to view available rides', undefined, 400);
    }

    const activeRide = await Ride.findOne({
      driverId,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] }
    });

    if (activeRide) {
      return sendError(res, 'Driver already has an active ride', undefined, 400);
    }

    const availableRides = await Ride.find({ status: 'requested' })
      .populate('riderId', 'firstName lastName phone')
      .sort({ requestedAt: 1 })
      .limit(20);

    return sendSuccess(res, 'Available rides retrieved successfully', availableRides);
  } catch (error) {
    return sendError(res, 'Failed to retrieve available rides', (error as Error).message, 500);
  }
};

export const acceptRide = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const { rideId } = req.params;

    const activeRide = await Ride.findOne({
      driverId,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] }
    });

    if (activeRide) {
      return sendError(res, 'Driver already has an active ride', undefined, 400);
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return sendError(res, 'Ride not found', undefined, 404);
    }

    if (ride.status !== 'requested') {
      return sendError(res, 'Ride is not available for acceptance', undefined, 400);
    }

    ride.driverId = driverId;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();

    await ride.save();

    return sendSuccess(res, 'Ride accepted successfully', {
      rideId: ride._id,
      status: ride.status,
      acceptedAt: ride.acceptedAt,
    });
  } catch (error) {
    return sendError(res, 'Failed to accept ride', (error as Error).message, 500);
  }
};

export const updateRideStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const { rideId } = req.params;
    const { status }: RideStatusUpdateInput = req.body;

    const ride = await Ride.findOne({ _id: rideId, driverId });
    if (!ride) {
      return sendError(res, 'Ride not found', undefined, 404);
    }

    const validTransitions: { [key: string]: string[] } = {
      'accepted': ['picked_up', 'rejected'],
      'picked_up': ['in_transit'],
      'in_transit': ['completed'],
    };

    if (!validTransitions[ride.status]?.includes(status)) {
      return sendError(res, `Cannot transition from ${ride.status} to ${status}`, undefined, 400);
    }

    ride.status = status;
    const now = new Date();

    switch (status) {
      case 'picked_up':
        ride.pickedUpAt = now;
        break;
      case 'in_transit':
        ride.inTransitAt = now;
        break;
      case 'completed':
        ride.completedAt = now;
        ride.paymentStatus = 'completed';
        await updateDriverStats(driverId, ride.actualFare || ride.estimatedFare || 0);
        break;
      case 'rejected':
        ride.driverId = undefined;
        ride.status = 'requested'; // Make available for other drivers
        break;
    }

    await ride.save();

    return sendSuccess(res, `Ride status updated to ${status}`, {
      rideId: ride._id,
      status: ride.status,
      updatedAt: now,
    });
  } catch (error) {
    return sendError(res, 'Failed to update ride status', (error as Error).message, 500);
  }
};

export const getDriverEarnings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const { period } = req.query; // 'today', 'week', 'month'

    let dateFilter: any = {};
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = {
          completedAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        dateFilter = { completedAt: { $gte: weekStart } };
        break;
      case 'month':
        dateFilter = {
          completedAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        };
        break;
    }

    const earnings = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$actualFare' },
          totalRides: { $sum: 1 },
          averageFare: { $avg: '$actualFare' },
        },
      },
    ]);

    const result = earnings[0] || {
      totalEarnings: 0,
      totalRides: 0,
      averageFare: 0,
    };

    return sendSuccess(res, 'Earnings retrieved successfully', result);
  } catch (error) {
    return sendError(res, 'Failed to retrieve earnings', (error as Error).message, 500);
  }
};

export const setDriverOnlineStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const driverId = req.user!.userId;
    const { isOnline } = req.body;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return sendError(res, 'Driver not found', undefined, 404);
    }

    const driverData = driver as any;
    driverData.isOnline = isOnline;
    await driver.save();

    return sendSuccess(res, `Driver status updated to ${isOnline ? 'online' : 'offline'}`, {
      isOnline: driverData.isOnline,
    });
  } catch (error) {
    return sendError(res, 'Failed to update driver status', (error as Error).message, 500);
  }
};

const calculateEstimatedFare = (
  pickup: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  rideType: string
): number => {
  const distance = calculateDistance(pickup, destination);
  
  const baseFare = 50; // Base fare
  const farePerKm = rideType === 'premium' ? 25 : rideType === 'shared' ? 15 : 20;
  
  return Math.round(baseFare + (distance * farePerKm));
};

const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const updateDriverStats = async (driverId: string, fare: number): Promise<void> => {
  await User.findByIdAndUpdate(driverId, {
    $inc: {
      totalRides: 1,
      totalEarnings: fare,
    },
  });
};
