const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Simple in-memory cache service
 * Para producción, considera usar Redis o Memcached
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    if (!config.CACHE_ENABLED) {
      return null;
    }

    const item = this.cache.get(key);

    if (!item) {
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      logger.debug('Cache expired', { key });
      this.delete(key);
      return null;
    }

    logger.debug('Cache hit', { key });
    return item.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default from config)
   */
  set(key, value, ttl = config.CACHE_TTL) {
    if (!config.CACHE_ENABLED) {
      return;
    }

    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    const expiresAt = Date.now() + (ttl * 1000);

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });

    // Set cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.ttlTimers.set(key, timer);

    logger.debug('Cache set', { key, ttl });
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }

    const deleted = this.cache.delete(key);

    if (deleted) {
      logger.debug('Cache deleted', { key });
    }

    return deleted;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!config.CACHE_ENABLED) {
      return false;
    }

    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.ttlTimers.clear();

    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const now = Date.now();
    let activeItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        expiredItems++;
      } else {
        activeItems++;
      }
      
      // Approximate size calculation
      totalSize += JSON.stringify(item.value).length;
    }

    return {
      enabled: config.CACHE_ENABLED,
      activeItems,
      expiredItems,
      totalItems: this.cache.size,
      approximateSizeKB: Math.round(totalSize / 1024),
      defaultTTL: config.CACHE_TTL
    };
  }

  /**
   * Get or set with callback
   * @param {string} key - Cache key
   * @param {Function} callback - Async function to get value if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<*>} Cached or fresh value
   */
  async getOrSet(key, callback, ttl = config.CACHE_TTL) {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Get fresh data
    logger.debug('Fetching fresh data for cache', { key });
    const value = await callback();

    // Cache it
    this.set(key, value, ttl);

    return value;
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern to match (simple wildcard support)
   */
  deletePattern(pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );

    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        deletedCount++;
      }
    }

    logger.info('Cache pattern deleted', { pattern, deletedCount });

    return deletedCount;
  }

  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   * @returns {number|null} Remaining seconds or null
   */
  getTTL(key) {
    const item = this.cache.get(key);

    if (!item || !item.expiresAt) {
      return null;
    }

    const remaining = Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));

    return remaining;
  }

  /**
   * Update TTL for existing key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {boolean} True if updated
   */
  updateTTL(key, ttl) {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Clear old timer
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    // Update expiration
    item.expiresAt = Date.now() + (ttl * 1000);

    // Set new timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.ttlTimers.set(key, timer);

    logger.debug('Cache TTL updated', { key, ttl });

    return true;
  }

  /**
   * Clean up expired items
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cache cleanup completed', { cleanedCount });
    }

    return cleanedCount;
  }
}

// Export singleton instance
module.exports = new CacheService();