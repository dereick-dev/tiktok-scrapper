const TikTokService = require('../../../services/tiktok.service');
const UserValidator = require('../validators/user.validator');
const CommonValidator = require('../validators/common.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class VideoController {
  /**
   * Get videos from a user
   * GET /api/v1/videos/:username
   */
  static async getUserVideos(req, res, next) {
    try {
      const { username } = req.params;
      const { limit = 10, page = 1, sort } = req.query;

      // Validate username
      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      // Validate pagination
      const paginationValidation = CommonValidator.validatePagination(page, limit);
      if (!paginationValidation.valid) {
        throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
      }

      // Validate sort
      const sortValidation = CommonValidator.validateSort(sort, ['date', 'likes', 'views']);
      if (!sortValidation.valid) {
        throw new ValidationError(sortValidation.error);
      }

      logger.info(`Fetching videos for @${userValidation.username}`, {
        limit: paginationValidation.limit,
        page: paginationValidation.page
      });

      const videos = await TikTokService.fetchUserVideos(
        userValidation.username,
        paginationValidation.limit,
        paginationValidation.page,
        sortValidation.sort
      );

      return ResponseHandler.success(res, videos);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get video details by ID
   * GET /api/v1/video/:videoId
   */
  static async getVideoById(req, res, next) {
    try {
      const { videoId } = req.params;

      // Validate video ID
      const validation = CommonValidator.validateVideoId(videoId);
      if (!validation.valid) {
        throw new ValidationError(validation.error);
      }

      logger.info(`Fetching video details: ${videoId}`);

      const video = await TikTokService.fetchVideoById(validation.videoId);

      return ResponseHandler.success(res, video);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending videos
   * GET /api/v1/videos/trending
   */
  static async getTrendingVideos(req, res, next) {
    try {
      const { limit = 10, region = 'US' } = req.query;

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      logger.info('Fetching trending videos', { limit: limitValidation.limit, region });

      const videos = await TikTokService.fetchTrendingVideos(
        limitValidation.limit,
        region
      );

      return ResponseHandler.success(res, videos);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search videos by keyword
   * GET /api/v1/videos/search
   */
  static async searchVideos(req, res, next) {
    try {
      const { q, limit = 10, page = 1 } = req.query;

      if (!q || q.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      // Validate pagination
      const paginationValidation = CommonValidator.validatePagination(page, limit);
      if (!paginationValidation.valid) {
        throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
      }

      const sanitizedQuery = CommonValidator.sanitizeString(q, 100);

      logger.info('Searching videos', { query: sanitizedQuery });

      const results = await TikTokService.searchVideos(
        sanitizedQuery,
        paginationValidation.limit,
        paginationValidation.page
      );

      return ResponseHandler.success(res, results);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get video comments
   * GET /api/v1/video/:videoId/comments
   */
  static async getVideoComments(req, res, next) {
    try {
      const { videoId } = req.params;
      const { limit = 20, cursor } = req.query;

      // Validate video ID
      const videoValidation = CommonValidator.validateVideoId(videoId);
      if (!videoValidation.valid) {
        throw new ValidationError(videoValidation.error);
      }

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      logger.info(`Fetching comments for video: ${videoId}`);

      const comments = await TikTokService.fetchVideoComments(
        videoValidation.videoId,
        limitValidation.limit,
        cursor
      );

      return ResponseHandler.success(res, comments);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = VideoController;