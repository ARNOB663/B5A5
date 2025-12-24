import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, DriverStatus, DriverApprovalStatus } from '../../utils/types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IDriver extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  licenseNumber: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color: string;
  };
  approvalStatus: DriverApprovalStatus;
  status: DriverStatus;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'Role is required']
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const driverSchema = new Schema<IDriver>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  vehicleInfo: {
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [1900, 'Invalid vehicle year'],
      max: [new Date().getFullYear() + 1, 'Invalid vehicle year']
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Vehicle color is required'],
      trim: true
    }
  },
  approvalStatus: {
    type: String,
    enum: Object.values(DriverApprovalStatus),
    default: DriverApprovalStatus.PENDING
  },
  status: {
    type: String,
    enum: Object.values(DriverStatus),
    default: DriverStatus.OFFLINE
  },
  rating: {
    type: Number,
    default: 5.0,
    min: [1, 'Rating cannot be less than 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  totalRides: {
    type: Number,
    default: 0,
    min: [0, 'Total rides cannot be negative']
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Total earnings cannot be negative']
  },
  currentLocation: {
    latitude: {
      type: Number,
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
// Note: unique indexes are declared on the fields above (e.g., `unique: true`).
// Avoid duplicate index definitions to prevent Mongoose warnings.
driverSchema.index({ approvalStatus: 1 });
driverSchema.index({ status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export const Driver = mongoose.model<IDriver>('Driver', driverSchema);
