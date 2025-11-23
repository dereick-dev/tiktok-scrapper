module.exports = {
  TIKTOK_BASE_URL: 'https://www.tiktok.com',
  
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  
  DEFAULT_HEADERS: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  },
  
  ERROR_MESSAGES: {
    USER_NOT_FOUND: 'User not found',
    INVALID_USERNAME: 'Invalid username format',
    REQUEST_TIMEOUT: 'Request timeout',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error'
  },
  
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500
  }
};