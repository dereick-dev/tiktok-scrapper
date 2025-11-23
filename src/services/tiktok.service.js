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
    try {
      logger.info(`Fetching videos for user: @${username}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/@${username}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const videos = this.parseUserVideos(response.data, username, limit);
      
      return {
        videos,
        pagination: {
          page,
          limit,
          total: videos.length,
          hasMore: videos.length >= limit
        }
      };
    } catch (error) {
      logger.error(`Error fetching videos for @${username}:`, error);
      throw error;
    }
  }

  static parseUserVideos(html, username, limit = 10) {
    try {
      const jsonMatch = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
      );

      if (!jsonMatch) {
        return [];
      }

      const data = JSON.parse(jsonMatch[1]);
      const videoList = data.__DEFAULT_SCOPE__?.['webapp.user-detail']?.itemList || [];

      return videoList.slice(0, limit).map(video => ({
        id: video.id,
        title: video.desc || '',
        description: video.desc || '',
        url: `https://www.tiktok.com/@${username}/video/${video.id}`,
        downloadUrl: video.video?.downloadAddr || video.video?.playAddr || '',
        cover: video.video?.cover || video.video?.dynamicCover || '',
        duration: video.video?.duration || 0,
        author: {
          username: video.author?.uniqueId || username,
          nickname: video.author?.nickname || username
        },
        stats: {
          views: video.stats?.playCount || 0,
          likes: video.stats?.diggCount || 0,
          comments: video.stats?.commentCount || 0,
          shares: video.stats?.shareCount || 0
        },
        createdAt: video.createTime ? new Date(video.createTime * 1000) : new Date()
      }));
    } catch (error) {
      logger.error('Error parsing user videos:', error);
      return [];
    }
  }

  static async fetchVideoById(videoId) {
    try {
      logger.info(`Fetching video by ID: ${videoId}`);

      throw new NotFoundError('Video fetch by ID requires implementation with full video URL');
    } catch (error) {
      logger.error(`Error fetching video ${videoId}:`, error);
      throw error;
    }
  }

  static async fetchTrendingVideos(limit = 10, region = 'US') {
    try {
      logger.info(`Fetching trending videos for region: ${region}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/foryou`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const videos = this.parseTrendingVideos(response.data, limit);

      return {
        videos,
        region
      };
    } catch (error) {
      logger.error('Error fetching trending videos:', error);
      throw error;
    }
  }

  static parseTrendingVideos(html, limit = 10) {
    try {
      const jsonMatch = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
      );

      if (!jsonMatch) {
        return [];
      }

      const data = JSON.parse(jsonMatch[1]);
      const videoList = data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemList || 
                        data.__DEFAULT_SCOPE__?.['webapp.for-you']?.itemList || [];

      return videoList.slice(0, limit).map(video => ({
        id: video.id,
        title: video.desc || '',
        description: video.desc || '',
        url: `https://www.tiktok.com/@${video.author?.uniqueId}/video/${video.id}`,
        downloadUrl: video.video?.downloadAddr || video.video?.playAddr || '',
        cover: video.video?.cover || '',
        duration: video.video?.duration || 0,
        author: {
          username: video.author?.uniqueId || 'unknown',
          nickname: video.author?.nickname || 'Unknown'
        },
        stats: {
          views: video.stats?.playCount || 0,
          likes: video.stats?.diggCount || 0,
          comments: video.stats?.commentCount || 0,
          shares: video.stats?.shareCount || 0
        }
      }));
    } catch (error) {
      logger.error('Error parsing trending videos:', error);
      return [];
    }
  }

  static async searchVideos(query, limit = 10, page = 1) {
    try {
      logger.info(`Searching videos: ${query}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const videos = this.parseSearchVideos(response.data, limit);

      return {
        videos,
        query,
        pagination: {
          page,
          limit,
          total: videos.length
        }
      };
    } catch (error) {
      logger.error(`Error searching videos for "${query}":`, error);
      throw error;
    }
  }

  static parseSearchVideos(html, limit = 10) {
    try {
      const jsonMatch = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
      );

      if (!jsonMatch) {
        return [];
      }

      const data = JSON.parse(jsonMatch[1]);
      const videoList = data.__DEFAULT_SCOPE__?.['webapp.search-item']?.itemList || [];

      return videoList.slice(0, limit).map(item => {
        const video = item.item || item;
        return {
          id: video.id,
          title: video.desc || '',
          description: video.desc || '',
          url: `https://www.tiktok.com/@${video.author?.uniqueId}/video/${video.id}`,
          downloadUrl: video.video?.downloadAddr || video.video?.playAddr || '',
          cover: video.video?.cover || '',
          duration: video.video?.duration || 0,
          author: {
            username: video.author?.uniqueId || 'unknown',
            nickname: video.author?.nickname || 'Unknown'
          },
          stats: {
            views: video.stats?.playCount || 0,
            likes: video.stats?.diggCount || 0,
            comments: video.stats?.commentCount || 0,
            shares: video.stats?.shareCount || 0
          }
        };
      });
    } catch (error) {
      logger.error('Error parsing search videos:', error);
      return [];
    }
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
    try {
      logger.info(`Fetching hashtag info: #${hashtag}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/tag/${hashtag}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const info = this.parseHashtagInfo(response.data, hashtag);
      
      return info;
    } catch (error) {
      logger.error(`Error fetching hashtag info for #${hashtag}:`, error);
      throw new NotFoundError(`Hashtag #${hashtag} not found`);
    }
  }

  static parseHashtagInfo(html, hashtag) {
    try {
      const jsonMatch = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
      );

      if (!jsonMatch) {
        throw new NotFoundError('Hashtag data not found');
      }

      const data = JSON.parse(jsonMatch[1]);
      const challengeInfo = data.__DEFAULT_SCOPE__?.['webapp.challenge-detail']?.challengeInfo || {};

      return {
        hashtag: hashtag,
        views: challengeInfo.stats?.viewCount || 0,
        videoCount: challengeInfo.stats?.videoCount || 0,
        title: challengeInfo.challenge?.title || hashtag,
        description: challengeInfo.challenge?.desc || ''
      };
    } catch (error) {
      logger.error('Error parsing hashtag info:', error);
      throw new NotFoundError(`Hashtag #${hashtag} not found`);
    }
  }

  static async fetchHashtagVideos(hashtag, limit = 10, page = 1, sort = null) {
    try {
      logger.info(`Fetching videos for hashtag: #${hashtag}`);

      const response = await axios.get(`${TIKTOK_BASE_URL}/tag/${hashtag}`, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS)
        },
        timeout: config.REQUEST_TIMEOUT
      });

      const videos = this.parseHashtagVideos(response.data, limit);

      return {
        hashtag,
        videos,
        pagination: {
          page,
          limit,
          total: videos.length
        }
      };
    } catch (error) {
      logger.error(`Error fetching videos for hashtag #${hashtag}:`, error);
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
  }

  static parseHashtagVideos(html, limit = 10) {
    try {
      const jsonMatch = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/
      );

      if (!jsonMatch) {
        return [];
      }

      const data = JSON.parse(jsonMatch[1]);
      const videoList = data.__DEFAULT_SCOPE__?.['webapp.challenge-detail']?.itemList || [];

      return videoList.slice(0, limit).map(video => ({
        id: video.id,
        title: video.desc || '',
        description: video.desc || '',
        url: `https://www.tiktok.com/@${video.author?.uniqueId}/video/${video.id}`,
        downloadUrl: video.video?.downloadAddr || video.video?.playAddr || '',
        cover: video.video?.cover || '',
        author: {
          username: video.author?.uniqueId || 'unknown',
          nickname: video.author?.nickname || 'Unknown'
        },
        stats: {
          views: video.stats?.playCount || 0,
          likes: video.stats?.diggCount || 0,
          comments: video.stats?.commentCount || 0,
          shares: video.stats?.shareCount || 0
        }
      }));
    } catch (error) {
      logger.error('Error parsing hashtag videos:', error);
      return [];
    }
  }

  static async fetchTrendingHashtags(limit = 20, region = 'US') {
    logger.warn('fetchTrendingHashtags: Feature not yet implemented');
    return {
      hashtags: [
        { tag: 'fyp', views: 1000000000, videoCount: 50000000 },
        { tag: 'foryou', views: 900000000, videoCount: 45000000 },
        { tag: 'viral', views: 800000000, videoCount: 40000000 },
        { tag: 'trending', views: 700000000, videoCount: 35000000 },
        { tag: 'funny', views: 600000000, videoCount: 30000000 }
      ].slice(0, limit),
      region,
      message: 'Feature coming soon'
    };
  }

  static async searchHashtags(query, limit = 10) {
    try {
      logger.info(`Searching hashtags: ${query}`);
      
      const info = await this.fetchHashtagInfo(query);
      
      return {
        hashtags: [info],
        query
      };
    } catch (error) {
      logger.warn(`searchHashtags: Error searching for "${query}"`);
      return {
        hashtags: [],
        query,
        message: 'Feature coming soon'
      };
    }
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
    try {
      logger.info(`Comparing hashtags: ${hashtags.join(', ')}`);

      const results = await Promise.all(
        hashtags.map(async (tag) => {
          try {
            return await this.fetchHashtagInfo(tag);
          } catch (error) {
            return {
              hashtag: tag,
              views: 0,
              videoCount: 0,
              error: 'Not found'
            };
          }
        })
      );

      return {
        comparison: results
      };
    } catch (error) {
      logger.warn('compareHashtags: Error comparing hashtags');
      return {
        comparison: hashtags.map(tag => ({
          hashtag: tag,
          views: 0,
          videos: 0,
          message: 'Feature coming soon'
        }))
      };
    }
  }

  static async searchHashtag(tag, limit = 10) {
    logger.warn('searchHashtag: Deprecated method, use fetchHashtagVideos instead');
    return this.fetchHashtagVideos(tag, limit);
  }
}

module.exports = TikTokService;