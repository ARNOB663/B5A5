import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const roleSchema = z.enum(['admin', 'rider', 'driver']);

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  coordinates: coordinatesSchema,
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: roleSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
});

export const driverRegistrationSchema = registerSchema.extend({
  role: z.literal('driver'),
  vehicleInfo: z.object({
    make: z.string().min(1, 'Vehicle make is required'),
    model: z.string().min(1, 'Vehicle model is required'),
    year: z.number().min(1900).max(new Date().getFullYear()),
    licensePlate: z.string().min(1, 'License plate is required'),
    color: z.string().min(1, 'Vehicle color is required'),
  }),
  licenseNumber: z.string().min(1, 'License number is required'),
});

export const rideRequestSchema = z.object({
  pickupLocation: locationSchema,
  destinationLocation: locationSchema,
  rideType: z.enum(['standard', 'premium', 'shared']).default('standard'),
  scheduledTime: z.string().datetime().optional(),
});

export const rideStatusUpdateSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'picked_up', 'in_transit', 'completed']),
});

export const driverApprovalSchema = z.object({
  isApproved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export const userBlockSchema = z.object({
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DriverRegistrationInput = z.infer<typeof driverRegistrationSchema>;
export type RideRequestInput = z.infer<typeof rideRequestSchema>;
export type RideStatusUpdateInput = z.infer<typeof rideStatusUpdateSchema>;
export type DriverApprovalInput = z.infer<typeof driverApprovalSchema>;
export type UserBlockInput = z.infer<typeof userBlockSchema>;
