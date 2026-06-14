/**
 * Request Validation Middleware
 *
 * Purpose:
 * Defines Joi schemas and a reusable middleware factory for validating auth request bodies.
 *
 * Workflow:
 * Auth Route -> validateRequest(schema) -> Controller -> User collection
 *
 * Used By:
 * routes/authRoutes.js.
 *
 * Dependencies:
 * Joi performs declarative payload validation and sanitization.
 *
 * Request Lifecycle:
 * Runs before registration/login controllers. Invalid payloads return 400 immediately;
 * valid payloads replace req.body with cleaned data.
 */
import Joi from 'joi';

/**
 * Joi schema for registration payloads.
 *
 * Workflow:
 * POST /api/auth/register -> validateRequest(registerSchema) -> register controller
 *
 * Inputs:
 * - Registration request body.
 *
 * Returns:
 * Validated/sanitized registration fields or Joi validation errors.
 *
 * Collections:
 * - None. Valid data is later written to users by authController.register.
 *
 * Why:
 * Keeps invalid account data from reaching the User model and registration workflow.
 */
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .min(2)
    .max(25)
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 25 characters',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .required()
    .min(2)
    .max(25)
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 25 characters',
      'any.required': 'Last name is required'
    }),

  email: Joi.string()
    .required()
    .email()
    .max(50)
    .lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email must not exceed 50 characters',
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
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits',
      'any.required': 'Phone number is required'
    })
    .label('Phone number'),
  gender: Joi.string()
    .required()
    .valid('male', 'female', 'other')
    .messages({
      'string.empty': 'Gender is required',
      'any.only': 'Gender is required',
      'any.required': 'Gender is required'
    }),
  dateOfBirth: Joi.date()
    .required()
    .less('now')
    .custom((value, helpers) => {
      // Calculate age from dateOfBirth and ensure 18+
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'date.base': 'Date of Birth is required',
      'date.less': 'Date of Birth must be a past date',
      'any.required': 'Date of Birth is required',
      'any.invalid': 'User must be at least 18 years old'
    }),
  address: Joi.string()
    .allow('', null)
    .max(200)
    .custom((value, helpers) => {
      // If address provided, it must contain at least one hyphen '-'
      if (value && value.trim() !== '') {
        if (!/-/.test(value)) {
          return helpers.error('any.invalid');
        }
      }
      return value;
    })
    .messages({
      'string.max': 'Address cannot be more than 200 characters',
      'any.invalid': 'Address must contain at least one hyphen (-)'
    })
    .optional(),
  city: Joi.string()
    .allow('', null)
    .max(50)
    .optional(),
  country: Joi.string()
    .allow('', null)
    .max(50)
    .optional()
}).unknown(false);

/**
 * Joi schema for login payloads.
 *
 * Workflow:
 * POST /api/auth/login -> validateRequest(loginSchema) -> login controller
 *
 * Inputs:
 * - Login request body.
 *
 * Returns:
 * Validated email/password or Joi validation errors.
 *
 * Collections:
 * - None. Valid credentials are later checked against users.
 *
 * Why:
 * Gives predictable error responses before password comparison begins.
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
 * Build an Express middleware that validates req.body with a Joi schema.
 *
 * Workflow:
 * Route -> validateRequest(schema) -> cleaned req.body -> Controller
 *
 * Inputs:
 * - schema: Joi object schema.
 * - req.body: incoming JSON payload.
 *
 * Returns:
 * Middleware that sends 400 on validation failure or calls next() on success.
 *
 * Collections:
 * - None. It protects later controller/database work from malformed payloads.
 *
 * Why:
 * Centralizes request validation for auth endpoints and makes controller assumptions explicit.
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
