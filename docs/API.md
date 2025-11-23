<<<<<<< HEAD
# API Documentation

## Base URL
```
https://your-api.koyeb.app/api/v1
```

## Authentication
Currently, no authentication is required. API keys may be implemented in future versions.

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in all responses

## Endpoints

### 1. Get User Profile

Retrieve detailed information about a TikTok user.

**Endpoint:** `GET /user/:username`

**Parameters:**
- `username` (string, required) - TikTok username (@ symbol optional)

**Example Request:**
```bash
curl https://your-api.koyeb.app/api/v1/user/khaby.lame
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123456789",
      "uniqueId": "khaby.lame",
      "nickname": "Khaby Lame",
      "avatar": {
        "thumb": "https://...",
        "medium": "https://...",
        "large": "https://..."
      },
      "signature": "Bio text here",
      "verified": true,
      "privateAccount": false,
      "region": "IT"
    },
    "stats": {
      "followers": 162300000,
      "following": 219,
      "likes": 2600000000,
      "videos": 2845
    },
    "url": "https://www.tiktok.com/@khaby.lame",
    "scrapedAt": "2025-11-23T04:30:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": "Invalid username format",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

404 Not Found:
```json
{
  "success": false,
  "error": "User @username not found",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

429 Too Many Requests:
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": 900,
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

### 2. Get User Videos (Coming Soon)

**Endpoint:** `GET /videos/:username`

**Parameters:**
- `username` (string, required) - TikTok username
- `limit` (number, optional) - Number of videos to fetch (default: 10, max: 100)

**Status:** Not implemented yet

---

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 408 | Request Timeout |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limit Headers

All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Best Practices

1. **Caching:** Cache responses for at least 5 minutes to reduce load
2. **Rate Limiting:** Respect rate limits and implement backoff strategies
3. **Error Handling:** Always handle errors gracefully
4. **Timeouts:** Set appropriate timeouts (recommended: 10 seconds)
5. **User Agent:** Include a descriptive User-Agent header

## Example Implementations

See the `/examples` directory for complete implementation examples in:
- JavaScript (Node.js)
- Python
- cURL
=======
# API Documentation

## Base URL
```
https://your-api.koyeb.app/api/v1
```

## Authentication
Currently, no authentication is required. API keys may be implemented in future versions.

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in all responses

## Endpoints

### 1. Get User Profile

Retrieve detailed information about a TikTok user.

**Endpoint:** `GET /user/:username`

**Parameters:**
- `username` (string, required) - TikTok username (@ symbol optional)

**Example Request:**
```bash
curl https://your-api.koyeb.app/api/v1/user/khaby.lame
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123456789",
      "uniqueId": "khaby.lame",
      "nickname": "Khaby Lame",
      "avatar": {
        "thumb": "https://...",
        "medium": "https://...",
        "large": "https://..."
      },
      "signature": "Bio text here",
      "verified": true,
      "privateAccount": false,
      "region": "IT"
    },
    "stats": {
      "followers": 162300000,
      "following": 219,
      "likes": 2600000000,
      "videos": 2845
    },
    "url": "https://www.tiktok.com/@khaby.lame",
    "scrapedAt": "2025-11-23T04:30:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": "Invalid username format",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

404 Not Found:
```json
{
  "success": false,
  "error": "User @username not found",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

429 Too Many Requests:
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": 900,
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

### 2. Get User Videos (Coming Soon)

**Endpoint:** `GET /videos/:username`

**Parameters:**
- `username` (string, required) - TikTok username
- `limit` (number, optional) - Number of videos to fetch (default: 10, max: 100)

**Status:** Not implemented yet

---

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 408 | Request Timeout |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limit Headers

All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Best Practices

1. **Caching:** Cache responses for at least 5 minutes to reduce load
2. **Rate Limiting:** Respect rate limits and implement backoff strategies
3. **Error Handling:** Always handle errors gracefully
4. **Timeouts:** Set appropriate timeouts (recommended: 10 seconds)
5. **User Agent:** Include a descriptive User-Agent header

## Example Implementations

See the `/examples` directory for complete implementation examples in:
- JavaScript (Node.js)
- Python
- cURL
>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
- More coming soon...