<<<<<<< HEAD
const express = require('express');
const HashtagController = require('../controllers/hashtag.controller');

const router = express.Router();

// Get hashtag info
router.get('/hashtag/:tag', HashtagController.getHashtagInfo);

// Get videos by hashtag
router.get('/hashtag/:tag/videos', HashtagController.getHashtagVideos);

// Get related hashtags
router.get('/hashtag/:tag/related', HashtagController.getRelatedHashtags);

// Get trending hashtags
router.get('/hashtags/trending', HashtagController.getTrendingHashtags);

// Search hashtags
router.get('/hashtags/search', HashtagController.searchHashtags);

// Compare hashtags
router.get('/hashtags/compare', HashtagController.compareHashtags);

=======
const express = require('express');
const HashtagController = require('../controllers/hashtag.controller');

const router = express.Router();

// Get hashtag info
router.get('/hashtag/:tag', HashtagController.getHashtagInfo);

// Get videos by hashtag
router.get('/hashtag/:tag/videos', HashtagController.getHashtagVideos);

// Get related hashtags
router.get('/hashtag/:tag/related', HashtagController.getRelatedHashtags);

// Get trending hashtags
router.get('/hashtags/trending', HashtagController.getTrendingHashtags);

// Search hashtags
router.get('/hashtags/search', HashtagController.searchHashtags);

// Compare hashtags
router.get('/hashtags/compare', HashtagController.compareHashtags);

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = router;