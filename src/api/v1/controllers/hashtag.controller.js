<<<<<<< HEAD
const TikTokService = require('../../../services/tiktok.service');
const CommonValidator = require('../validators/common.validator');
const UserValidator = require('../validators/user.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class HashtagController {
  /**
   * Get hashtag information
   * GET /api/v1/hashtag/:tag
   */
  static async getHashtagInfo(req, res, next) {
    try {
      const { tag } = req.params;

      // Validate hashtag
      const validation = CommonValidator.validateHashtag(tag);
      if (!validation.valid) {
        throw new ValidationError(validation.error);
      }

      logger.info(`Fetching hashtag info: #${validation.hashtag}`);

      const hashtagInfo = await TikTokService.fetchHashtagInfo(validation.hashtag);

      return ResponseHandler.success(res, hashtagInfo);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get videos by hashtag
   * GET /api/v1/hashtag/:tag/videos
   */
  static async getHashtagVideos(req, res, next) {
    try {
      const { tag } = req.params;
      const { limit = 10, page = 1, sort } = req.query;

      // Validate hashtag
      const hashtagValidation = CommonValidator.validateHashtag(tag);
      if (!hashtagValidation.valid) {
        throw new ValidationError(hashtagValidation.error);
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

      logger.info(`Fetching videos for hashtag: #${hashtagValidation.hashtag}`, {
        limit: paginationValidation.limit,
        page: paginationValidation.page
      });

      const videos = await TikTokService.fetchHashtagVideos(
        hashtagValidation.hashtag,
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
   * Get trending hashtags
   * GET /api/v1/hashtags/trending
   */
  static async getTrendingHashtags(req, res, next) {
    try {
      const { limit = 20, region = 'US' } = req.query;

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      // Validate region (2-letter country code)
      if (region && !/^[A-Z]{2}$/.test(region)) {
        throw new ValidationError('Region must be a 2-letter country code (e.g., US, GB)');
      }

      logger.info('Fetching trending hashtags', { limit: limitValidation.limit, region });

      const hashtags = await TikTokService.fetchTrendingHashtags(
        limitValidation.limit,
        region
      );

      return ResponseHandler.success(res, hashtags);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search hashtags
   * GET /api/v1/hashtags/search
   */
  static async searchHashtags(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      const sanitizedQuery = CommonValidator.sanitizeString(q, 50);

      logger.info('Searching hashtags', { query: sanitizedQuery });

      const results = await TikTokService.searchHashtags(
        sanitizedQuery,
        limitValidation.limit
      );

      return ResponseHandler.success(res, results);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get related hashtags
   * GET /api/v1/hashtag/:tag/related
   */
  static async getRelatedHashtags(req, res, next) {
    try {
      const { tag } = req.params;
      const { limit = 10 } = req.query;

      // Validate hashtag
      const hashtagValidation = CommonValidator.validateHashtag(tag);
      if (!hashtagValidation.valid) {
        throw new ValidationError(hashtagValidation.error);
      }

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      logger.info(`Fetching related hashtags for: #${hashtagValidation.hashtag}`);

      const relatedHashtags = await TikTokService.fetchRelatedHashtags(
        hashtagValidation.hashtag,
        limitValidation.limit
      );

      return ResponseHandler.success(res, relatedHashtags);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Compare multiple hashtags
   * GET /api/v1/hashtags/compare
   */
  static async compareHashtags(req, res, next) {
    try {
      const { tags } = req.query;

      // Validate tags array
      const tagsValidation = CommonValidator.validateStringArray(tags, 5);
      if (!tagsValidation.valid) {
        throw new ValidationError(tagsValidation.error);
      }

      if (tagsValidation.array.length < 2) {
        throw new ValidationError('At least 2 hashtags are required for comparison');
      }

      // Validate each hashtag
      const validatedTags = [];
      for (const tag of tagsValidation.array) {
        const validation = CommonValidator.validateHashtag(tag);
        if (!validation.valid) {
          throw new ValidationError(`Invalid hashtag: ${tag}`);
        }
        validatedTags.push(validation.hashtag);
      }

      logger.info('Comparing hashtags', { tags: validatedTags });

      const comparison = await TikTokService.compareHashtags(validatedTags);

      return ResponseHandler.success(res, comparison);

    } catch (error) {
      next(error);
    }
  }
}

=======
const TikTokService = require('../../../services/tiktok.service');
const CommonValidator = require('../validators/common.validator');
const UserValidator = require('../validators/user.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class HashtagController {
  /**
   * Get hashtag information
   * GET /api/v1/hashtag/:tag
   */
  static async getHashtagInfo(req, res, next) {
    try {
      const { tag } = req.params;

      // Validate hashtag
      const validation = CommonValidator.validateHashtag(tag);
      if (!validation.valid) {
        throw new ValidationError(validation.error);
      }

      logger.info(`Fetching hashtag info: #${validation.hashtag}`);

      const hashtagInfo = await TikTokService.fetchHashtagInfo(validation.hashtag);

      return ResponseHandler.success(res, hashtagInfo);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get videos by hashtag
   * GET /api/v1/hashtag/:tag/videos
   */
  static async getHashtagVideos(req, res, next) {
    try {
      const { tag } = req.params;
      const { limit = 10, page = 1, sort } = req.query;

      // Validate hashtag
      const hashtagValidation = CommonValidator.validateHashtag(tag);
      if (!hashtagValidation.valid) {
        throw new ValidationError(hashtagValidation.error);
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

      logger.info(`Fetching videos for hashtag: #${hashtagValidation.hashtag}`, {
        limit: paginationValidation.limit,
        page: paginationValidation.page
      });

      const videos = await TikTokService.fetchHashtagVideos(
        hashtagValidation.hashtag,
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
   * Get trending hashtags
   * GET /api/v1/hashtags/trending
   */
  static async getTrendingHashtags(req, res, next) {
    try {
      const { limit = 20, region = 'US' } = req.query;

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      // Validate region (2-letter country code)
      if (region && !/^[A-Z]{2}$/.test(region)) {
        throw new ValidationError('Region must be a 2-letter country code (e.g., US, GB)');
      }

      logger.info('Fetching trending hashtags', { limit: limitValidation.limit, region });

      const hashtags = await TikTokService.fetchTrendingHashtags(
        limitValidation.limit,
        region
      );

      return ResponseHandler.success(res, hashtags);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search hashtags
   * GET /api/v1/hashtags/search
   */
  static async searchHashtags(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      const sanitizedQuery = CommonValidator.sanitizeString(q, 50);

      logger.info('Searching hashtags', { query: sanitizedQuery });

      const results = await TikTokService.searchHashtags(
        sanitizedQuery,
        limitValidation.limit
      );

      return ResponseHandler.success(res, results);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get related hashtags
   * GET /api/v1/hashtag/:tag/related
   */
  static async getRelatedHashtags(req, res, next) {
    try {
      const { tag } = req.params;
      const { limit = 10 } = req.query;

      // Validate hashtag
      const hashtagValidation = CommonValidator.validateHashtag(tag);
      if (!hashtagValidation.valid) {
        throw new ValidationError(hashtagValidation.error);
      }

      // Validate limit
      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      logger.info(`Fetching related hashtags for: #${hashtagValidation.hashtag}`);

      const relatedHashtags = await TikTokService.fetchRelatedHashtags(
        hashtagValidation.hashtag,
        limitValidation.limit
      );

      return ResponseHandler.success(res, relatedHashtags);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Compare multiple hashtags
   * GET /api/v1/hashtags/compare
   */
  static async compareHashtags(req, res, next) {
    try {
      const { tags } = req.query;

      // Validate tags array
      const tagsValidation = CommonValidator.validateStringArray(tags, 5);
      if (!tagsValidation.valid) {
        throw new ValidationError(tagsValidation.error);
      }

      if (tagsValidation.array.length < 2) {
        throw new ValidationError('At least 2 hashtags are required for comparison');
      }

      // Validate each hashtag
      const validatedTags = [];
      for (const tag of tagsValidation.array) {
        const validation = CommonValidator.validateHashtag(tag);
        if (!validation.valid) {
          throw new ValidationError(`Invalid hashtag: ${tag}`);
        }
        validatedTags.push(validation.hashtag);
      }

      logger.info('Comparing hashtags', { tags: validatedTags });

      const comparison = await TikTokService.compareHashtags(validatedTags);

      return ResponseHandler.success(res, comparison);

    } catch (error) {
      next(error);
    }
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = HashtagController;