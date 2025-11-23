const axios = require('axios');
const logger = require('../utils/logger');

class VideoDownloadService {
  /**
   * @param {string} videoUrl
   * @returns {Promise<Object>}
   */
  static async getDownloadUrl(videoUrl) {
    try {
      logger.info(`Getting download URL for: ${videoUrl}`);

      const response = await axios.get(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = response.data;
      
      const videoDataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
      
      if (!videoDataMatch) {
        throw new Error('No se pudo extraer información del video');
      }

      const videoData = JSON.parse(videoDataMatch[1]);
      const videoInfo = videoData.__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct;

      return {
        success: true,
        data: {
          videoId: videoInfo.id,
          description: videoInfo.desc,
          downloadUrl: videoInfo.video.downloadAddr,
          playUrl: videoInfo.video.playAddr,
          cover: videoInfo.video.cover,
          duration: videoInfo.video.duration,
          author: {
            username: videoInfo.author.uniqueId,
            nickname: videoInfo.author.nickname
          },
          stats: {
            views: videoInfo.stats.playCount,
            likes: videoInfo.stats.diggCount,
            comments: videoInfo.stats.commentCount,
            shares: videoInfo.stats.shareCount
          }
        }
      };
    } catch (error) {
      logger.error('Error getting download URL:', error);
      throw error;
    }
  }

  /**
   * @param {string} videoUrl
   * @returns {Promise<Stream>}
   */
  static async streamVideo(videoUrl) {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.tiktok.com/'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error streaming video:', error);
      throw error;
    }
  }
}

module.exports = VideoDownloadService;