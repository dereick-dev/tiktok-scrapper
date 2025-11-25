const express = require('express');
const path = require('path');
const config = require('./src/config/environment');
const corsMiddleware = require('./src/middlewares/cors.middleware');
const loggerMiddleware = require('./src/middlewares/logger.middleware');
const errorMiddleware = require('./src/middlewares/error.middleware');
const rateLimitMiddleware = require('./src/middlewares/rateLimit.middleware');
const logger = require('./src/utils/logger');
const apiV1Routes = require('./src/api/v1/routes');
const MonitorService = require('./src/services/monitor.service');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    name: 'TikTok API with Monitor',
    version: '1.0.0',
    endpoints: {
      v1: {
        user: '/api/v1/user/:username',
        videos: '/api/v1/videos/:username',
        hashtag: '/api/v1/hashtag/:tag',
        monitor: {
          add: 'POST /api/v1/monitor/add',
          list: 'GET /api/v1/monitor/list',
          pending: 'GET /api/v1/monitor/pending',
          markSent: 'POST /api/v1/monitor/mark-sent'
        }
      }
    }
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

const server = app.listen(config.PORT, async () => {
  logger.info(`Server running on port ${config.PORT}`);
  logger.info(`URL: http://localhost:${config.PORT}`);
  
  try {
    await MonitorService.initialize();
    logger.info('✓ MonitorService initialized and ready');
  } catch (error) {
    logger.error('Failed to initialize MonitorService:', error);
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await MonitorService.shutdown();
  } catch (error) {
    logger.error('Error during MonitorService shutdown:', error);
  }
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await MonitorService.shutdown();
  } catch (error) {
    logger.error('Error during MonitorService shutdown:', error);
  }
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;