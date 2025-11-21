const EventEmitter = require('./events/EventEmitter');
const ShardManager = require('./ShardManager');
const Logger = require('./utils/Logger');

class ClusterManager extends EventEmitter {
  constructor(file, options = {}) {
    super();
    
    this.file = file;
    this.options = options;
    this.clusters = new Map();
    this.shardsPerCluster = options.shardsPerCluster || 2;
    this.totalShards = options.totalShards || 'auto';
    this.logger = new Logger('ClusterManager');
  }
  
  async spawn() {
    let totalShards = this.totalShards;
    
    if (totalShards === 'auto') {
      const ShardCalculator = require('./utils/ShardCalculator');
      const calculator = new ShardCalculator(this.options.token);
      totalShards = await calculator.getRecommendedShards();
    }
    
    const clusterCount = Math.ceil(totalShards / this.shardsPerCluster);
    
    this.logger.info(`Spawning ${clusterCount} clusters with ${totalShards} total shards`);
    
    for (let i = 0; i < clusterCount; i++) {
      const startShard = i * this.shardsPerCluster;
      const endShard = Math.min(startShard + this.shardsPerCluster, totalShards);
      const shardList = Array.from(
        { length: endShard - startShard },
        (_, idx) => startShard + idx
      );
      
      await this._spawnCluster(i, shardList, totalShards);
      
      if (i < clusterCount - 1) {
        await this._sleep(5000);
      }
    }
    
    this.emit('ready');
  }
  
  async _spawnCluster(id, shardList, totalShards) {
    this.logger.info(`Spawning cluster ${id} with shards ${shardList.join(', ')}`);
    
    const manager = new ShardManager(this.file, {
      ...this.options,
      totalShards,
      shardList
    });
    
    manager.on('shardReady', (shardId) => {
      this.emit('shardReady', id, shardId);
    });
    
    manager.on('shardError', (error, shardId) => {
      this.emit('shardError', error, id, shardId);
    });
    
    await manager.spawn();
    
    this.clusters.set(id, manager);
    this.emit('clusterReady', id);
    
    return manager;
  }
  
  async broadcast(message) {
    const promises = [];
    
    for (const [id, manager] of this.clusters) {
      promises.push(manager.broadcast(message));
    }
    
    return Promise.all(promises);
  }
  
  async broadcastEval(script) {
    const promises = [];
    
    for (const [id, manager] of this.clusters) {
      promises.push(manager.broadcastEval(script));
    }
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  getCluster(id) {
    return this.clusters.get(id);
  }
  
  getAllShards() {
    const allShards = new Map();
    
    for (const [clusterId, manager] of this.clusters) {
      for (const [shardId, shard] of manager.shards) {
        allShards.set(shardId, { shard, clusterId });
      }
    }
    
    return allShards;
  }
  
  async respawnCluster(id) {
    const manager = this.clusters.get(id);
    
    if (!manager) {
      throw new Error(`Cluster ${id} not found`);
    }
    
    await manager.respawnAll();
  }
  
  async destroy() {
    this.logger.info('Destroying all clusters...');
    
    const promises = [];
    for (const [id, manager] of this.clusters) {
      promises.push(manager.destroy());
    }
    
    await Promise.all(promises);
    this.clusters.clear();
    
    this.logger.info('All clusters destroyed');
  }
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ClusterManager;