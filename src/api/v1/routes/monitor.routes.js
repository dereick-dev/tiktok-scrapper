const express = require('express');
const MonitorController = require('../controllers/monitor.controller');

const router = express.Router();

// Get monitor statistics
router.get('/monitor/stats', MonitorController.getStats);

// List all monitored profiles
router.get('/monitor/list', MonitorController.listMonitors);

// Get pending notifications (for Discord bot)
router.get('/monitor/pending', MonitorController.getPendingNotifications);

// Mark notifications as sent
router.post('/monitor/mark-sent', MonitorController.markNotificationsSent);

// Add a new monitor
router.post('/monitor/add', MonitorController.addMonitor);

// Get specific monitor details
router.get('/monitor/:username', MonitorController.getMonitor);

// Update monitor settings
router.put('/monitor/:username', MonitorController.updateMonitor);

// Remove a monitor
router.delete('/monitor/:username', MonitorController.removeMonitor);

// Get new videos detected for a user
router.get('/monitor/:username/new-videos', MonitorController.getNewVideos);

// Manually trigger a check
router.post('/monitor/:username/check', MonitorController.manualCheck);

module.exports = router;