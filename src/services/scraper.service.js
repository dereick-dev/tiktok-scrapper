const axios = require('axios');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const CacheService = require('./cache.service');
const { TIKTOK_BASE_URL, USER_AGENTS, DEFAULT_HEADERS } = require('../config/constants');
const { NotFoundError, TimeoutError, AppError } = require('../utils/errors');
const config = require('../config/environment');

/**
 * Low-level scraper service
 * Handles HTTP requests and HTML parsing
 */
class ScraperService {
  /**
   * Make HTTP request to TikTok
   * @param {string} url - URL to fetch
   * @param {Object} options - Axios options
   * @returns {Promise<string>} HTML content
   */
  static async makeRequest(url, options = {}) {
    const cacheKey = `scraper:${url}`;

    // Check cache first
    const cached = CacheService.get(cacheKey);
    if (cached) {
      logger.debug('Using cached response', { url });
      return cached;
    }

    try {
      logger.debug('Making request to TikTok', { url });

      const response = await axios.get(url, {
        headers: {
          ...DEFAULT_HEADERS,
          'User-Agent': Helpers.getRandomUserAgent(USER_AGENTS),
          ...options.headers
        },
        timeout: config.REQUEST_TIMEOUT,
        ...options
      });

      const html = response.data;

      // Cache the response
      CacheService.set(cacheKey, html, 300); // 5 minutes

      return html;

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Request timeout', { url });
        throw new TimeoutError('Request timeout');
      }

      if (error.response?.status === 404) {
        logger.warn('Resource not found', { url });
        throw new NotFoundError('Resource not found');
      }

      if (error.response?.status === 429) {
        logger.warn('Rate limited by TikTok', { url });
        throw new AppError('Rate limited by TikTok', 429);
      }

      logger.error('Request failed', { url, error: error.message });
      throw new AppError('Failed to fetch data from TikTok', 500);
    }
  }

  /**
   * Extract JSON data from HTML
   * @param {string} html - HTML content
   * @param {string} scriptId - Script tag ID
   * @returns {Object} Parsed JSON data
   */
  static extractJsonData(html, scriptId = '__UNIVERSAL_DATA_FOR_REHYDRATION__') {
    try {
      const regex = new RegExp(
        `<script id="${scriptId}" type="application\\/json">(.*?)<\\/script>`,
        's'
      );

      const match = html.match(regex);

      if (!match || !match[1]) {
        logger.warn('JSON data not found in HTML', { scriptId });
        throw new NotFoundError('Data not found in page');
      }

      const jsonData = JSON.parse(match[1]);

      return jsonData;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to parse JSON data', { error: error.message });
      throw new AppError('Failed to parse data', 500);
    }
  }

  /**
   * Extract user data from TikTok page
   * @param {string} username - TikTok username
   * @returns {Promise<Object>} User data
   */
  static async scrapeUserProfile(username) {
    const url = `${TIKTOK_BASE_URL}/@${username}`;
    const html = await this.makeRequest(url);

    const jsonData = this.extractJsonData(html);
    const userInfo = jsonData.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;

    if (!userInfo || !userInfo.user) {
      throw new NotFoundError(`User @${username} not found`);
    }

    return userInfo;
  }

  /**
   * Extract video data from TikTok page
   * @param {string} videoId - TikTok video ID
   * @returns {Promise<Object>} Video data
   */
  static async scrapeVideo(videoId) {
    // TikTok video URLs are in format: /video/{videoId}
    const url = `${TIKTOK_BASE_URL}/video/${videoId}`;
    const html = await this.makeRequest(url);

    const jsonData = this.extractJsonData(html);
    const videoInfo = jsonData.__DEFAULT_SCOPE__?.['webapp.video-detail'];

    if (!videoInfo) {
      throw new NotFoundError(`Video ${videoId} not found`);
    }

    return videoInfo;
  }

  /**
   * Extract hashtag data from TikTok page
   * @param {string} hashtag - Hashtag name (without #)
   * @returns {Promise<Object>} Hashtag data
   */
  static async scrapeHashtag(hashtag) {
    const url = `${TIKTOK_BASE_URL}/tag/${hashtag}`;
    const html = await this.makeRequest(url);

    const jsonData = this.extractJsonData(html);
    const hashtagInfo = jsonData.__DEFAULT_SCOPE__?.['webapp.tag-detail'];

    if (!hashtagInfo) {
      throw new NotFoundError(`Hashtag #${hashtag} not found`);
    }

    return hashtagInfo;
  }

  /**
   * Parse meta tags from HTML
   * @param {string} html - HTML content
   * @returns {Object} Meta tags
   */
  static parseMetaTags(html) {
    const metaTags = {};

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      metaTags.title = titleMatch[1];
    }

    // Extract meta description
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    if (descMatch) {
      metaTags.description = descMatch[1];
    }

    // Extract Open Graph tags
    const ogMatches = html.matchAll(/<meta property="og:(.*?)" content="(.*?)"/g);
    for (const match of ogMatches) {
      metaTags[`og:${match[1]}`] = match[2];
    }

    return metaTags;
  }

  /**
   * Check if TikTok is accessible
   * @returns {Promise<boolean>}
   */
  static async checkAvailability() {
    try {
      await this.makeRequest(TIKTOK_BASE_URL, { timeout: 5000 });
      logger.info('TikTok is accessible');
      return true;
    } catch (error) {
      logger.error('TikTok is not accessible', { error: error.message });
      return false;
    }
  }

  /**
   * Extract all links from HTML
   * @param {string} html - HTML content
   * @returns {Array<string>} Array of URLs
   */
  static extractLinks(html) {
    const linkRegex = /href="(https?:\/\/[^"]+)"/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Extract images from HTML
   * @param {string} html - HTML content
   * @returns {Array<string>} Array of image URLs
   */
  static extractImages(html) {
    const imgRegex = /src="(https?:\/\/[^"]+\.(jpg|jpeg|png|gif|webp))"/gi;
    const images = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return [...new Set(images)]; // Remove duplicates
  }

  /**
   * Batch scrape multiple users
   * @param {Array<string>} usernames - Array of usernames
   * @param {number} delay - Delay between requests (ms)
   * @returns {Promise<Array>} Array of user data
   */
  static async batchScrapeUsers(usernames, delay = 2000) {
    const results = [];

    for (const username of usernames) {
      try {
        logger.info(`Batch scraping user: @${username}`);
        const userData = await this.scrapeUserProfile(username);
        results.push({
          username,
          success: true,
          data: userData
        });
      } catch (error) {
        logger.error(`Failed to scrape @${username}`, { error: error.message });
        results.push({
          username,
          success: false,
          error: error.message
        });
      }

      // Wait before next request to avoid rate limiting
      if (usernames.indexOf(username) < usernames.length - 1) {
        await Helpers.sleep(delay);
      }
    }

    return results;
  }

  /**
   * Get scraper statistics
   * @returns {Object} Scraper stats
   */
  static getStats() {
    const cacheStats = CacheService.getStats();

    return {
      cache: cacheStats,
      userAgents: USER_AGENTS.length,
      timeout: config.REQUEST_TIMEOUT,
      baseUrl: TIKTOK_BASE_URL
    };
  }
}

module.exports = ScraperService;