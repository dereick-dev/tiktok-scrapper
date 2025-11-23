const express = require('express');
const VideoController = require('../controllers/video.controller');

const router = express.Router();

// Trending videos - DEBE ESTAR ANTES de /:username
router.get('/videos/trending', VideoController.getTrendingVideos);

// Search videos - DEBE ESTAR ANTES de /:username
router.get('/videos/search', VideoController.searchVideos);

// Get user videos
router.get('/videos/:username', VideoController.getUserVideos);

// Get video by ID
router.get('/video/:videoId', VideoController.getVideoById);

// Get video comments
router.get('/video/:videoId/comments', VideoController.getVideoComments);

module.exports = router;