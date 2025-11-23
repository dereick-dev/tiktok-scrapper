const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const { RateLimitError } = require('../utils/errors');

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: config.RATE_LIMIT_WINDOW / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new RateLimitError();
  }
});

module.exports = limiter;