const EventEmitter = require('../events/EventEmitter');

class HealthChecker extends EventEmitter {
  constructor(manager, options = {}) {
    super();
    
    this.manager = manager;
    this.interval = options.interval || 30000;
    this.timeout = options.timeout || 10000;
    this.maxFailures = options.maxFailures || 3;
    
    this.failures = new Map();
    this.intervalId = null;
    this.checking = false;
  }
  
  start() {
    if (this.intervalId) {
      return;
    }
    
    this.manager.logger.info('Health checker started');
    
    this.intervalId = setInterval(() => {
      this.check();
    }, this.interval);
    
    this.check();
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.manager.logger.info('Health checker stopped');
    }
  }
  
  async check() {
    if (this.checking) return;
    
    this.checking = true;
    
    try {
      for (const [id, shard] of this.manager.shards) {
        await this._checkShard(id, shard);
      }
    } catch (error) {
      this.manager.logger.error('Health check error:', error);
    } finally {
      this.checking = false;
    }
  }
  
  async _checkShard(id, shard) {
    try {
      const startTime = Date.now();
      
      await Promise.race([
        shard.eval('Date.now()'),
        this._timeout(this.timeout)
      ]);
      
      const responseTime = Date.now() - startTime;
      
      this.failures.delete(id);
      
      this.emit('shardHealthy', id, responseTime);
      
      if (responseTime > 5000) {
        this.manager.logger.warn(`Shard ${id} slow response: ${responseTime}ms`);
        this.emit('shardSlow', id, responseTime);
      }
      
    } catch (error) {
      const failureCount = (this.failures.get(id) || 0) + 1;
      this.failures.set(id, failureCount);
      
      this.manager.logger.warn(`Shard ${id} health check failed (${failureCount}/${this.maxFailures})`);
      this.emit('shardUnhealthy', id, failureCount);
      
      if (failureCount >= this.maxFailures) {
        this.manager.logger.error(`Shard ${id} exceeded max failures, triggering respawn`);
        this.emit('shardDead', id);
        
        if (this.manager.respawn) {
          await this.manager.respawnShard(id);
        }
      }
    }
  }
  
  _timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), ms);
    });
  }
  
  getShardHealth(id) {
    return {
      failures: this.failures.get(id) || 0,
      healthy: !this.failures.has(id) || this.failures.get(id) < this.maxFailures
    };
  }
  
  getAllHealth() {
    const health = {};
    
    for (const [id] of this.manager.shards) {
      health[id] = this.getShardHealth(id);
    }
    
    return health;
  }
  
  reset(shardId) {
    if (shardId !== undefined) {
      this.failures.delete(shardId);
    } else {
      this.failures.clear();
    }
  }
}

module.exports = HealthChecker;