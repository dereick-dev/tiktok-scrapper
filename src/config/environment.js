require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8000,
  VERSION: '2.0.0',
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // API Keys (si se necesitan en el futuro)
  API_KEY: process.env.API_KEY || null,
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Cache
  CACHE_ENABLED: process.env.CACHE_ENABLED === 'true',
  CACHE_TTL: 300 // 5 minutes
};