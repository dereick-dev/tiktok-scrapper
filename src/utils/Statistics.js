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
        users: 0,
        channels: 0,
        ping: 0,
        memory: process.memoryUsage(),
        uptime: 0,
        ready: false,
        error: error.message
      };
    }
  }
  
  _addToHistory(stats) {
    this.history.push(stats);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
  
  getStats() {
    if (this.history.length === 0) {
      return null;
    }
    
    return this.history[this.history.length - 1];
  }
  
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }
  
  getAverageStats(duration = 60000) {
    const cutoff = Date.now() - duration;
    const relevantStats = this.history.filter(s => s.timestamp > cutoff);
    
    if (relevantStats.length === 0) {
      return null;
    }
    
    const averages = {
      guilds: 0,
      users: 0,
      channels: 0,
      memory: 0,
      ping: 0
    };
    
    for (const stat of relevantStats) {
      averages.guilds += stat.totals.guilds;
      averages.users += stat.totals.users;
      averages.channels += stat.totals.channels;
      averages.memory += stat.totals.memory;
      averages.ping += stat.totals.ping;
    }
    
    const count = relevantStats.length;
    
    return {
      guilds: Math.round(averages.guilds / count),
      users: Math.round(averages.users / count),
      channels: Math.round(averages.channels / count),
      memory: Math.round(averages.memory / count),
      ping: Math.round(averages.ping / count),
      samples: count
    };
  }
  
  getShardStats(shardId) {
    const latest = this.getStats();
    
    if (!latest || !latest.shards[shardId]) {
      return null;
    }
    
    return latest.shards[shardId];
  }
  
  getShardHistory(shardId, limit = 10) {
    return this.history
      .slice(-limit)
      .map(stat => ({
        timestamp: stat.timestamp,
        stats: stat.shards[shardId]
      }))
      .filter(s => s.stats);
  }
  
  getMemoryUsage() {
    const latest = this.getStats();
    
    if (!latest) {
      return null;
    }
    
    const formatted = {
      total: this._formatBytes(latest.totals.memory),
      perShard: {}
    };
    
    for (const [id, stats] of Object.entries(latest.shards)) {
      formatted.perShard[id] = this._formatBytes(stats.memory?.heapUsed || 0);
    }
    
    return formatted;
  }
  
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return {
      value: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
      unit: sizes[i],
      raw: bytes
    };
  }
  
  startAutoCollect(interval = 60000) {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
    }
    
    this.collectInterval = setInterval(() => {
      this.collectStats().catch(error => {
        this.manager.logger.error('Error collecting stats:', error);
      });
    }, interval);
    
    this.collectStats();
  }
  
  stopAutoCollect() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }
  }
  
  clear() {
    this.history = [];
  }
  
  export() {
    return {
      startTime: this.startTime,
      history: this.history,
      current: this.getStats()
    };
  }
  
  import(data) {
    if (data.startTime) {
      this.startTime = data.startTime;
    }
    
    if (data.history) {
      this.history = data.history;
    }
  }
}

module.exports = Statistics;