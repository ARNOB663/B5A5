import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import User, { Driver } from '../user/user.model';
import { 
  RegisterInput, 
  LoginInput, 
  DriverRegistrationInput 
} from '../../utils/validation';

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data: RegisterInput = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { phone: data.phone }]
    });

    if (existingUser) {
      return sendError(res, 'User already exists with this email or phone', undefined, 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
    });

    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, 'User registered successfully', {
      user: userResponse,
      token,
    }, 201);
  } catch (error) {
    return sendError(res, 'Registration failed', (error as Error).message, 500);
  }
};

export const registerDriver = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data: DriverRegistrationInput = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email: data.email }, 
        { phone: data.phone },
        { licenseNumber: data.licenseNumber },
        { 'vehicleInfo.licensePlate': data.vehicleInfo.licensePlate }
      ]
    });

    if (existingUser) {
      return sendError(res, 'Driver already exists with this information', undefined, 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const driver = new Driver({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: 'driver',
      vehicleInfo: data.vehicleInfo,
      licenseNumber: data.licenseNumber,
    });

    await driver.save();

    
    const token = generateToken({
      userId: driver._id,
      email: driver.email,
      role: driver.role,
    });

    
    const driverResponse = {
      id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      role: driver.role,
      vehicleInfo: driver.vehicleInfo,
      licenseNumber: driver.licenseNumber,
      isApproved: driver.isApproved,
      isOnline: driver.isOnline,
      rating: driver.rating,
      totalRides: driver.totalRides,
      totalEarnings: driver.totalEarnings,
      isActive: driver.isActive,
      isBlocked: driver.isBlocked,
      createdAt: driver.createdAt,
    };

    return sendSuccess(res, 'Driver registered successfully. Pending approval.', {
      driver: driverResponse,
      token,
    }, 201);
  } catch (error) {
    return sendError(res, 'Driver registration failed', (error as Error).message, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password }: LoginInput = req.body;

  
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', undefined, 401);
    }

   
    if (user.isBlocked) {
      return sendError(res, 'Account has been blocked', user.blockReason, 403);
    }

    
    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', undefined, 403);
    }


    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', undefined, 401);
    }

  
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    
    let userResponse: any = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    };

    
    if (user.role === 'driver') {
      const driver = user as any;
      userResponse = {
        ...userResponse,
        vehicleInfo: driver.vehicleInfo,
        licenseNumber: driver.licenseNumber,
        isApproved: driver.isApproved,
        isOnline: driver.isOnline,
        rating: driver.rating,
        totalRides: driver.totalRides,
        totalEarnings: driver.totalEarnings,
      };
    }

    return sendSuccess(res, 'Login successful', {
      user: userResponse,
      token,
    });
  } catch (error) {
    return sendError(res, 'Login failed', (error as Error).message, 500);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    
    let userResponse: any = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

   
    if (user.role === 'driver') {
      const driver = user as any;
      userResponse = {
        ...userResponse,
        vehicleInfo: driver.vehicleInfo,
        licenseNumber: driver.licenseNumber,
        isApproved: driver.isApproved,
        isOnline: driver.isOnline,
        rating: driver.rating,
        totalRides: driver.totalRides,
        totalEarnings: driver.totalEarnings,
        approvedAt: driver.approvedAt,
      };
    }

    return sendSuccess(res, 'Profile retrieved successfully', userResponse);
  } catch (error) {
    return sendError(res, 'Failed to retrieve profile', (error as Error).message, 500);
  }
};
