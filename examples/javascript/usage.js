const axios = require('axios');

const API_URL = 'https://your-api.koyeb.app';

async function getUserProfile(username) {
  try {
    const response = await axios.get(`${API_URL}/api/v1/user/${username}`);
    
    if (response.data.success) {
      const { user, stats } = response.data.data;
      
      console.log('User Profile:');
      console.log(`Name: ${user.nickname}`);
      console.log(`Username: @${user.uniqueId}`);
      console.log(`Followers: ${stats.followers.toLocaleString()}`);
      console.log(`Videos: ${stats.videos.toLocaleString()}`);
      console.log(`Likes: ${stats.likes.toLocaleString()}`);
      console.log(`URL: ${response.data.data.url}`);
      
      return response.data.data;
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
getUserProfile('khaby.lame');