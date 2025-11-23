<<<<<<< HEAD
const axios = require('axios');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { TIKTOK_BASE_URL, USER_AGENTS, DEFAULT_HEADERS } = require('../config/constants');
const { NotFoundError, TimeoutError } = require('../utils/errors');
const config = require('../config/environment');

class TikTokService {
  // ===== USER METHODS =====

  static async fetchUserProfile(username) {
    try {
      logger.info(`Fetching TikTok profile: @${username}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/@${username}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const userData = this.parseUserData(response.data, username);
      logger.success(`Profile fetched successfully: @${username}`);
      
      return userData;
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new TimeoutError();
      }
      
      if (error.response?.status === 404) {
        throw new NotFoundError(`User @${username} not found`);
      }
      
      logger.error(`Failed to fetch user @${username}`, { error: error.message });
      throw error;
    }
  }

  static parseUserData(html, username) {
    const jsonMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
    );
    
    if (!jsonMatch) {
      throw new NotFoundError('User data not found or TikTok structure changed');
    }

    try {
      const data = JSON.parse(jsonMatch[1]);
      const userDetail = data.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;

      if (!userDetail || !userDetail.user) {
        throw new NotFoundError(`User @${username} not found`);
      }

      return this.formatUserData(userDetail);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error('Failed to parse user data');
    }
  }

  static formatUserData(userDetail) {
    const { user, stats } = userDetail;

    return {
      user: {
        id: user.id,
        uniqueId: user.uniqueId,
        nickname: user.nickname,
        avatar: {
          thumb: user.avatarThumb,
          medium: user.avatarMedium,
          large: user.avatarLarger
        },
        signature: user.signature || '',
        verified: user.verified || false,
        privateAccount: user.privateAccount || false,
        region: user.region || '',
        commerceInfo: user.commerceUserInfo || {}
      },
      stats: {
        followers: stats.followerCount || 0,
        following: stats.followingCount || 0,
        likes: stats.heart || 0,
        videos: stats.videoCount || 0
      },
      url: `${TIKTOK_BASE_URL}/@${user.uniqueId}`,
      scrapedAt: new Date().toISOString()
    };
  }

  // ===== VIDEO METHODS =====

  static async fetchUserVideos(username, limit = 10, page = 1, sort = null) {
    logger.warn('fetchUserVideos: Feature not yet implemented');
    // Placeholder for future implemation
    return {
      videos: [],
      pagination: {
        page,
        limit,
        total: 0,
        hasMore: false
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchVideoById(videoId) {
    logger.warn('fetchVideoById: Feature not yet implemented');
    throw new Error('Feature not implemented');
  }

  static async fetchTrendingVideos(limit = 10, region = 'US') {
    logger.warn('fetchTrendingVideos: Feature not yet implemented');
    return {
      videos: [],
      region,
      message: 'Feature coming soon'
    };
  }

  static async searchVideos(query, limit = 10, page = 1) {
    logger.warn('searchVideos: Feature not yet implemented');
    return {
      videos: [],
      query,
      pagination: {
        page,
        limit,
        total: 0
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchVideoComments(videoId, limit = 20, cursor = null) {
    logger.warn('fetchVideoComments: Feature not yet implemented');
    return {
      comments: [],
      cursor: null,
      hasMore: false,
      message: 'Feature coming soon'
    };
  }

  // ===== HASHTAG METHODS =====

  static async fetchHashtagInfo(hashtag) {
    logger.warn('fetchHashtagInfo: Feature not yet implemented');
    throw new Error('Feature not implemented');
  }

  static async fetchHashtagVideos(hashtag, limit = 10, page = 1, sort = null) {
    logger.warn('fetchHashtagVideos: Feature not yet implemented');
    return {
      hashtag,
      videos: [],
      pagination: {
        page,
        limit,
        total: 0
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchTrendingHashtags(limit = 20, region = 'US') {
    logger.warn('fetchTrendingHashtags: Feature not yet implemented');
    return {
      hashtags: [],
      region,
      message: 'Feature coming soon'
    };
  }

  static async searchHashtags(query, limit = 10) {
    logger.warn('searchHashtags: Feature not yet implemented');
    return {
      hashtags: [],
      query,
      message: 'Feature coming soon'
    };
  }

  static async fetchRelatedHashtags(hashtag, limit = 10) {
    logger.warn('fetchRelatedHashtags: Feature not yet implemented');
    return {
      hashtag,
      related: [],
      message: 'Feature coming soon'
    };
  }

  static async compareHashtags(hashtags) {
    logger.warn('compareHashtags: Feature not yet implemented');
    return {
      comparison: hashtags.map(tag => ({
        hashtag: tag,
        views: 0,
        videos: 0,
        message: 'Feature coming soon'
      }))
    };
  }

  // ===== LEGACY METHODS (deprecated - for backward compatibility) =====

  static async searchHashtag(tag, limit = 10) {
    logger.warn('searchHashtag: Deprecated method, use fetchHashtagVideos instead');
    return this.fetchHashtagVideos(tag, limit);
  }
}

=======
const axios = require('axios');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { TIKTOK_BASE_URL, USER_AGENTS, DEFAULT_HEADERS } = require('../config/constants');
const { NotFoundError, TimeoutError } = require('../utils/errors');
const config = require('../config/environment');

class TikTokService {
  // ===== USER METHODS =====

  static async fetchUserProfile(username) {
    try {
      logger.info(`Fetching TikTok profile: @${username}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/@${username}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const userData = this.parseUserData(response.data, username);
      logger.success(`Profile fetched successfully: @${username}`);
      
      return userData;
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new TimeoutError();
      }
      
      if (error.response?.status === 404) {
        throw new NotFoundError(`User @${username} not found`);
      }
      
      logger.error(`Failed to fetch user @${username}`, { error: error.message });
      throw error;
    }
  }

  static parseUserData(html, username) {
    const jsonMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
    );
    
    if (!jsonMatch) {
      throw new NotFoundError('User data not found or TikTok structure changed');
    }

    try {
      const data = JSON.parse(jsonMatch[1]);
      const userDetail = data.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;

      if (!userDetail || !userDetail.user) {
        throw new NotFoundError(`User @${username} not found`);
      }

      return this.formatUserData(userDetail);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error('Failed to parse user data');
    }
  }

  static formatUserData(userDetail) {
    const { user, stats } = userDetail;

    return {
      user: {
        id: user.id,
        uniqueId: user.uniqueId,
        nickname: user.nickname,
        avatar: {
          thumb: user.avatarThumb,
          medium: user.avatarMedium,
          large: user.avatarLarger
        },
        signature: user.signature || '',
        verified: user.verified || false,
        privateAccount: user.privateAccount || false,
        region: user.region || '',
        commerceInfo: user.commerceUserInfo || {}
      },
      stats: {
        followers: stats.followerCount || 0,
        following: stats.followingCount || 0,
        likes: stats.heart || 0,
        videos: stats.videoCount || 0
      },
      url: `${TIKTOK_BASE_URL}/@${user.uniqueId}`,
      scrapedAt: new Date().toISOString()
    };
  }

  // ===== VIDEO METHODS =====

  static async fetchUserVideos(username, limit = 10, page = 1, sort = null) {
    logger.warn('fetchUserVideos: Feature not yet implemented');
    // Placeholder for future implemation
    return {
      videos: [],
      pagination: {
        page,
        limit,
        total: 0,
        hasMore: false
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchVideoById(videoId) {
    logger.warn('fetchVideoById: Feature not yet implemented');
    throw new Error('Feature not implemented');
  }

  static async fetchTrendingVideos(limit = 10, region = 'US') {
    logger.warn('fetchTrendingVideos: Feature not yet implemented');
    return {
      videos: [],
      region,
      message: 'Feature coming soon'
    };
  }

  static async searchVideos(query, limit = 10, page = 1) {
    logger.warn('searchVideos: Feature not yet implemented');
    return {
      videos: [],
      query,
      pagination: {
        page,
        limit,
        total: 0
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchVideoComments(videoId, limit = 20, cursor = null) {
    logger.warn('fetchVideoComments: Feature not yet implemented');
    return {
      comments: [],
      cursor: null,
      hasMore: false,
      message: 'Feature coming soon'
    };
  }

  // ===== HASHTAG METHODS =====

  static async fetchHashtagInfo(hashtag) {
    logger.warn('fetchHashtagInfo: Feature not yet implemented');
    throw new Error('Feature not implemented');
  }

  static async fetchHashtagVideos(hashtag, limit = 10, page = 1, sort = null) {
    logger.warn('fetchHashtagVideos: Feature not yet implemented');
    return {
      hashtag,
      videos: [],
      pagination: {
        page,
        limit,
        total: 0
      },
      message: 'Feature coming soon'
    };
  }

  static async fetchTrendingHashtags(limit = 20, region = 'US') {
    logger.warn('fetchTrendingHashtags: Feature not yet implemented');
    return {
      hashtags: [],
      region,
      message: 'Feature coming soon'
    };
  }

  static async searchHashtags(query, limit = 10) {
    logger.warn('searchHashtags: Feature not yet implemented');
    return {
      hashtags: [],
      query,
      message: 'Feature coming soon'
    };
  }

  static async fetchRelatedHashtags(hashtag, limit = 10) {
    logger.warn('fetchRelatedHashtags: Feature not yet implemented');
    return {
      hashtag,
      related: [],
      message: 'Feature coming soon'
    };
  }

  static async compareHashtags(hashtags) {
    logger.warn('compareHashtags: Feature not yet implemented');
    return {
      comparison: hashtags.map(tag => ({
        hashtag: tag,
        views: 0,
        videos: 0,
        message: 'Feature coming soon'
      }))
    };
  }

  // ===== LEGACY METHODS (deprecated - for backward compatibility) =====

  static async searchHashtag(tag, limit = 10) {
    logger.warn('searchHashtag: Deprecated method, use fetchHashtagVideos instead');
    return this.fetchHashtagVideos(tag, limit);
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = TikTokService;