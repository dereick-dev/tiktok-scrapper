<<<<<<< HEAD
const express = require('express');
const UserController = require('../controllers/user.controller');

const router = express.Router();

// Get user profile
router.get('/user/:username', UserController.getProfile);

// Get user videos (future)
router.get('/videos/:username', UserController.getVideos);

=======
const express = require('express');
const UserController = require('../controllers/user.controller');

const router = express.Router();

// Get user profile
router.get('/user/:username', UserController.getProfile);

// Get user videos (future)
router.get('/videos/:username', UserController.getVideos);

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = router;