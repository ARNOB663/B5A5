import { Request, Response } from 'express';
import { Ride } from './rideModel';
import { Driver } from '../user/userModel';
import { ResponseHelper, asyncHandler } from '../../utils/response';
import { RideStatus, DriverStatus, DriverApprovalStatus } from '../../utils/types';
import { emitToAll, emitToUser } from '../../socket';

interface AuthRequest extends Request {
  user?: any;
}


const calculateFare = (distance: number): number => {
  const baseFare = 50;
  const perKmRate = 15;
  return baseFare + (distance * perKmRate);
};


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const requestRide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { pickupLocation, destination } = req.body;
  const riderId = req.user._id;


  const activeRide = await Ride.findOne({
    riderId,
    status: { $in: [RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] }
  });

  if (activeRide) {
    ResponseHelper.error(res, 'You already have an active ride', 400);
    return;
  }

  const distance = calculateDistance(
    pickupLocation.latitude,
    pickupLocation.longitude,
    destination.latitude,
    destination.longitude
  );
  const fare = calculateFare(distance);


  const ride = await Ride.create({
    riderId,
    pickupLocation,
    destination,
    distance,
    fare,
    status: RideStatus.REQUESTED
  });

  const populatedRide = await Ride.findById(ride._id).populate('riderId', 'name phone');

  // Emit ride request to nearby drivers (simplification: emit to all for now, or filter by location in real app)
  emitToAll('ride:request', populatedRide);

  ResponseHelper.success(res, 'Ride requested successfully', { ride: populatedRide }, 201);
});

export const getRideHistory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const filter: any = {
    $or: [{ riderId: userId }, { driverId: userId }]
  };

  if (status) {
    filter.status = status;
  }

  const rides = await Ride.find(filter)
    .populate('riderId', 'name phone')
    .populate('driverId', 'name phone')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Ride.countDocuments(filter);

  ResponseHelper.success(res, 'Ride history retrieved successfully', {
    rides,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalRides: total
    }
  });
});

export const cancelRide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { rideId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const ride = await Ride.findById(rideId);

  if (!ride) {
    ResponseHelper.error(res, 'Ride not found', 404);
    return;
  }

  // Check if user is authorized to cancel this ride
  if (ride.riderId.toString() !== userId.toString() && ride.driverId?.toString() !== userId.toString()) {
    ResponseHelper.error(res, 'Unauthorized to cancel this ride', 403);
    return;
  }

  // Check if ride can be cancelled
  if (![RideStatus.REQUESTED, RideStatus.ACCEPTED].includes(ride.status)) {
    ResponseHelper.error(res, 'Ride cannot be cancelled at this stage', 400);
    return;
  }

  // Update ride status
  ride.status = RideStatus.CANCELLED;
  ride.cancelledAt = new Date();
  ride.cancellationReason = reason;
  await ride.save();

  // If driver was assigned, make them available again
  if (ride.driverId) {
    await Driver.findOneAndUpdate(
      { userId: ride.driverId },
      { status: DriverStatus.ONLINE }
    );
  }

  ResponseHelper.success(res, 'Ride cancelled successfully', { ride });
});

export const getAvailableRides = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = req.user._id;

  // Check if driver is approved and online
  const driver = await Driver.findOne({ userId: driverId });

  if (!driver) {
    ResponseHelper.error(res, 'Driver profile not found', 404);
    return;
  }

  if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
    ResponseHelper.error(res, 'Driver not approved yet', 403);
    return;
  }

  if (driver.status !== DriverStatus.ONLINE) {
    ResponseHelper.error(res, 'Driver must be online to view available rides', 400);
    return;
  }

  // Check if driver has any active ride
  const activeRide = await Ride.findOne({
    driverId,
    status: { $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] }
  });

  if (activeRide) {
    ResponseHelper.error(res, 'Driver already has an active ride', 400);
    return;
  }

  // Get available rides (requested status) with geo-based matching
  const rides = await Ride.find({ status: RideStatus.REQUESTED })
    .populate('riderId', 'name phone')
    .sort({ requestedAt: 1 })
    .limit(50);

  // Work with plain objects when adding calculated fields to avoid Mongoose Document typing issues
  let ridesWithDistance: any[] = rides.map(r => r.toObject());

  if (driver.currentLocation) {
    ridesWithDistance = ridesWithDistance.map(ride => {
      const distance = calculateDistance(
        driver.currentLocation!.latitude,
        driver.currentLocation!.longitude,
        ride.pickupLocation.latitude,
        ride.pickupLocation.longitude
      );
      return {
        ...ride,
        distanceFromDriver: parseFloat(distance.toFixed(2))
      };
    }).sort((a: any, b: any) => a.distanceFromDriver - b.distanceFromDriver);
  }

  ResponseHelper.success(res, 'Available rides retrieved successfully', {
    rides: ridesWithDistance.slice(0, 20) // Return top 20 closest rides
  });
});

export const acceptRide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { rideId } = req.params;
  const driverId = req.user._id;

  // Check if driver is approved and online
  const driver = await Driver.findOne({ userId: driverId });

  if (!driver || driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
    ResponseHelper.error(res, 'Driver not approved', 403);
    return;
  }

  if (driver.status !== DriverStatus.ONLINE) {
    ResponseHelper.error(res, 'Driver must be online to accept rides', 400);
    return;
  }

  // Check if driver has any active ride
  const activeRide = await Ride.findOne({
    driverId,
    status: { $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] }
  });

  if (activeRide) {
    ResponseHelper.error(res, 'Driver already has an active ride', 400);
    return;
  }

  // Find and update ride
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, status: RideStatus.REQUESTED },
    {
      driverId,
      status: RideStatus.ACCEPTED,
      acceptedAt: new Date()
    },
    { new: true }
  ).populate('riderId', 'name phone').populate('driverId', 'name phone');

  if (!ride) {
    ResponseHelper.error(res, 'Ride not found or already accepted', 404);
    return;
  }

  // Update driver status to busy
  await Driver.findOneAndUpdate(
    { userId: driverId },
    { status: DriverStatus.BUSY }
  );

  // Emit ride accepted event to rider
  emitToUser(ride.riderId._id.toString(), 'ride:accepted', ride);


  ResponseHelper.success(res, 'Ride accepted successfully', { ride });
});

export const updateRideStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { rideId } = req.params;
  const { status } = req.body;
  const driverId = req.user._id;

  const ride = await Ride.findOne({ _id: rideId, driverId });

  if (!ride) {
    ResponseHelper.error(res, 'Ride not found or unauthorized', 404);
    return;
  }

  // Validate status transition
  const validTransitions: { [key: string]: RideStatus[] } = {
    [RideStatus.ACCEPTED]: [RideStatus.PICKED_UP],
    [RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT],
    [RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED]
  };

  if (!validTransitions[ride.status]?.includes(status)) {
    ResponseHelper.error(res, 'Invalid status transition', 400);
    return;
  }

  // Update ride status with timestamp
  ride.status = status;
  switch (status) {
    case RideStatus.PICKED_UP:
      ride.pickedUpAt = new Date();
      break;
    case RideStatus.COMPLETED:
      ride.completedAt = new Date();
      // Calculate duration
      if (ride.pickedUpAt) {
        ride.duration = Math.round((new Date().getTime() - ride.pickedUpAt.getTime()) / 60000); // in minutes
      }
      break;
  }

  await ride.save();

  // If ride is completed, update driver stats and make available
  if (status === RideStatus.COMPLETED) {
    await Driver.findOneAndUpdate(
      { userId: driverId },
      {
        status: DriverStatus.ONLINE,
        $inc: { totalRides: 1, totalEarnings: ride.fare || 0 }
      }
    );
  }

  const populatedRide = await Ride.findById(ride._id)
    .populate('riderId', 'name phone')
    .populate('driverId', 'name phone');

  // Emit status change to authorized parties
  // Emit status change to authorized parties
  if (ride.riderId) {
    emitToUser(ride.riderId.toString(), 'ride:status_change', populatedRide);
  }
  if (ride.driverId) {
    emitToUser(ride.driverId.toString(), 'ride:status_change', populatedRide);
  }

  ResponseHelper.success(res, 'Ride status updated successfully', { ride: populatedRide });
});

export const getCurrentRide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user._id;

  const ride = await Ride.findOne({
    $or: [{ riderId: userId }, { driverId: userId }],
    status: { $in: [RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT] }
  })
    .populate('riderId', 'name phone')
    .populate('driverId', 'name phone');

  if (!ride) {
    ResponseHelper.error(res, 'No active ride found', 404);
    return;
  }

  ResponseHelper.success(res, 'Current ride retrieved successfully', { ride });
});

export const rateRide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { rideId } = req.params;
  const { rating, feedback } = req.body;
  const userId = req.user._id;

  const ride = await Ride.findOne({
    _id: rideId,
    riderId: userId,
    status: RideStatus.COMPLETED
  });

  if (!ride) {
    ResponseHelper.error(res, 'Ride not found or not eligible for rating', 404);
    return;
  }

  if (ride.rating) {
    ResponseHelper.error(res, 'Ride already rated', 400);
    return;
  }

  // Update ride with rating and feedback
  ride.rating = rating;
  ride.feedback = feedback;
  await ride.save();

  // Update driver's average rating
  if (ride.driverId) {
    const driver = await Driver.findOne({ userId: ride.driverId });
    if (driver) {
      const ratedRides = await Ride.find({
        driverId: ride.driverId,
        rating: { $exists: true, $ne: null }
      });

      const totalRating = ratedRides.reduce((sum, r) => sum + (r.rating || 0), 0);
      const averageRating = totalRating / ratedRides.length;

      await Driver.findOneAndUpdate(
        { userId: ride.driverId },
        { rating: parseFloat(averageRating.toFixed(1)) }
      );
    }
  }

  ResponseHelper.success(res, 'Ride rated successfully', { ride });
});
