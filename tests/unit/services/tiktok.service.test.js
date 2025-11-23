const TikTokService = require('../../../src/services/tiktok.service');
const axios = require('axios');

jest.mock('axios');

describe('TikTokService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockHtml = `
        <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">
        {
          "__DEFAULT_SCOPE__": {
            "webapp.user-detail": {
              "userInfo": {
                "user": {
                  "id": "123",
                  "uniqueId": "testuser",
                  "nickname": "Test User",
                  "verified": true
                },
                "stats": {
                  "followerCount": 1000,
                  "followingCount": 100,
                  "heart": 5000,
                  "videoCount": 50
                }
              }
            }
          }
        }
        </script>
      `;

      axios.get.mockResolvedValue({ data: mockHtml });

      const result = await TikTokService.fetchUserProfile('testuser');

      expect(result).toBeDefined();
      expect(result.user.uniqueId).toBe('testuser');
      expect(result.stats.followers).toBe(1000);
    });

    it('should throw error for non-existent user', async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });

      await expect(
        TikTokService.fetchUserProfile('nonexistent')
      ).rejects.toThrow();
    });
  });
});