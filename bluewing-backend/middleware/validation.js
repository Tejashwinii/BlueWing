import Joi from 'joi';

/**
 * Register Validation Schema
 * Validates all required fields for user registration
 */
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 50 characters',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 50 characters',
      'any.required': 'Last name is required'
    }),

  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required'
    }),

  phone: Joi.string()
    .required()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number',
      'any.required': 'Phone number is required'
    })
}).unknown(false);

/**
 * Login Validation Schema
 * Validates email and password for user login
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
}).unknown(false);

/**
 * Middleware function that validates request body against provided schema
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @returns {Function} Middleware function
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      // If validation fails, return 400 with error messages
      if (error) {
        const messages = error.details.map(detail => detail.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages
        });
      }

      // Replace req.body with validated/cleaned value
      req.body = value;

      // Call next middleware
      next();
    } catch (err) {
      console.error('❌ Validation error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

/**
 * Custom validation middleware for specific schema
 * Usage: app.post('/register', validateRequest(registerSchema), registerController)
 */
export default validateRequest;
