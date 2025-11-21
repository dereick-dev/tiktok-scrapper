class Statistics {
  constructor(manager) {
    this.manager = manager;
    this.startTime = Date.now();
    this.history = [];
    this.maxHistorySize = 100;
  }
  
  async collectStats() {
    const stats = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      shards: {},
      totals: {
        guilds: 0,
        users: 0,
        channels: 0,
        memory: 0,
        ping: 0
      }
    };
    
    const promises = [];
    
    for (const [id, shard] of this.manager.shards) {
      promises.push(
        this._collectShardStats(shard).then(shardStats => {
          stats.shards[id] = shardStats;
          
          stats.totals.guilds += shardStats.guilds || 0;
          stats.totals.users += shardStats.users || 0;
          stats.totals.channels += shardStats.channels || 0;
          stats.totals.memory += shardStats.memory?.heapUsed || 0;
          stats.totals.ping += shardStats.ping || 0;
        })
      );
    }
    
    await Promise.all(promises);
    
    const shardCount = this.manager.shards.size;
    if (shardCount > 0) {
      stats.totals.ping = Math.round(stats.totals.ping / shardCount);
    }
    
    this._addToHistory(stats);
    
    return stats;
  }
  
  async _collectShardStats(shard) {
    try {
      const result = await shard.eval(`({
        guilds: this.guilds?.cache?.size || this.guilds?.size || 0,
        users: this.users?.cache?.size || this.users?.size || 0,
        channels: this.channels?.cache?.size || 0,
        ping: this.ws?.ping || this.shards?.get(0)?.latency || 0,
        memory: process.memoryUsage(),
        uptime: this.uptime || 0,
        ready: this.isReady?.() || this.ready || false
      })`);
      
      return result;
    } catch (error) {
      this.manager.logger.error(`Failed to collect stats for shard ${shard.id}:`, error.message);
      return {
        guilds: 0,
        users