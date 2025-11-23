# Setup Guide

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tiktok-api.git
cd tiktok-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
NODE_ENV=development
PORT=8000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:8000`

### 5. Test the API
```bash
# Health check
curl http://localhost:8000/health

# Get user profile
curl http://localhost:8000/api/v1/user/khaby.lame
```

## Production Deployment

### Deploy to Koyeb

1. **Create Koyeb Account**
   - Sign up at https://www.koyeb.com

2. **Connect GitHub Repository**
   - Go to Koyeb dashboard
   - Click "Create App"
   - Select "GitHub"
   - Choose your repository

3. **Configure Build**
   - Build command: (leave empty, uses package.json)
   - Run command: `npm start`
   - Port: `8000`

4. **Set Environment Variables**
```
   NODE_ENV=production
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be available at: `https://your-app.koyeb.app`

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set RATE_LIMIT_MAX_REQUESTS=100

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy with Docker

1. **Build Image**
```bash
docker build -t tiktok-api .
```

2. **Run Container**
```bash
docker run -p 8000:8000 \
  -e NODE_ENV=production \
  -e PORT=8000 \
  tiktok-api
```

## Testing

### Run Tests
```bash
npm test
```

### Run Linter
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Not Responding
1. Check if server is running
2. Verify environment variables
3. Check logs for errors
4. Ensure port is not blocked by firewall

## Additional Resources

- [API Documentation](API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)