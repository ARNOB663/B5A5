import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'rider' | 'driver';
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDriver extends IUser {
  role: 'driver';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
  licenseNumber: string;
  isApproved: boolean;
  rejectionReason?: string;
  isOnline: boolean;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  approvedAt?: Date;
  approvedBy?: string;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'rider', 'driver'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockReason: {
    type: String,
  },
}, {
  timestamps: true,
  discriminatorKey: 'role',
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

const driverSchema = new Schema<IDriver>({
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rejectionReason: {
    type: String,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  totalRides: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: String,
  },
});

driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ 'vehicleInfo.licensePlate': 1 });
driverSchema.index({ isApproved: 1 });
driverSchema.index({ isOnline: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export const Driver = User.discriminator<IDriver>('driver', driverSchema);

export default User;
