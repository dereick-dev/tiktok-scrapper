const express = require('express');
const path = require('path');
const config = require('./src/config/environment');
const corsMiddleware = require('./src/middlewares/cors.middleware');
const loggerMiddleware = require('./src/middlewares/logger.middleware');
const errorMiddleware = require('./src/middlewares/error.middleware');
const rateLimitMiddleware = require('./src/middlewares/rateLimit.middleware');
const logger = require('./src/utils/logger');
const apiV1Routes = require('./src/api/v1/routes');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'TikTok API',
    version: config.VERSION,
    status: 'online',
    endpoints: {
      v1: {
        user: '/api/v1/user/:username',
        videos: '/api/v1/videos/:username',
        hashtag: '/api/v1/hashtag/:tag'
      }
    },
    documentation: '/docs',
    health: '/health'
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV
  });
});

app.use('/api/v1', apiV1Routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.use(errorMiddleware);

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
  logger.info(`URL: http://localhost:${config.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;