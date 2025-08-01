import Joi from 'joi';

const locationValidation = Joi.object({
  address: Joi.string().required().messages({
    'any.required': 'Address is required'
  }),
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

export const requestRideValidation = Joi.object({
  pickupLocation: locationValidation.required().messages({
    'any.required': 'Pickup location is required'
  }),
  destination: locationValidation.required().messages({
    'any.required': 'Destination is required'
  })
});

export const updateRideStatusValidation = Joi.object({
  status: Joi.string().valid('accepted', 'picked_up', 'in_transit', 'completed').required().messages({
    'any.only': 'Invalid status',
    'any.required': 'Status is required'
  })
});

export const cancelRideValidation = Joi.object({
  reason: Joi.string().max(200).optional().messages({
    'string.max': 'Reason cannot exceed 200 characters'
  })
});

export const rateRideValidation = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating cannot be less than 1',
    'number.max': 'Rating cannot be more than 5',
    'any.required': 'Rating is required'
  }),
  feedback: Joi.string().max(500).optional().messages({
    'string.max': 'Feedback cannot exceed 500 characters'
  })
});
