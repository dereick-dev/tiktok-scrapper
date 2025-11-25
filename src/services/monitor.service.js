const fs = require('fs').promises;
const path = require('path');
const TikTokService = require('./tiktok.service');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

class MonitorService {
  constructor() {
    this.monitors = new Map();
    this.intervals = new Map();
    this.dataPath = path.join(__dirname, '../data/monitors.json');
    this.newVideosPath = path.join(__dirname, '../data/new-videos.json');
    this.pendingNotificationsPath = path.join(__dirname, '../data/pending-notifications.json');
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });
      await this.loadMonitors();
      
      for (const [username, monitor] of this.monitors) {
        if (monitor.enabled) {
          this.startMonitoring(username);
        }
      }

      this.initialized = true;
      logger.info('MonitorService initialized');
    } catch (error) {
      logger.error('Failed to initialize MonitorService:', error);
    }
  }

  async loadMonitors() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const monitorsArray = JSON.parse(data);
      this.monitors = new Map(monitorsArray.map(m => [m.username, m]));
      logger.info(`Loaded ${this.monitors.size} monitors from disk`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No existing monitors file found, starting fresh');
        this.monitors = new Map();
      } else {
        logger.error('Error loading monitors:', error);
        this.monitors = new Map();
      }
    }
  }

  async saveMonitors() {
    try {
      const monitorsArray = Array.from(this.monitors.values());
      await fs.writeFile(this.dataPath, JSON.stringify(monitorsArray, null, 2), 'utf8');
    } catch (error) {
      logger.error('Error saving monitors:', error);
      throw error;
    }
  }

  async loadNewVideos() {
    try {
      const data = await fs.readFile(this.newVideosPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return {};
      throw error;
    }
  }

  async saveNewVideos(newVideos) {
    try {
      await fs.writeFile(this.newVideosPath, JSON.stringify(newVideos, null, 2), 'utf8');
    } catch (error) {
      logger.error('Error saving new videos:', error);
    }
  }

  async loadPendingNotifications() {
    try {
      const data = await fs.readFile(this.pendingNotificationsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async savePendingNotifications(notifications) {
    try {
      await fs.writeFile(this.pendingNotificationsPath, JSON.stringify(notifications, null, 2), 'utf8');
    } catch (error) {
      logger.error('Error saving pending notifications:', error);
    }
  }

  async addMonitor({ username, checkInterval, notificationEmail, discordGuildId, discordChannelId }) {
    await this.initialize();

    if (this.monitors.has(username)) {
      throw new Error(`Monitor for @${username} already exists`);
    }

    const profile = await TikTokService.fetchUserProfile(username);

    const monitor = {
      username,
      checkInterval,
      notificationEmail: notificationEmail || null,
      discordGuildId: discordGuildId || null,
      discordChannelId: discordChannelId || null,
      enabled: true,
      createdAt: new Date().toISOString(),
      lastCheck: null,
      lastVideoCount: profile.videoCount || 0,
      lastVideoId: null,
      checksPerformed: 0,
      newVideosDetected: 0
    };

    this.monitors.set(username, monitor);
    await this.saveMonitors();
    this.startMonitoring(username);

    logger.info(`Monitor added for @${username}`);
    return monitor;
  }

  async removeMonitor(username) {
    await this.initialize();

    if (!this.monitors.has(username)) {
      throw new NotFoundError(`Monitor for @${username} not found`);
    }

    this.stopMonitoring(username);
    this.monitors.delete(username);
    await this.saveMonitors();

    logger.info(`Monitor removed for @${username}`);
    return { success: true, message: `Monitor for @${username} removed` };
  }

  startMonitoring(username) {
    const monitor = this.monitors.get(username);
    if (!monitor) return;

    this.stopMonitoring(username);

    const intervalId = setInterval(async () => {
      try {
        await this.checkForNewVideos(username);
      } catch (error) {
        logger.error(`Error checking @${username}:`, error);
      }
    }, monitor.checkInterval);

    this.intervals.set(username, intervalId);
    logger.info(`Started monitoring @${username} (interval: ${monitor.checkInterval}ms)`);
  }

  stopMonitoring(username) {
    const intervalId = this.intervals.get(username);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(username);
      logger.info(`Stopped monitoring @${username}`);
    }
  }

  async checkForNewVideos(username) {
    const monitor = this.monitors.get(username);
    if (!monitor) {
      throw new NotFoundError(`Monitor for @${username} not found`);
    }

    logger.info(`Checking for new videos: @${username}`);

    try {
      const videos = await TikTokService.fetchUserVideos(username, 10);
      
      const now = new Date().toISOString();
      monitor.lastCheck = now;
      monitor.checksPerformed++;

      if (!videos || !videos.data || videos.data.length === 0) {
        await this.saveMonitors();
        return { username, newVideos: [], lastCheck: now };
      }

      const latestVideo = videos.data[0];
      const newVideos = [];

      if (monitor.lastVideoId) {
        for (const video of videos.data) {
          if (video.id === monitor.lastVideoId) break;
          newVideos.push(video);
        }
      } else {
        logger.info(`First check for @${username}, setting baseline`);
      }

      monitor.lastVideoId = latestVideo.id;
      monitor.lastVideoCount = videos.data.length;

      if (newVideos.length > 0) {
        monitor.newVideosDetected += newVideos.length;
        await this.saveNewVideosData(username, newVideos);
        
        logger.info(`🎉 Detected ${newVideos.length} new video(s) from @${username}`);
        
        // Add to pending notifications
        await this.addPendingNotifications(monitor, newVideos);
        
        // Send email if configured
        if (monitor.notificationEmail) {
          await this.sendEmailNotification(monitor, newVideos);
        }
      }

      await this.saveMonitors();

      return { username, newVideos, totalNewVideos: newVideos.length, lastCheck: now };

    } catch (error) {
      logger.error(`Error checking videos for @${username}:`, error);
      throw error;
    }
  }

  async saveNewVideosData(username, videos) {
    const allNewVideos = await this.loadNewVideos();
    
    if (!allNewVideos[username]) {
      allNewVideos[username] = [];
    }

    const videosWithTimestamp = videos.map(video => ({
      ...video,
      detectedAt: new Date().toISOString()
    }));

    allNewVideos[username] = [...videosWithTimestamp, ...allNewVideos[username]].slice(0, 100);
    await this.saveNewVideos(allNewVideos);
  }

  async addPendingNotifications(monitor, newVideos) {
    const pending = await this.loadPendingNotifications();

    for (const video of newVideos) {
      const notification = {
        id: `${monitor.username}_${video.id}_${Date.now()}`,
        username: monitor.username,
        guildId: monitor.discordGuildId,
        channelId: monitor.discordChannelId,
        video: video,
        createdAt: new Date().toISOString(),
        sent: false
      };

      pending.push(notification);
    }

    await this.savePendingNotifications(pending);
    logger.info(`Added ${newVideos.length} pending notification(s) for @${monitor.username}`);
  }

  async getPendingNotifications(guildId = null) {
    const pending = await this.loadPendingNotifications();
    
    let notifications = pending.filter(n => !n.sent);

    if (guildId) {
      notifications = notifications.filter(n => n.guildId === guildId);
    }

    return notifications;
  }

  async markNotificationsSent(notificationIds) {
    const pending = await this.loadPendingNotifications();

    for (const notification of pending) {
      if (notificationIds.includes(notification.id)) {
        notification.sent = true;
        notification.sentAt = new Date().toISOString();
      }
    }

    await this.savePendingNotifications(pending);
    logger.info(`Marked ${notificationIds.length} notification(s) as sent`);
  }

  async sendEmailNotification(monitor, newVideos) {
    logger.info(`📧 Email notification would be sent to: ${monitor.notificationEmail}`);
    logger.info(`New videos from @${monitor.username}:`, newVideos.map(v => v.title || v.id));
  }

  formatNumber(num) {
    if (!num) return '0';
    const number = parseInt(num);
    if (isNaN(number)) return '0';
    if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  }

  async listMonitors() {
    await this.initialize();
    return Array.from(this.monitors.values());
  }

  async getMonitor(username) {
    await this.initialize();
    
    const monitor = this.monitors.get(username);
    if (!monitor) {
      throw new NotFoundError(`Monitor for @${username} not found`);
    }
    return monitor;
  }

  async getNewVideos(username, limit = 10) {
    await this.initialize();
    const allNewVideos = await this.loadNewVideos();
    const userVideos = allNewVideos[username] || [];
    return { username, newVideos: userVideos.slice(0, limit), total: userVideos.length };
  }

  async updateMonitor(username, updates) {
    await this.initialize();

    const monitor = this.monitors.get(username);
    if (!monitor) {
      throw new NotFoundError(`Monitor for @${username} not found`);
    }

    if (updates.checkInterval !== undefined) {
      monitor.checkInterval = updates.checkInterval;
      if (monitor.enabled) this.startMonitoring(username);
    }

    if (updates.notificationEmail !== undefined) {
      monitor.notificationEmail = updates.notificationEmail;
    }

    if (updates.discordChannelId !== undefined) {
      monitor.discordChannelId = updates.discordChannelId;
    }

    if (updates.enabled !== undefined) {
      monitor.enabled = updates.enabled;
      if (updates.enabled) {
        this.startMonitoring(username);
      } else {
        this.stopMonitoring(username);
      }
    }

    monitor.updatedAt = new Date().toISOString();
    await this.saveMonitors();
    return monitor;
  }

  async getStats(guildId = null) {
    await this.initialize();
    let monitors = Array.from(this.monitors.values());

    if (guildId) {
      monitors = monitors.filter(m => m.discordGuildId === guildId);
    }

    const activeMonitors = monitors.filter(m => m.enabled);
    const allNewVideos = await this.loadNewVideos();

    return {
      totalMonitors: monitors.length,
      activeMonitors: activeMonitors.length,
      inactiveMonitors: monitors.length - activeMonitors.length,
      totalChecksPerformed: monitors.reduce((sum, m) => sum + m.checksPerformed, 0),
      totalNewVideosDetected: monitors.reduce((sum, m) => sum + m.newVideosDetected, 0),
      monitoredUsers: monitors.map(m => ({
        username: m.username,
        enabled: m.enabled,
        checksPerformed: m.checksPerformed,
        newVideosDetected: m.newVideosDetected,
        lastCheck: m.lastCheck,
        channelId: m.discordChannelId
      })),
      newVideosCount: Object.keys(allNewVideos).reduce(
        (sum, username) => sum + (allNewVideos[username]?.length || 0), 0
      )
    };
  }

  async shutdown() {
    logger.info('Shutting down MonitorService...');
    for (const username of this.intervals.keys()) {
      this.stopMonitoring(username);
    }
    await this.saveMonitors();
    logger.info('MonitorService shutdown complete');
  }
}

module.exports = new MonitorService();