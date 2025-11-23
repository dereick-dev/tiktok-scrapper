```

---

#### **1. Endpoints basic:**
```
GET  /                    - API info
GET  /health             - Health check
```

#### **2. Endpoints de Usuario (FUNCIONANDO):**
```
GET  /api/v1/user/:username
```

#### **3. Endpoints de videos (PLACEHOLDER - Coming Soon):**
```
GET  /api/v1/videos/:username
GET  /api/v1/video/:videoId
GET  /api/v1/video/:videoId/comments
GET  /api/v1/videos/trending
GET  /api/v1/videos/search?q=keyword
```

#### **4. Endpoints de Hashtags (PLACEHOLDER - Coming Soon):**
```
GET  /api/v1/hashtag/:tag
GET  /api/v1/hashtag/:tag/videos
GET  /api/v1/hashtag/:tag/related
GET  /api/v1/hashtags/trending 
GET  /api/v1/hashtags/search?q=keyword
GET  /api/v1/hashtags/compare?tags=tag1,tag2
GET  /api/v1/health 
```