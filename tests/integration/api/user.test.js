const request = require('supertest');
const app = require('../../../index');

describe('User API Endpoints', () => {
  describe('GET /api/v1/user/:username', () => {
    it('should return 400 for invalid username', async () => {
      const response = await request(app)
        .get('/api/v1/user/@@@invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/user/thisuserdoesnotexist123456')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
    });
  });
});