const https = require('https');

class ShardCalculator {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://discord.com/api/v10';
  }
  
  async getRecommendedShards() {
    try {
      const data = await this._makeRequest('/gateway/bot');
      
      const recommended = data.shards || 1;
      const sessionStartLimit = data.session_start_limit;
      
      if (sessionStartLimit) {
        const { remaining, reset_after } = sessionStartLimit;
        
        if (remaining < recommended) {
          const waitMinutes = Math.ceil(reset_after / 60000);
          throw new Error(
            `Not enough session starts remaining (${remaining}/${recommended}). ` +
            `Reset in ${waitMinutes} minutes.`
          );
        }
      }
      
      return recommended;
    } catch (error) {
      console.error('Error getting recommended shards:', error.message);
      return 1;
    }
  }
  
  async getGatewayInfo() {
    try {
      return await this._makeRequest('/gateway/bot');
    } catch (error) {
      console.error('Error getting gateway info:', error.message);
      return null;
    }
  }
  
  calculateOptimalShards(guildCount, guildsPerShard = 1000) {
    return Math.ceil(guildCount / guildsPerShard);
  }
  
  calculateShardsForGuild(guildId, totalShards) {
    const guildIdNum = BigInt(guildId);
    const shardId = Number((guildIdNum >> 22n) % BigInt(totalShards));
    return shardId;
  }
  
  distributeGuilds(guilds, totalShards) {
    const distribution = Array.from({ length: totalShards }, () => []);
    
    for (const guild of guilds) {
      const shardId = this.calculateShardsForGuild(guild.id, totalShards);
      distribution[shardId].push(guild);
    }
    
    return distribution;
  }
  
  _makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'discord.com',
        port: 443,
        path: `/api/v10${endpoint}`,
        method: 'GET',
        headers: {
          'Authorization': `Bot ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (res.statusCode >= 400) {
              reject(new Error(`API Error: ${parsed.message || 'Unknown error'}`));
            } else {
              resolve(parsed);
            }
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
  }
  
  getShardStats(shards) {
    const stats = {
      total: shards.length,
      ready: 0,
      connecting: 0,
      disconnected: 0,
      guildsPerShard: {},
      averageGuilds: 0
    };
    
    let totalGuilds = 0;
    
    for (const shard of shards) {
      if (shard.ready) stats.ready++;
      else if (shard.connecting) stats.connecting++;
      else stats.disconnected++;
      
      const guildCount = shard.guilds || 0;
      stats.guildsPerShard[shard.id] = guildCount;
      totalGuilds += guildCount;
    }
    
    stats.averageGuilds = stats.total > 0 ? totalGuilds / stats.total : 0;
    
    return stats;
  }
}

module.exports = ShardCalculator;