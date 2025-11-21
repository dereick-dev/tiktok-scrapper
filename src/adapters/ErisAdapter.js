const BaseAdapter = require('./BaseAdapter');

class ErisAdapter extends BaseAdapter {
  constructor(options = {}) {
    const Eris = require('eris');
    
    const client = new Eris(options.token || process.env.DISCORD_TOKEN, {
      intents: options.intents || [
        'guilds',
        'guildMessages',
        'guildMembers'
      ],
      firstShardID: options.shardId || 0,
      lastShardID: options.shardId || 0,
      maxShards: options.shardCount || 'auto',
      getAllUsers: options.getAllUsers || false,
      messageLimit: options.messageLimit || 100,
      restMode: options.restMode || false
    });
    
    super(client);
    
    this.token = options.token || process.env.DISCORD_TOKEN;
    this.shardId = options.shardId;
    this.shardCount = options.shardCount;
    
    this._setupListeners();
  }
  
  _setupListeners() {
    this.client.on('ready', () => {
      this.ready = true;
      this._sendMessage({ type: 'ready' });
    });
    
    this.client.on('disconnect', () => {
      this.ready = false;
      this._sendMessage({ type: 'disconnect' });
    });
    
    this.client.on('shardReady', (id) => {
      this._sendMessage({ type: 'shardReady', shardId: id });
    });
    
    this.client.on('shardDisconnect', (error, id) => {
      this._sendMessage({ type: 'shardDisconnect', shardId: id });
    });
    
    this.client.on('shardResume', (id) => {
      this._sendMessage({ type: 'shardResume', shardId: id });
    });
    
    this.client.on('error', (error) => {
      this._sendMessage({ type: 'error', error: error.message });
    });
  }
  
  async connect() {
    this.validateToken(this.token);
    
    try {
      await this.client.connect();
      return this.client;
    } catch (error) {
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }
  
  async disconnect() {
    this.ready = false;
    this.client.disconnect({ reconnect: false });
  }
  
  getGuildCount() {
    return this.client.guilds.size;
  }
  
  getUserCount() {
    return this.client.users.size;
  }
  
  getChannelCount() {
    let count = 0;
    for (const guild of this.client.guilds.values()) {
      count += guild.channels.size;
    }
    return count;
  }
  
  getUptime() {
    return this.client.uptime;
  }
  
  getPing() {
    const shards = this.client.shards;
    if (shards.size === 0) return 0;
    
    let totalLatency = 0;
    for (const shard of shards.values()) {
      totalLatency += shard.latency;
    }
    
    return Math.round(totalLatency / shards.size);
  }
  
  async eval(script) {
    try {
      let result;
      
      if (typeof script === 'function') {
        result = await script(this.client);
      } else {
        result = await eval(script);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Eval error: ${error.message}`);
    }
  }
  
  onReady(callback) {
    this.client.once('ready', callback);
  }
  
  onDisconnect(callback) {
    this.client.on('disconnect', callback);
  }
  
  onReconnecting(callback) {
    this.client.on('shardDisconnect', callback);
  }
  
  onError(callback) {
    this.client.on('error', callback);
  }
  
  getStats() {
    return {
      guilds: this.getGuildCount(),
      users: this.getUserCount(),
      channels: this.getChannelCount(),
      uptime: this.getUptime(),
      ping: this.getPing(),
      memory: this.getMemoryUsage(),
      shardId: this.shardId,
      ready: this.ready
    };
  }
  
  _sendMessage(message) {
    if (process.send) {
      process.send(message);
    }
  }
}

module.exports = ErisAdapter;