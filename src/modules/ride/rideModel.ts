import mongoose, { Document, Schema } from 'mongoose';
import { RideStatus, Location } from '../../utils/types';

export interface IRide extends Document {
  _id: mongoose.Types.ObjectId;
  riderId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  pickupLocation: Location;
  destination: Location;
  status: RideStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  fare?: number;
  distance?: number;
  duration?: number;
  rating?: number;
  feedback?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Invalid latitude'],
    max: [90, 'Invalid latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Invalid longitude'],
    max: [180, 'Invalid longitude']
  }
}, { _id: false });

const rideSchema = new Schema<IRide>({
  riderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Rider ID is required']
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupLocation: {
    type: locationSchema,
    required: [true, 'Pickup location is required']
  },
  destination: {
    type: locationSchema,
    required: [true, 'Destination is required']
  },
  status: {
    type: String,
    enum: Object.values(RideStatus),
    default: RideStatus.REQUESTED
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  fare: {
    type: Number,
    min: [0, 'Fare cannot be negative']
  },
  distance: {
    type: Number,
    min: [0, 'Distance cannot be negative']
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  rating: {
    type: Number,
    min: [1, 'Rating cannot be less than 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
rideSchema.index({ riderId: 1 });
rideSchema.index({ driverId: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ requestedAt: -1 });
rideSchema.index({ 'pickupLocation.latitude': 1, 'pickupLocation.longitude': 1 });

export const Ride = mongoose.model<IRide>('Ride', rideSchema);
