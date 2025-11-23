## Features

- Get user profiles and statistics
- Rate limiting protection
- Professional error handling
- Request logging
- CORS enabled
- RESTful API design
- Versioned endpoints (v1)
- User videos (coming soon)
- Hashtag search (coming soon)

1. Clone the repository:
```bash
git clone https://github.com/uxoxufe/tiktok-scrapper.git
cd tiktok-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:

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

## API Documentation

#### Get User Profile
```http
GET /api/v1/user/:username
```

#### Health Check
```http
GET /health
```

## Usage Examples

### JavaScript (Node.js)
```javascript
const axios = require('axios');

async function getUser(username) {
  const response = await axios.get(
    `https://your-api/api/v1/user/${username}`
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
        f"https://your-api/api/v1/user/{username}"
    )
    print(response.json())

get_user('khaby.lame')
```

## Deployment

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## Bug Reports

Found a bug? Please open an issue on [GitHub Issues](https://github.com/uxoxufe/tiktok-api/issues).

## Contact

- GitHub: [@uxoxufe](https://github.com/uxoxufe)

## Acknowledgments

- TikTok for their platform
- Express.js community

---

Made with by uxoxufe