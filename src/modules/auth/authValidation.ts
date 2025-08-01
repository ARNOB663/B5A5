import Joi from 'joi';
import { UserRole } from '../../utils/types';

export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  phone: Joi.string().pattern(/^[+]?[1-9][\d\s-()]{7,15}$/).required().messages({
    'string.pattern.base': 'Please enter a valid phone number',
    'any.required': 'Phone number is required'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required().messages({
    'any.only': 'Role must be admin, rider, or driver',
    'any.required': 'Role is required'
  })
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const driverRegistrationValidation = Joi.object({
  licenseNumber: Joi.string().required().messages({
    'any.required': 'License number is required'
  }),
  vehicleInfo: Joi.object({
    make: Joi.string().required().messages({
      'any.required': 'Vehicle make is required'
    }),
    model: Joi.string().required().messages({
      'any.required': 'Vehicle model is required'
    }),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
      'number.min': 'Invalid vehicle year',
      'number.max': 'Invalid vehicle year',
      'any.required': 'Vehicle year is required'
    }),
    plateNumber: Joi.string().required().messages({
      'any.required': 'Plate number is required'
    }),
    color: Joi.string().required().messages({
      'any.required': 'Vehicle color is required'
    })
  }).required()
});
