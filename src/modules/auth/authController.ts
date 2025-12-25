import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User, Driver } from '../user/userModel';
import { ResponseHelper, asyncHandler } from '../../utils/response';
import { UserRole } from '../../utils/types';
import { config } from '../../config/config';

interface AuthRequest extends Request {
  user?: any;
}

const generateToken = (userId: string): string => {
  return (jwt as any).sign(
    { userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    ResponseHelper.error(res, 'User with this email or phone already exists', 400);
    return;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  // Generate token
  const token = generateToken(user._id.toString());

  // Remove password from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  };

  ResponseHelper.success(res, 'User registered successfully', {
    user: userResponse,
    token
  }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    ResponseHelper.error(res, 'Invalid email or password', 401);
    return;
  }

  if (user.isBlocked) {
    ResponseHelper.error(res, 'Account is blocked. Contact admin.', 403);
    return;
  }

  // Generate token
  const token = generateToken(user._id.toString());

  // Remove password from response
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  };

  ResponseHelper.success(res, 'Login successful', {
    user: userResponse,
    token
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  let profile: any = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt
  };

  // If user is a driver, include driver details
  if (user.role === UserRole.DRIVER) {
    const driverDetails = await Driver.findOne({ userId: user._id });
    if (driverDetails) {
      profile.driverDetails = driverDetails;
    }
  }

  ResponseHelper.success(res, 'Profile retrieved successfully', { user: profile });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    ResponseHelper.error(res, 'User not found', 404);
    return;
  }

  // Check uniqueness if email or phone is being changed
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      ResponseHelper.error(res, 'Email already in use', 400);
      return;
    }
    user.email = email;
  }

  if (phone && phone !== user.phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      ResponseHelper.error(res, 'Phone number already in use', 400);
      return;
    }
    user.phone = phone;
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  ResponseHelper.success(res, 'Profile updated successfully', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt
    }
  });
});

export const registerDriver = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { licenseNumber, vehicleInfo } = req.body;
  const userId = req.user._id;

  // Check if user is already a driver
  const existingDriver = await Driver.findOne({ userId });
  if (existingDriver) {
    ResponseHelper.error(res, 'Driver profile already exists', 400);
    return;
  }

  // Check if license number is already taken
  const existingLicense = await Driver.findOne({ licenseNumber });
  if (existingLicense) {
    ResponseHelper.error(res, 'License number already registered', 400);
    return;
  }

  // Check if plate number is already taken
  const existingPlate = await Driver.findOne({ 'vehicleInfo.plateNumber': vehicleInfo.plateNumber });
  if (existingPlate) {
    ResponseHelper.error(res, 'Plate number already registered', 400);
    return;
  }

  // Create driver profile
  const driver = await Driver.create({
    userId,
    licenseNumber,
    vehicleInfo
  });

  ResponseHelper.success(res, 'Driver registration submitted for approval', { driver }, 201);
});
