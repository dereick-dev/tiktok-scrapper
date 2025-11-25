const MonitorService = require('../../../services/monitor.service');
const UserValidator = require('../validators/user.validator');
const CommonValidator = require('../validators/common.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class MonitorController {
  /**
   * Add a user profile to monitor
   * POST /api/v1/monitor/add
   */
  static async addMonitor(req, res, next) {
    try {
      const { username, checkInterval = 300000, notificationEmail, discordGuildId, discordChannelId } = req.body;

      // Validate username
      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      // Validate check interval (min 5 minutes, max 24 hours)
      const interval = parseInt(checkInterval);
      if (isNaN(interval) || interval < 300000 || interval > 86400000) {
        throw new ValidationError('Check interval must be between 5 minutes (300000ms) and 24 hours (86400000ms)');
      }

      // Validate email if provided
      if (notificationEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(notificationEmail)) {
          throw new ValidationError('Invalid email format');
        }
      }

      logger.info(`Adding monitor for user: @${userValidation.username}`);

      const monitor = await MonitorService.addMonitor({
        username: userValidation.username,
        checkInterval: interval,
        notificationEmail,
        discordGuildId,
        discordChannelId
      });

      return ResponseHandler.success(res, monitor, 'Monitor added successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a user profile from monitoring
   * DELETE /api/v1/monitor/:username
   */
  static async removeMonitor(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      logger.info(`Removing monitor for user: @${userValidation.username}`);

      const result = await MonitorService.removeMonitor(userValidation.username);

      return ResponseHandler.success(res, result, 'Monitor removed successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all monitored profiles
   * GET /api/v1/monitor/list
   */
  static async listMonitors(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching all monitored profiles');

      let monitors = await MonitorService.listMonitors();

      // Filter by guild if provided
      if (guildId) {
        monitors = monitors.filter(m => m.discordGuildId === guildId);
      }

      return ResponseHandler.success(res, monitors);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get details of a specific monitor
   * GET /api/v1/monitor/:username
   */
  static async getMonitor(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      logger.info(`Fetching monitor details for: @${userValidation.username}`);

      const monitor = await MonitorService.getMonitor(userValidation.username);

      return ResponseHandler.success(res, monitor);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get new videos detected by monitor
   * GET /api/v1/monitor/:username/new-videos
   */
  static async getNewVideos(req, res, next) {
    try {
      const { username } = req.params;
      const { limit = 10 } = req.query;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      logger.info(`Fetching new videos for monitored user: @${userValidation.username}`);

      const newVideos = await MonitorService.getNewVideos(
        userValidation.username,
        limitValidation.limit
      );

      return ResponseHandler.success(res, newVideos);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger a check for a monitored profile
   * POST /api/v1/monitor/:username/check
   */
  static async manualCheck(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      logger.info(`Manual check triggered for: @${userValidation.username}`);

      const result = await MonitorService.checkForNewVideos(userValidation.username);

      return ResponseHandler.success(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update monitor settings
   * PUT /api/v1/monitor/:username
   */
  static async updateMonitor(req, res, next) {
    try {
      const { username } = req.params;
      const { checkInterval, notificationEmail, enabled, discordChannelId } = req.body;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      const updates = {};

      if (checkInterval !== undefined) {
        const interval = parseInt(checkInterval);
        if (isNaN(interval) || interval < 300000 || interval > 86400000) {
          throw new ValidationError('Check interval must be between 5 minutes and 24 hours');
        }
        updates.checkInterval = interval;
      }

      if (notificationEmail !== undefined) {
        if (notificationEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(notificationEmail)) {
            throw new ValidationError('Invalid email format');
          }
        }
        updates.notificationEmail = notificationEmail;
      }

      if (enabled !== undefined) {
        updates.enabled = CommonValidator.validateBoolean(enabled);
      }

      if (discordChannelId !== undefined) {
        updates.discordChannelId = discordChannelId;
      }

      logger.info(`Updating monitor for: @${userValidation.username}`);

      const monitor = await MonitorService.updateMonitor(userValidation.username, updates);

      return ResponseHandler.success(res, monitor, 'Monitor updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monitor statistics
   * GET /api/v1/monitor/stats
   */
  static async getStats(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching monitor statistics');

      const stats = await MonitorService.getStats(guildId);

      return ResponseHandler.success(res, stats);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending notifications (for Discord bot to poll)
   * GET /api/v1/monitor/pending
   */
  static async getPendingNotifications(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching pending notifications');

      const pending = await MonitorService.getPendingNotifications(guildId);

      return ResponseHandler.success(res, pending);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notifications as sent
   * POST /api/v1/monitor/mark-sent
   */
  static async markNotificationsSent(req, res, next) {
    try {
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds)) {
        throw new ValidationError('notificationIds must be an array');
      }

      logger.info(`Marking ${notificationIds.length} notifications as sent`);

      await MonitorService.markNotificationsSent(notificationIds);

      return ResponseHandler.success(res, { marked: notificationIds.length });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = MonitorController;