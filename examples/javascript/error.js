const axios = require('axios');

const API_URL = 'https://your-api.koyeb.app';

async function fetchWithRetry(username, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for @${username}`);
      
      const response = await axios.get(
        `${API_URL}/api/v1/user/${username}`,
        { timeout: 10000 }
      );
      
      console.log('✅ Success!');
      return response.data;
      
    } catch (error) {
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            console.error('❌ Bad Request:', data.error);
            return null; // Don't retry on bad request
            
          case 404:
            console.error('❌ User not found:', username);
            return null; // Don't retry on 404
            
          case 429:
            console.warn('⚠️ Rate limited. Waiting 60s...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            continue;
            
          case 500:
            console.error('❌ Server error:', data.error);
            break;
        }
      } else if (error.code === 'ECONNABORTED') {
        console.warn('⏱️ Request timeout');
      } else {
        console.error('❌ Network error:', error.message);
      }
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error(`❌ Failed after ${maxRetries} attempts`);
  return null;
}

// Usage
async function main() {
  const users = ['khaby.lame', 'nonexistentuser', 'charlidamelio'];
  
  for (const user of users) {
    const data = await fetchWithRetry(user);
    
    if (data) {
      console.log(`\n📊 ${data.data.user.nickname}`);
      console.log(`Followers: ${data.data.stats.followers.toLocaleString()}\n`);
    }
    
    // Wait between users
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main();