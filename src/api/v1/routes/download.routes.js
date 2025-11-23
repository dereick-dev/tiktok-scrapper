const express = require('express');
const DownloadController = require('../controllers/download.controller');

const router = express.Router();

// Get download info
router.get('/download/info', DownloadController.getDownloadInfo);

// Download video (proxy)
router.get('/download/video', DownloadController.downloadVideo);

module.exports = router;