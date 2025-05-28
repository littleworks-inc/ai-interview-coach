// ==========================================
// AI Interview Coach - Validation Middleware
// ==========================================

const { body, validationResult } = require('express-validator');
const { 
  validateApiRequest, 
  extractAndValidateJobDescription 
} = require('../utils/validators');
const { 
  ERROR_MESSAGES, 
  HTTP_STATUS, 
  VALIDATION_LIMITS,
  ALLOWED_MODELS 
} = require('../utils/constants');

/**
 * Express-validator rules for API request validation
 */
const apiValidationRules = () => {
  return [
    // Validate model field
    body('model')
      .notEmpty()
      .withMessage(ERROR_MESSAGES.INVALID_MODEL)
      .isString()
      .withMessage(ERROR_MESSAGES.INVALID_MODEL)
      .isIn(ALLOWED_MODELS)
      .withMessage(ERROR_MESSAGES.INVALID_MODEL),
    
    // Validate messages array
    body('messages')
      .notEmpty()
      .withMessage('Messages are required')
      .isArray({ min: 1, max: VALIDATION_LIMITS.MESSAGES.MAX_COUNT })
      .withMessage(`Messages must be an array with 1-${VALIDATION_LIMITS.MESSAGES.MAX_COUNT} items`),
    
    // Validate each message in the array
    body('messages.*.role')
      .notEmpty()
      .withMessage('Each message must have a role')
      .isIn(['system', 'user', 'assistant'])
      .withMessage('Message role must be system, user, or assistant'),
    
    body('messages.*.content')
      .notEmpty()
      .withMessage('Each message must have content')
      .isString()
      .withMessage('Message content must be a string')
      .isLength({ max: VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH })
      .withMessage(`Message content too long (max ${VALIDATION_LIMITS.MESSAGES.MAX_MESSAGE_LENGTH} characters)`)
  ];
};

/**
 * Middleware to check express-validator results
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function checkValidationResult(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    console.log('[VALIDATION ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      errors: errorDetails
    });
    
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_REQUEST,
      code: 'VALIDATION_FAILED',
      details: errorDetails.map(err => err.message) // Only send messages, not values
    });
  }
  
  next();
}

/**
 * Advanced custom validation middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function advancedValidation(req, res, next) {
  try {
    // Use sanitized body if available, otherwise use original body
    const requestBody = req.sanitizedBody || req.body;
    
    // Validate overall request structure
    const requestValidation = validateApiRequest(requestBody);
    if (!requestValidation.isValid) {
      console.log('[ADVANCED VALIDATION ERROR]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        errors: requestValidation.errors
      });
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_REQUEST,
        code: 'REQUEST_VALIDATION_FAILED',
        details: requestValidation.errors
      });
    }
    
    // Extract and validate job description from messages
    const jobDescValidation = extractAndValidateJobDescription(requestBody.messages);
    if (!jobDescValidation.isValid) {
      console.log('[JOB DESCRIPTION VALIDATION ERROR]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        errors: jobDescValidation.errors,
        securityIssues: jobDescValidation.securityIssues
      });
      
      // Determine appropriate error message based on specific validation errors
      let errorMessage = ERROR_MESSAGES.INVALID_CONTENT;
      let errorCode = 'CONTENT_VALIDATION_FAILED';
      
      // Check for specific error types and provide appropriate messages
      const errors = jobDescValidation.errors;
      
      if (errors.some(err => err.includes('too long'))) {
        errorMessage = ERROR_MESSAGES.JOB_DESCRIPTION_TOO_LONG;
        errorCode = 'CONTENT_TOO_LONG';
      } else if (errors.some(err => err.includes('too short'))) {
        errorMessage = ERROR_MESSAGES.JOB_DESCRIPTION_TOO_SHORT;
        errorCode = 'CONTENT_TOO_SHORT';
      } else if (jobDescValidation.securityIssues && jobDescValidation.securityIssues.length > 0) {
        errorMessage = ERROR_MESSAGES.SUSPICIOUS_INPUT;
        errorCode = 'SECURITY_VALIDATION_FAILED';
      } else if (errors.some(err => err.includes('Too many lines'))) {
        errorMessage = 'Job description has too many lines. Please format it more concisely.';
        errorCode = 'TOO_MANY_LINES';
      }
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: errorMessage,
        code: errorCode
      });
    }
    
    // Store validated job description for potential use
    req.validatedJobDescription = jobDescValidation.jobDescription;
    
    console.log('[VALIDATION SUCCESS]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      jobDescriptionLength: jobDescValidation.jobDescription.length
    });
    
    next();
  } catch (error) {
    console.error('[VALIDATION MIDDLEWARE ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.PROCESSING_ERROR,
      code: 'VALIDATION_ERROR'
    });
  }
}

/**
 * Middleware to validate request size before processing
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function validateRequestSize(req, res, next) {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  
  if (contentLength > VALIDATION_LIMITS.REQUEST.MAX_SIZE_BYTES) {
    console.log('[REQUEST SIZE ERROR]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      contentLength,
      maxAllowed: VALIDATION_LIMITS.REQUEST.MAX_SIZE_BYTES
    });
    
    return res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({
      error: ERROR_MESSAGES.REQUEST_TOO_LARGE,
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: VALIDATION_LIMITS.REQUEST.MAX_SIZE_BYTES
    });
  }
  
  next();
}

/**
 * Complete validation middleware chain for /api/generate endpoint
 */
const validateGenerateRequest = [
  validateRequestSize,
  ...apiValidationRules(),
  checkValidationResult,
  advancedValidation
];

module.exports = {
  apiValidationRules,
  checkValidationResult,
  advancedValidation,
  validateRequestSize,
  validateGenerateRequest
};