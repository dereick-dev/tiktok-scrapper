const ShardingStrategy = require('../ShardingStrategy');

class AutoStrategy extends ShardingStrategy {
  constructor(manager, options = {}) {
    super(manager);
    
    this.guildsPerShard = options.guildsPerShard || 1000;
    this.minShards = options.minShards || 1;
    this.maxShards = options.maxShards || 16;
  }
  
  async calculate() {
    try {
      const recommended = await this.manager.shardCalculator.getRecommendedShards();
      
      const shardCount = Math.max(
        this.minShards,
        Math.min(recommended, this.maxShards)
      );
      
      this.manager.logger.info(`Auto strategy calculated ${shardCount} shards`);
      
      return shardCount;
    } catch (error) {
      this.manager.logger.error('Error calculating auto shards:', error);
      return this.minShards;
    }
  }
  
  distribute(shardCount) {
    return Array.from({ length: shardCount }, (_, i) => i);
  }
  
  async shouldRescale() {
    const stats = await this.manager.statistics.collectStats();
    
    if (!stats) return false;
    
    const avgGuildsPerShard = stats.totals.guilds / this.manager.shards.size;
    
    if (avgGuildsPerShard > this.guildsPerShard * 1.2) {
      this.manager.logger.warn(`Average guilds per shard (${avgGuildsPerShard}) exceeds threshold`);
      return true;
    }
    
    return false;
  }
  
  calculateOptimalShards(guildCount) {
    const calculated = Math.ceil(guildCount / this.guildsPerShard);
    
    return Math.max(
      this.minShards,
      Math.min(calculated, this.maxShards)
    );
  }
}

module.exports = AutoStrategy;