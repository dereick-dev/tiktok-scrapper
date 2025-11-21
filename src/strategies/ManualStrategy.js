const ShardingStrategy = require('../ShardingStrategy');

class ManualStrategy extends ShardingStrategy {
  constructor(manager, options = {}) {
    super(manager);
    
    this.shardCount = options.shardCount || 1;
    this.shardList = options.shardList || null;
  }
  
  calculate() {
    this.manager.logger.info(`Manual strategy using ${this.shardCount} shards`);
    return this.shardCount;
  }
  
  distribute(shardCount) {
    if (this.shardList && Array.isArray(this.shardList)) {
      this.manager.logger.info(`Using custom shard list: ${this.shardList.join(', ')}`);
      return this.shardList;
    }
    
    return Array.from({ length: shardCount }, (_, i) => i);
  }
  
  setShardCount(count) {
    if (count < 1) {
      throw new Error('Shard count must be at least 1');
    }
    
    this.shardCount = count;
    this.manager.logger.info(`Shard count updated to ${count}`);
  }
  
  setShardList(list) {
    if (!Array.isArray(list)) {
      throw new Error('Shard list must be an array');
    }
    
    this.shardList = list;
    this.manager.logger.info(`Shard list updated: ${list.join(', ')}`);
  }
  
  addShard(shardId) {
    if (!this.shardList) {
      this.shardList = this.distribute(this.shardCount);
    }
    
    if (!this.shardList.includes(shardId)) {
      this.shardList.push(shardId);
      this.manager.logger.info(`Added shard ${shardId} to list`);
    }
  }
  
  removeShard(shardId) {
    if (!this.shardList) {
      return;
    }
    
    const index = this.shardList.indexOf(shardId);
    if (index > -1) {
      this.shardList.splice(index, 1);
      this.manager.logger.info(`Removed shard ${shardId} from list`);
    }
  }
}

module.exports = ManualStrategy;