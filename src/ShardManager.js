const EventEmitter = require('./events/EventEmitter');
const ProcessManager = require('./ProcessManager');
const IPCManager = require('./IPCManager');
const ShardCalculator = require('./utils/ShardCalculator');
const HealthChecker = require('./utils/HealthChecker');
const Statistics = require('./utils/Statistics');
const Logger = require('./utils/Logger');
const { ShardError } = require('./errors');

class ShardManager extends EventEmitter {
  constructor(file, options = {}) {
    super();
    
    if (!file) throw new ShardError('No file path provided');
    
    this.file = file;
    this.token = options.token || process.env.DISCORD_TOKEN;
    this.adapter = options.adapter || 'discordjs';
    this.totalShards = options.totalShards || 'auto';
    this.shardList = options.shardList || 'auto';
    this.mode = options.mode || 'process';
    this.respawn = options.respawn !== false;
    this.shardArgs = options.shardArgs || [];
    this.execArgv = options.execArgv || [];
    this.timeout = options.timeout || 30000;
    
    this.shards = new Map();
    this.processManager = new ProcessManager(this);
    this.ipcManager = new IPCManager(this);
    this.healthChecker = new HealthChecker(this);
    this.statistics = new Statistics(this);
    this.logger = new Logger(options.logLevel || 'info');
    
    this.shardCalculator = new ShardCalculator(this.token);
    
    this._queue = [];
    this._spawning = false;
  }
  
  async spawn(amount = this.totalShards, delay = 5500, timeout = this.timeout) {
    if (this._spawning) {
      throw new ShardError('Already spawning shards');
    }
    
    this._spawning = true;
    
    try {
      if (amount === 'auto') {
        this.logger.info('Calculating optimal shard count...');
        amount = await this.shardCalculator.getRecommendedShards();
        this.logger.info(`Recommended shards: ${amount}`);
      }
      
      this.totalShards = amount;
      
      let shardList = this.shardList;
      if (shardList === 'auto') {
        shardList = Array.from({ length: amount }, (_, i) => i);
      }
      
      this.logger.info(`Spawning ${shardList.length} shards...`);
      
      for (const shardId of shardList) {
        await this._spawnShard(shardId, timeout);
        
        if (shardList.indexOf(shardId) !== shardList.length - 1) {
          await this._sleep(delay);
        }
      }
      
      this.logger.info(`All ${shardList.length} shards spawned successfully`);
      this.emit('ready');
      
      this.healthChecker.start();
      
    } catch (error) {
      this.logger.error('Error spawning shards:', error);
      throw error;
    } finally {
      this._spawning = false;
    }
    
    return this.shards;
  }
  
  async _spawnShard(id, timeout) {
    const shard = await this.processManager.createShard(id, timeout);
    
    this.shards.set(id, shard);
    
    this.emit('shardCreate', shard);
    
    shard.on('ready', () => {
      this.logger.info(`Shard ${id} ready`);
      this.emit('shardReady', id);
    });
    
    shard.on('disconnect', () => {
      this.logger.warn(`Shard ${id} disconnected`);
      this.emit('shardDisconnect', id);
    });
    
    shard.on('reconnecting', () => {
      this.logger.info(`Shard ${id} reconnecting`);
      this.emit('shardReconnecting', id);
    });
    
    shard.on('death', () => {
      this.logger.error(`Shard ${id} died`);
      this.emit('shardDeath', id);
      
      if (this.respawn) {
        this.respawnShard(id);
      }
    });
    
    shard.on('error', (error) => {
      this.logger.error(`Shard ${id} error:`, error);
      this.emit('shardError', error, id);
    });
    
    return shard;
  }
  
  async respawnShard(id) {
    this.logger.info(`Respawning shard ${id}...`);
    
    const shard = this.shards.get(id);
    if (shard) {
      await shard.kill();
      this.shards.delete(id);
    }
    
    await this._sleep(5000);
    await this._spawnShard(id, this.timeout);
    
    return this.shards.get(id);
  }
  
  async respawnAll(shardDelay = 5500, respawnDelay = 500, timeout = this.timeout) {
    this.logger.info('Respawning all shards...');
    
    const shardIds = Array.from(this.shards.keys());
    
    for (const id of shardIds) {
      await this.respawnShard(id);
      await this._sleep(shardDelay);
    }
    
    this.logger.info('All shards respawned');
    return this.shards;
  }
  
  async broadcast(message) {
    const promises = [];
    
    for (const [id, shard] of this.shards) {
      promises.push(shard.eval(message));
    }
    
    return Promise.all(promises);
  }
  
  async broadcastEval(script) {
    if (typeof script !== 'string' && typeof script !== 'function') {
      throw new ShardError('Script must be a string or function');
    }
    
    const scriptStr = typeof script === 'function' ? `(${script})(this)` : script;
    
    const promises = [];
    for (const [id, shard] of this.shards) {
      promises.push(shard.eval(scriptStr));
    }
    
    return Promise.all(promises);
  }
  
  async fetchClientValues(prop) {
    const results = await this.broadcastEval(`this.${prop}`);
    return results;
  }
  
  getStats() {
    return this.statistics.getStats();
  }
  
  getShard(id) {
    return this.shards.get(id);
  }
  
  async destroy() {
    this.logger.info('Destroying shard manager...');
    
    this.healthChecker.stop();
    
    const promises = [];
    for (const [id, shard] of this.shards) {
      promises.push(shard.kill());
    }
    
    await Promise.all(promises);
    this.shards.clear();
    
    this.logger.info('Shard manager destroyed');
  }
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ShardManager;