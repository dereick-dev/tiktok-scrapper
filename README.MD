# 🎵 TikTok API

Professional TikTok scraping API built with Node.js and Express.

## 🚀 Features

- ✅ Get user profiles and statistics
- ✅ Rate limiting protection
- ✅ Professional error handling
- ✅ Request logging
- ✅ CORS enabled
- ✅ RESTful API design
- ✅ Versioned endpoints (v1)
- 🔄 User videos (coming soon)
- 🔄 Hashtag search (coming soon)

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tiktok-api.git
cd tiktok-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
NODE_ENV=production
PORT=8000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

5. Start the server:
```bash
npm start
```

## 📚 API Documentation

### Base URL
```
https://your-api.koyeb.app
```

### Endpoints

#### Get User Profile
```http
GET /api/v1/user/:username
```

**Parameters:**
- `username` (string, required) - TikTok username (with or without @)

**Response:**
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
      "signature": "If u want to laugh u r in the right place😎",
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
  },
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User not found",
  "timestamp": "2025-11-23T04:30:00.000Z"
}
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-23T04:30:00.000Z",
  "uptime": 123456.789,
  "memory": {
    "rss": 50331648,
    "heapTotal": 18874368,
    "heapUsed": 10485760,
    "external": 1234567
  },
  "environment": "production"
}
```

## 📖 Usage Examples

### JavaScript (Node.js)
```javascript
const axios = require('axios');

async function getUser(username) {
  const response = await axios.get(
    `https://your-api.koyeb.app/api/v1/user/${username}`
  );
  console.log(response.data);
}

getUser('khaby.lame');
```

### Python
```python
import requests

def get_user(username):
    response = requests.get(
        f"https://your-api.koyeb.app/api/v1/user/{username}"
    )
    print(response.json())

get_user('khaby.lame')
```

### cURL
```bash
curl https://your-api.koyeb.app/api/v1/user/khaby.lame
```

### Browser (Fetch API)
```javascript
fetch('https://your-api.koyeb.app/api/v1/user/khaby.lame')
  .then(res => res.json())
  .then(data => console.log(data));
```

## ⚡ Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## 🔒 Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request (Invalid parameters) |
| 404  | Not Found (User doesn't exist) |
| 408  | Request Timeout |
| 429  | Too Many Requests (Rate limit exceeded) |
| 500  | Internal Server Error |

## 🏗️ Project Structure
```
tiktok-api/
├── src/
│   ├── api/v1/          # API version 1
│   ├── services/        # Business logic
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── examples/            # Usage examples
├── docs/                # Documentation
├── tests/               # Test files
└── index.js             # Entry point
```

## 🧪 Testing
```bash
# Run all tests
npm test

# Run specific test
npm test -- user.test.js
```

## 🚀 Deployment

### Koyeb
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Docker
```bash
docker build -t tiktok-api .
docker run -p 8000:8000 tiktok-api
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `8000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` |
| `LOG_LEVEL` | Logging level | `info` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This API is for educational purposes only. Make sure to comply with TikTok's Terms of Service and robots.txt. Use responsibly and respect rate limits.

## 🐛 Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/uxoxufe/tiktok-api/issues).

## 📧 Contact

- GitHub: [@uxoxufe](https://github.com/uxoxufe)
- Email: wksipk8@example.com

## 🙏 Acknowledgments

- TikTok for their platform
- Express.js community
- All contributors

---

Made with ❤️ by [uxoxufe]