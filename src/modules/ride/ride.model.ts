import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface IRide extends Document {
  _id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: ILocation;
  destinationLocation: ILocation;
  rideType: 'standard' | 'premium' | 'shared';
  status: 'requested' | 'accepted' | 'rejected' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  inTransitAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  scheduledTime?: Date;
  estimatedFare?: number;
  actualFare?: number;
  distance?: number; // in kilometers
  duration?: number; // in minutes
  cancellationReason?: string;
  cancelledBy?: 'rider' | 'driver' | 'admin';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  riderRating?: number;
  driverRating?: number;
  riderFeedback?: string;
  driverFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>({
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
});

const rideSchema = new Schema<IRide>({
  riderId: {
    type: String,
    required: true,
    ref: 'User',
  },
  driverId: {
    type: String,
    ref: 'User',
  },
  pickupLocation: {
    type: locationSchema,
    required: true,
  },
  destinationLocation: {
    type: locationSchema,
    required: true,
  },
  rideType: {
    type: String,
    enum: ['standard', 'premium', 'shared'],
    default: 'standard',
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'picked_up', 'in_transit', 'completed', 'cancelled'],
    default: 'requested',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date,
  },
  pickedUpAt: {
    type: Date,
  },
  inTransitAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  scheduledTime: {
    type: Date,
  },
  estimatedFare: {
    type: Number,
    min: 0,
  },
  actualFare: {
    type: Number,
    min: 0,
  },
  distance: {
    type: Number,
    min: 0,
  },
  duration: {
    type: Number,
    min: 0,
  },
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: String,
    enum: ['rider', 'driver', 'admin'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  riderRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  driverRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  riderFeedback: {
    type: String,
  },
  driverFeedback: {
    type: String,
  },
}, {
  timestamps: true,
});

rideSchema.index({ riderId: 1 });
rideSchema.index({ driverId: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ requestedAt: -1 });
rideSchema.index({ riderId: 1, status: 1 });
rideSchema.index({ driverId: 1, status: 1 });
rideSchema.index({ status: 1, requestedAt: -1 });

rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'destinationLocation.coordinates': '2dsphere' });

export const Ride = mongoose.model<IRide>('Ride', rideSchema);
export default Ride;
