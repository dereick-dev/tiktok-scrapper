const VideoDownloadService = require('../../../services/videoDownload.service');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');
const logger = require('../../../utils/logger');

class DownloadController {
  static async getDownloadInfo(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        throw new ValidationError('Video URL is required');
      }

      const tiktokRegex = /^https?:\/\/(www\.)?(vm\.|vt\.)?tiktok\.com\/.+/;
      if (!tiktokRegex.test(url)) {
        throw new ValidationError('Invalid TikTok URL');
      }

      logger.info(`Getting download info for: ${url}`);

      const downloadInfo = await VideoDownloadService.getDownloadUrl(url);

      return ResponseHandler.success(res, downloadInfo.data);

    } catch (error) {
      next(error);
    }
  }

  static async downloadVideo(req, res, next) {
    try {
      const { url } = req.query;

      if (!url) {
        throw new ValidationError('Download URL is required');
      }

      logger.info(`Streaming video from: ${url}`);

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');

      const videoStream = await VideoDownloadService.streamVideo(url);
      videoStream.pipe(res);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = DownloadController;