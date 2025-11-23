<<<<<<< HEAD
const logger = require('../utils/logger');
const config = require('../config/environment');
const { AppError } = require('../utils/errors');

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.errors && { errors: err.errors }),
      timestamp: new Date().toISOString()
    });
  }

  if (config.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

=======
const logger = require('../utils/logger');
const config = require('../config/environment');
const { AppError } = require('../utils/errors');

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.errors && { errors: err.errors }),
      timestamp: new Date().toISOString()
    });
  }

  if (config.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = errorMiddleware;