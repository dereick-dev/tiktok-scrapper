/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} uniqueId - Username
 * @property {string} nickname - Display name
 * @property {Object} avatar - Avatar URLs
 * @property {string} avatar.thumb - Thumbnail avatar
 * @property {string} avatar.medium - Medium avatar
 * @property {string} avatar.large - Large avatar
 * @property {string} signature - Bio/Description
 * @property {boolean} verified - Verification status
 * @property {boolean} privateAccount - Privacy status
 * @property {string} region - User region
 */

/**
 * @typedef {Object} Stats
 * @property {number} followers - Follower count
 * @property {number} following - Following count
 * @property {number} likes - Total likes
 * @property {number} videos - Video count
 */

/**
 * @typedef {Object} UserProfile
 * @property {User} user - User information
 * @property {Stats} stats - User statistics
 * @property {string} url - Profile URL
 * @property {string} scrapedAt - Timestamp
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Success status
 * @property {*} data - Response data
 * @property {string} timestamp - Response timestamp
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false
 * @property {string} error - Error message
 * @property {string} timestamp - Error timestamp
 */

module.exports = {};