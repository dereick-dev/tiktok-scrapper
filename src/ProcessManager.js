const Shard = require('./Shard');
const Logger = require('./utils/Logger');

class ProcessManager {
  constructor(manager) {
    this.manager = manager;
    this.logger = new Logger('ProcessManager');
  }
  
  async createShard(id, timeout) {
    const shard = new Shard(this.manager, id);
    
    try {
      await shard.spawn(timeout);
      return shard;
    } catch (error) {
      this.logger.error(`Failed to create shard ${id}:`, error);
      throw error;
    }
  }
  
  async killShard(id) {
    const shard = this.manager.shards.get(id);
    
    if (!shard) {
      throw new Error(`Shard ${id} not found`);
    }
    
    await shard.kill();
    this.manager.shards.delete(id);
  }
  
  async respawnShard(id, delay = 500, timeout = 30000) {
    const shard = this.manager.shards.get(id);
    
    if (!shard) {
      throw new Error(`Shard ${id} not found`);
    }
    
    await shard.respawn(delay, timeout);
    return shard;
  }
  
  getMemoryUsage() {
    const usage = {};
    
    for (const [id, shard] of this.manager.shards) {
      if (shard.process) {
        usage[id] = process.memoryUsage();
      }
    }
    
    return usage;
  }
  
  getShardsByMemory() {
    const usage = this.getMemoryUsage();
    
    return Object.entries(usage)
      .sort((a, b) => b[1].heapUsed - a[1].heapUsed)
      .map(([id]) => parseInt(id));
  }
}

module.exports = ProcessManager;