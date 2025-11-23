const TikTokService = require('../../../services/tiktok.service');
const UserValidator = require('../validators/user.validator');
const ResponseHandler = require('../../../utils/response');
const { ValidationError } = require('../../../utils/errors');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const { username } = req.params;

      const validation = UserValidator.isValidUsername(username);
      if (!validation.valid) {
        throw new ValidationError(validation.error);
      }

      const userData = await TikTokService.fetchUserProfile(validation.username);
      
      return ResponseHandler.success(res, userData);
      
    } catch (error) {
      next(error);
    }
  }

  static async getVideos(req, res, next) {
    try {
      const { username } = req.params;
      const { limit = 10 } = req.query;

      const userValidation = UserValidator.isValidUsername(username);
      if (!userValidation.valid) {
        throw new ValidationError(userValidation.error);
      }

      const limitValidation = UserValidator.validateLimit(limit);
      if (!limitValidation.valid) {
        throw new ValidationError(limitValidation.error);
      }

      const videos = await TikTokService.fetchUserVideos(
        userValidation.username, 
        limitValidation.limit
      );
      
      return ResponseHandler.success(res, videos);
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;