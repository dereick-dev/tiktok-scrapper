const express = require('express');
const VideoController = require('../controllers/video.controller');

const router = express.Router();

// Get user videos
router.get('/videos/:username', VideoController.getUserVideos);

// Get video by ID
router.get('/video/:videoId', VideoController.getVideoById);

// Get video comments
router.get('/video/:videoId/comments', VideoController.getVideoComments);

// Get trending videos
router.get('/videos/trending', VideoController.getTrendingVideos);

// Search videos
router.get('/videos/search', VideoController.searchVideos);

module.exports = router;