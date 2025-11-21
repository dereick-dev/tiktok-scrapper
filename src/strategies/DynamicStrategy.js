const ShardingStrategy = require('../ShardingStrategy');

class DynamicStrategy extends ShardingStrategy {
  constructor(manager, options = {}) {
    super(manager);
    
    this.guildsPerShard = options.guildsPerShard || 1000;
    this.checkInterval = options.checkInterval || 300000; // 5 minutes
    this.scaleThreshold = options.scaleThreshold || 0.8;
    this.minShards = options.minShards || 1;
    this.maxShards = options.maxShards || 32;
    
    this.monitoring = false;
    this.intervalId = null;
  }
  
  async calculate() {
    const recommended = await this.manager.shardCalculator.getRecommendedShards();
    
    const shardCount = Math.max(
      this.minShards,
      Math.min(recommended, this.maxShards)
    );
    
    this.manager.logger.info(`Dynamic strategy calculated ${shardCount} shards`);
    
    return shardCount;
  }
  
  distribute(shardCount) {
    return Array.from({ length: shardCount }, (_, i) => i);
  }
  
  startMonitoring() {
    if (this.monitoring) {
      this.manager.logger.warn('Dynamic monitoring already started');
      return;
    }
    
    this.monitoring = true;
    this.manager.logger.info('Started dynamic scaling monitoring');
    
    this.intervalId = setInterval(async () => {
      await this.checkAndScale();
    }, this.checkInterval);
  }
  
  stopMonitoring() {
    if (!this.monitoring) {
      return;
    }
    
    this.monitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.manager.logger.info('Stopped dynamic scaling monitoring');
  }
  
  async checkAndScale() {
    try {
      const stats = await this.manager.statistics.collectStats();
      
      if (!stats) {
        return;
      }
      
      const currentShards = this.manager.shards.size;
      const totalGuilds = stats.totals.guilds;
      const avgGuildsPerShard = totalGuilds / currentShards;
      
      const threshold = this.guildsPerShard * this.scaleThreshold;
      
      if (avgGuildsPerShard > threshold) {
        const optimalShards = this.calculateOptimalShards(totalGuilds);
        
        if (optimalShards > currentShards && optimalShards <= this.maxShards) {
          this.manager.logger.info(
            `Scaling up: ${currentShards} -> ${optimalShards} shards ` +
            `(avg ${Math.round(avgGuildsPerShard)} guilds/shard)`
          );
          
          await this.scaleUp(optimalShards);
        }
      } else if (avgGuildsPerShard < threshold * 0.5 && currentShards > this.minShards) {
        const optimalShards = this.calculateOptimalShards(totalGuilds);
        
        if (optimalShards < currentShards && optimalShards >= this.minShards) {
          this.manager.logger.info(
            `Scaling down: ${currentShards} -> ${optimalShards} shards ` +
            `(avg ${Math.round(avgGuildsPerShard)} guilds/shard)`
          );
          
          await this.scaleDown(optimalShards);
        }
      }
    } catch (error) {
      this.manager.logger.error('Error in dynamic scaling check:', error);
    }
  }
  
  calculateOptimalShards(guildCount) {
    const calculated = Math.ceil(guildCount / this.guildsPerShard);
    
    return Math.max(
      this.minShards,
      Math.min(calculated, this.maxShards)
    );
  }
  
  async scaleUp(targetShards) {
    const currentShards = this.manager.shards.size;
    const shardsToAdd = targetShards - currentShards;
    
    for (let i = 0; i < shardsToAdd; i++) {
      const newShardId = currentShards + i;
      
      try {
        await this.manager._spawnShard(newShardId, this.manager.timeout);
        this.manager.logger.info(`Successfully spawned shard ${newShardId}`);
        
        await this._sleep(5000);
      } catch (error) {
        this.manager.logger.error(`Failed to spawn shard ${newShardId}:`, error);
      }
    }
  }
  
  async scaleDown(targetShards) {
    const currentShards = this.manager.shards.size;
    const shardsToRemove = currentShards - targetShards;
    
    const shardIds = Array.from(this.manager.shards.keys())
      .sort((a, b) => b - a)
      .slice(0, shardsToRemove);
    
    for (const shardId of shardIds) {
      try {
        await this.manager.processManager.killShard(shardId);
        this.manager.logger.info(`Successfully killed shard ${shardId}`);
        
        await this._sleep(2000);
      } catch (error) {
        this.manager.logger.error(`Failed to kill shard ${shardId}:`, error);
      }
    }
  }
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DynamicStrategy;