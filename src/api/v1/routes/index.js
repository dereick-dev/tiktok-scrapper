const express = require('express');
const userRoutes = require('./user.routes');
const videoRoutes = require('./video.routes');
const hashtagRoutes = require('./hashtag.routes');
const downloadRoutes = require('./download.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    version: 'v1',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/', userRoutes);
router.use('/', videoRoutes);
router.use('/', hashtagRoutes);
router.use('/', downloadRoutes);

module.exports = router;