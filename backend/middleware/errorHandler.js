// ==========================================
// AI Interview Coach - Error Handler Middleware
// ==========================================

const { ERROR_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Log error details for monitoring and debugging
 * @param {Error} error - Error object
 * @param {object} req - Express request object
 */
function logError(error, req) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode
    }
  };
  
  // Log different levels based on error type
  if (error.statusCode >= 500) {
    console.error('[SERVER ERROR]', errorLog);
  } else if (error.statusCode >= 400) {
    console.warn('[CLIENT ERROR]', errorLog);
  } else {
    console.log('[ERROR]', errorLog);
  }
}

/**
 * Sanitize error message for client response
 * @param {Error} error - Error object
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {object} - Sanitized error response
 */
function sanitizeErrorResponse(error, isDevelopment = false) {
  const response = {
    error: ERROR_MESSAGES.SERVER_ERROR,
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  };
  
  // Handle known operational errors
  if (error.isOperational) {
    response.error = error.message;
    response.code = error.code || 'OPERATIONAL_ERROR';
  }
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    response.error = ERROR_MESSAGES.INVALID_REQUEST;
    response.code = 'VALIDATION_ERROR';
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    response.error = 'Invalid JSON format in request body';
    response.code = 'INVALID_JSON';
  } else if (error.code === 'ECONNREFUSED') {
    response.error = ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    response.code = 'SERVICE_UNAVAILABLE';
  } else if (error.code === 'ETIMEDOUT') {
    response.error = 'Request timeout. Please try again.';
    response.code = 'TIMEOUT';
  }
  
  // Include stack trace in development mode only
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
    response.originalMessage = error.message;
  }
  
  return response;
}

/**
 * Handle API-specific errors (like OpenRouter API failures)
 * @param {Error} error - Error from external API
 * @returns {object} - Processed error information
 */
function handleApiError(error) {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = ERROR_MESSAGES.PROCESSING_ERROR;
  let code = 'API_ERROR';
  
  // Handle axios/HTTP errors
  if (error.response) {
    // API responded with error status
    statusCode = error.response.status;
    
    switch (statusCode) {
      case 400:
        message = 'Invalid request to AI service. Please try again.';
        code = 'AI_API_BAD_REQUEST';
        break;
      case 401:
        message = 'AI service authentication failed. Please contact support.';
        code = 'AI_API_UNAUTHORIZED';
        break;
      case 403:
        message = 'AI service access forbidden. Please contact support.';
        code = 'AI_API_FORBIDDEN';
        break;
      case 429:
        message = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
        code = 'AI_API_RATE_LIMITED';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'AI service temporarily unavailable. Please try again later.';
        code = 'AI_API_UNAVAILABLE';
        break;
      default:
        message = ERROR_MESSAGES.PROCESSING_ERROR;
        code = 'AI_API_ERROR';
    }
  } else if (error.request) {
    // Request was made but no response received
    message = 'Unable to reach AI service. Please check your connection.';
    code = 'AI_API_NO_RESPONSE';
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
  } else {
    // Something else happened
    message = ERROR_MESSAGES.PROCESSING_ERROR;
    code = 'AI_API_SETUP_ERROR';
  }
  
  return new AppError(message, statusCode, code);
}

/**
 * Main error handling middleware
 * @param {Error} error - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  // Log the error
  logError(error, req);
  
  // Determine if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (error.name === 'AxiosError' || error.response || error.request) {
    error = handleApiError(error);
  }
  
  // Set default status code if not set
  let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  
  // Ensure status code is valid
  if (statusCode < 100 || statusCode > 599) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
  
  // Generate sanitized error response
  const errorResponse = sanitizeErrorResponse(error, isDevelopment);
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Handle 404 Not Found errors
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
}

/**
 * Async error wrapper to catch errors in async route handlers
 * @param {function} fn - Async function to wrap
 * @returns {function} - Wrapped function
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
function setupGlobalErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION]', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    // Gracefully shutdown
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]', {
      timestamp: new Date().toISOString(),
      reason: reason,
      promise: promise
    });
    
    // Gracefully shutdown
    process.exit(1);
  });
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  handleApiError,
  setupGlobalErrorHandlers
};