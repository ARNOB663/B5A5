import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import User from './user.model';
import { UpdateProfileInput } from '../../utils/validation';
import { hashPassword } from '../../utils/password';

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const updateData: UpdateProfileInput = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      updatedAt: user.updatedAt,
    };

    return sendSuccess(res, 'Profile updated successfully', userResponse);
  } catch (error) {
    return sendError(res, 'Failed to update profile', (error as Error).message, 500);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendError(res, 'Current password is incorrect', undefined, 400);
    }

    const hashedNewPassword = await hashPassword(newPassword);
    
    user.password = hashedNewPassword;
    await user.save();

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    return sendError(res, 'Failed to change password', (error as Error).message, 500);
  }
};

export const deactivateAccount = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return sendError(res, 'User not found', undefined, 404);
    }

    return sendSuccess(res, 'Account deactivated successfully');
  } catch (error) {
    return sendError(res, 'Failed to deactivate account', (error as Error).message, 500);
  }
};
