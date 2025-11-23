const express = require('express');
const UserController = require('../controllers/user.controller');

const router = express.Router();

// Get user profile
router.get('/user/:username', UserController.getProfile);

// Get user videos (future)
router.get('/videos/:username', UserController.getVideos);

module.exports = router;