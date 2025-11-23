<<<<<<< HEAD
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * API Key Authentication Middleware
 * Para habilitar en el futuro cuando se implementen API keys
 */
class AuthMiddleware {
  /**
   * Validate API Key from header
   */
  static validateApiKey(req, res, next) {
    // Si no hay API_KEY configurada, skip authentication
    if (!config.API_KEY) {
      logger.warn('API_KEY not configured, skipping authentication');
      return next();
    }

    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      logger.warn('API key missing', {
        ip: req.ip,
        path: req.path
      });
      
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        message: 'Please provide an API key in the X-API-Key header or api_key query parameter'
      });
    }

    if (apiKey !== config.API_KEY) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid'
      });
    }

    logger.debug('API key validated successfully');
    next();
  }

  /**
   * Optional API Key - doesn't block if missing
   * Useful for rate limiting tiers
   */
  static optionalApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (apiKey && config.API_KEY && apiKey === config.API_KEY) {
      req.authenticated = true;
      logger.debug('Authenticated request');
    } else {
      req.authenticated = false;
      logger.debug('Unauthenticated request');
    }

    next();
  }

  /**
   * Bearer Token Authentication (for future OAuth implementation)
   */
  static validateBearerToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required',
        message: 'Please provide a Bearer token in the Authorization header'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
        message: 'Format should be: Bearer {token}'
      });
    }

    const token = parts[1];

    // TODO: Implement JWT verification
    // For now, just check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Attach token to request for later use
    req.token = token;
    req.authenticated = true;

    next();
  }

  /**
   * Basic Authentication
   */
  static validateBasicAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        success: false,
        error: 'Basic authentication required',
        headers: {
          'WWW-Authenticate': 'Basic realm="TikTok API"'
        }
      });
    }

    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      // TODO: Validate against database
      // For now, use environment variables
      const validUsername = process.env.BASIC_AUTH_USER || 'admin';
      const validPassword = process.env.BASIC_AUTH_PASS || 'admin';

      if (username === validUsername && password === validPassword) {
        req.authenticated = true;
        req.user = { username };
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Invalid credentials'
      });

    } catch (error) {
      logger.error('Basic auth parsing error', { error: error.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header'
      });
    }
  }

  /**
   * Check if user has required role/permission
   * @param {Array<string>} allowedRoles - Array of allowed roles
   */
  static requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.authenticated || !req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Unauthorized access attempt', {
          user: req.user.username,
          role: userRole,
          requiredRoles: allowedRoles,
          path: req.path
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    };
  }

  /**
   * IP Whitelist Middleware
   * @param {Array<string>} allowedIPs - Array of allowed IP addresses
   */
  static ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      // Parse IP (remove IPv6 prefix if present)
      const cleanIP = clientIP.replace(/^::ffff:/, '');

      if (allowedIPs.length === 0) {
        logger.warn('IP whitelist is empty, allowing all IPs');
        return next();
      }

      if (!allowedIPs.includes(cleanIP)) {
        logger.warn('IP not in whitelist', {
          ip: cleanIP,
          path: req.path
        });

        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Your IP address is not authorized to access this API'
        });
      }

      logger.debug('IP whitelist validated', { ip: cleanIP });
      next();
    };
  }

  /**
   * Rate limit by API key
   * Different limits for authenticated vs unauthenticated users
   */
  static tieredRateLimit(req, res, next) {
    // This would work in conjunction with rate limiting middleware
    if (req.authenticated) {
      req.rateLimit = {
        max: 1000, // 1000 requests per window
        windowMs: 15 * 60 * 1000 // 15 minutes
      };
      logger.debug('Applied premium rate limit');
    } else {
      req.rateLimit = {
        max: 100, // 100 requests per window
        windowMs: 15 * 60 * 1000 // 15 minutes
      };
      logger.debug('Applied standard rate limit');
    }

    next();
  }

  /**
   * Generate API key (utility function)
   * @param {number} length - Length of API key
   * @returns {string} Generated API key
   */
  static generateApiKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';
    
    for (let i = 0; i < length; i++) {
      apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return apiKey;
  }
}

=======
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * API Key Authentication Middleware
 * Para habilitar en el futuro cuando se implementen API keys
 */
class AuthMiddleware {
  /**
   * Validate API Key from header
   */
  static validateApiKey(req, res, next) {
    // Si no hay API_KEY configurada, skip authentication
    if (!config.API_KEY) {
      logger.warn('API_KEY not configured, skipping authentication');
      return next();
    }

    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      logger.warn('API key missing', {
        ip: req.ip,
        path: req.path
      });
      
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        message: 'Please provide an API key in the X-API-Key header or api_key query parameter'
      });
    }

    if (apiKey !== config.API_KEY) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid'
      });
    }

    logger.debug('API key validated successfully');
    next();
  }

  /**
   * Optional API Key - doesn't block if missing
   * Useful for rate limiting tiers
   */
  static optionalApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (apiKey && config.API_KEY && apiKey === config.API_KEY) {
      req.authenticated = true;
      logger.debug('Authenticated request');
    } else {
      req.authenticated = false;
      logger.debug('Unauthenticated request');
    }

    next();
  }

  /**
   * Bearer Token Authentication (for future OAuth implementation)
   */
  static validateBearerToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required',
        message: 'Please provide a Bearer token in the Authorization header'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
        message: 'Format should be: Bearer {token}'
      });
    }

    const token = parts[1];

    // TODO: Implement JWT verification
    // For now, just check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Attach token to request for later use
    req.token = token;
    req.authenticated = true;

    next();
  }

  /**
   * Basic Authentication
   */
  static validateBasicAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        success: false,
        error: 'Basic authentication required',
        headers: {
          'WWW-Authenticate': 'Basic realm="TikTok API"'
        }
      });
    }

    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      // TODO: Validate against database
      // For now, use environment variables
      const validUsername = process.env.BASIC_AUTH_USER || 'admin';
      const validPassword = process.env.BASIC_AUTH_PASS || 'admin';

      if (username === validUsername && password === validPassword) {
        req.authenticated = true;
        req.user = { username };
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Invalid credentials'
      });

    } catch (error) {
      logger.error('Basic auth parsing error', { error: error.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header'
      });
    }
  }

  /**
   * Check if user has required role/permission
   * @param {Array<string>} allowedRoles - Array of allowed roles
   */
  static requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.authenticated || !req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Unauthorized access attempt', {
          user: req.user.username,
          role: userRole,
          requiredRoles: allowedRoles,
          path: req.path
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    };
  }

  /**
   * IP Whitelist Middleware
   * @param {Array<string>} allowedIPs - Array of allowed IP addresses
   */
  static ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      // Parse IP (remove IPv6 prefix if present)
      const cleanIP = clientIP.replace(/^::ffff:/, '');

      if (allowedIPs.length === 0) {
        logger.warn('IP whitelist is empty, allowing all IPs');
        return next();
      }

      if (!allowedIPs.includes(cleanIP)) {
        logger.warn('IP not in whitelist', {
          ip: cleanIP,
          path: req.path
        });

        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Your IP address is not authorized to access this API'
        });
      }

      logger.debug('IP whitelist validated', { ip: cleanIP });
      next();
    };
  }

  /**
   * Rate limit by API key
   * Different limits for authenticated vs unauthenticated users
   */
  static tieredRateLimit(req, res, next) {
    // This would work in conjunction with rate limiting middleware
    if (req.authenticated) {
      req.rateLimit = {
        max: 1000, // 1000 requests per window
        windowMs: 15 * 60 * 1000 // 15 minutes
      };
      logger.debug('Applied premium rate limit');
    } else {
      req.rateLimit = {
        max: 100, // 100 requests per window
        windowMs: 15 * 60 * 1000 // 15 minutes
      };
      logger.debug('Applied standard rate limit');
    }

    next();
  }

  /**
   * Generate API key (utility function)
   * @param {number} length - Length of API key
   * @returns {string} Generated API key
   */
  static generateApiKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';
    
    for (let i = 0; i < length; i++) {
      apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return apiKey;
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = AuthMiddleware;