const axios = require('axios');

const API_URL = 'https://your-api.koyeb.app';

async function batchScrapeUsers(usernames) {
  const results = [];
  
  for (const username of usernames) {
    try {
      console.log(`Fetching @${username}...`);
      
      const response = await axios.get(`${API_URL}/api/v1/user/${username}`);
      
      if (response.data.success) {
        results.push({
          username,
          success: true,
          data: response.data.data
        });
        console.log(`✓ @${username} fetched successfully`);
      }
      
      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      results.push({
        username,
        success: false,
        error: error.response?.data?.error || error.message
      });
      console.log(`✗ @${username} failed: ${error.response?.data?.error || error.message}`);
    }
  }
  
  return results;
}

// Usage
const users = ['khaby.lame', 'charlidamelio', 'bellapoarch'];

batchScrapeUsers(users).then(results => {
  console.log('\nResults:');
  console.log(JSON.stringify(results, null, 2));
});