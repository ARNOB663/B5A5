import Joi from 'joi';
import { DriverStatus } from '../../utils/types';

export const setAvailabilityValidation = Joi.object({
  status: Joi.string().valid(...Object.values(DriverStatus)).required().messages({
    'any.only': 'Status must be online, offline, or busy',
    'any.required': 'Status is required'
  }),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required().messages({
      'number.min': 'Invalid latitude',
      'number.max': 'Invalid latitude',
      'any.required': 'Latitude is required when status is online'
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      'number.min': 'Invalid longitude',
      'number.max': 'Invalid longitude',
      'any.required': 'Longitude is required when status is online'
    })
  }).optional()
}).custom((value, helpers) => {
  // If status is online, location should be provided
  if (value.status === DriverStatus.ONLINE && !value.location) {
    return helpers.error('any.custom', { message: 'Location is required when setting status to online' });
  }
  return value;
});

export const updateLocationValidation = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Invalid latitude',
    'number.max': 'Invalid latitude',
    'any.required': 'Latitude is required'
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Invalid longitude',
    'number.max': 'Invalid longitude',
    'any.required': 'Longitude is required'
  })
});
