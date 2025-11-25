const MonitorService = require('../../../services/monitor.service');
const UserValidator = require('../validators/user.validator');
const CommonValidator = require('../validators/common.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class MonitorController {
  static async addMonitor(req, res, next) {
    try {
      const { username, checkInterval = 300000, notificationEmail, discordGuildId, discordChannelId } = req.body;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

      const interval = parseInt(checkInterval);
      if (isNaN(interval) || interval < 300000 || interval > 86400000) {
        throw new ValidationError('Check interval must be between 5 minutes (300000ms) and 24 hours (86400000ms)');
      }

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

      return ResponseHandler.success(res, 201, 'Monitor added successfully', monitor);
    } catch (error) {
      next(error);
    }
  }

  static async removeMonitor(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

      logger.info(`Removing monitor for user: @${userValidation.username}`);

      const result = await MonitorService.removeMonitor(userValidation.username);

      return ResponseHandler.success(res, 200, 'Monitor removed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async listMonitors(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching all monitored profiles');

      let monitors = await MonitorService.listMonitors();

      if (guildId) {
        monitors = monitors.filter(m => m.discordGuildId === guildId);
      }

      return ResponseHandler.success(res, 200, 'OK', monitors);
    } catch (error) {
      next(error);
    }
  }

  static async getMonitor(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

      logger.info(`Fetching monitor details for: @${userValidation.username}`);

      const monitor = await MonitorService.getMonitor(userValidation.username);

      return ResponseHandler.success(res, 200, 'OK', monitor);
    } catch (error) {
      next(error);
    }
  }

  static async getNewVideos(req, res, next) {
    try {
      const { username } = req.params;
      const { limit = 10 } = req.query;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) throw new ValidationError(limitValidation.error);

      logger.info(`Fetching new videos for monitored user: @${userValidation.username}`);

      const newVideos = await MonitorService.getNewVideos(
        userValidation.username,
        limitValidation.limit
      );

      return ResponseHandler.success(res, 200, 'OK', newVideos);
    } catch (error) {
      next(error);
    }
  }

  static async manualCheck(req, res, next) {
    try {
      const { username } = req.params;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

      logger.info(`Manual check triggered for: @${userValidation.username}`);

      const result = await MonitorService.checkForNewVideos(userValidation.username);

      return ResponseHandler.success(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateMonitor(req, res, next) {
    try {
      const { username } = req.params;
      const { checkInterval, notificationEmail, enabled, discordChannelId } = req.body;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) throw new ValidationError(userValidation.error);

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

      return ResponseHandler.success(res, 200, 'Monitor updated successfully', monitor);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching monitor statistics');

      const stats = await MonitorService.getStats(guildId);

      return ResponseHandler.success(res, 200, 'OK', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getPendingNotifications(req, res, next) {
    try {
      const { guildId } = req.query;

      logger.info('Fetching pending notifications');

      const pending = await MonitorService.getPendingNotifications(guildId);

      return ResponseHandler.success(res, 200, 'OK', pending);
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationsSent(req, res, next) {
    try {
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds)) {
        throw new ValidationError('notificationIds must be an array');
      }

      logger.info(`Marking ${notificationIds.length} notifications as sent`);

      await MonitorService.markNotificationsSent(notificationIds);

      return ResponseHandler.success(res, 200, 'OK', { marked: notificationIds.length });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MonitorController;
