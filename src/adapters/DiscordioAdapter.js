const BaseAdapter = require('./BaseAdapter');

class DiscordioAdapter extends BaseAdapter {
  constructor(options = {}) {
    const DiscordIO = require('discord.io');
    
    const client = new DiscordIO({
      token: options.token || process.env.DISCORD_TOKEN,
      autorun: false
    });
    
    super(client);
    
    this.token = options.token || process.env.DISCORD_TOKEN;
    this.shardId = options.shardId;
    this.shardCount = options.shardCount;
    this.connectedAt = null;
    
    this._setupListeners();
  }
  
  _setupListeners() {
    this.client.on('ready', () => {
      this.ready = true;
      this.connectedAt = Date.now();
      this._sendMessage({ type: 'ready' });
    });
    
    this.client.on('disconnect', () => {
      this.ready = false;
      this._sendMessage({ type: 'disconnect' });
    });
    
    this.client.on('error', (error) => {
      this._sendMessage({ type: 'error', error: error.message });
    });
  }
  
  async connect() {
    this.validateToken(this.token);
    
    return new Promise((resolve, reject) => {
      this.client.connect();
      
      this.client.once('ready', () => {
        resolve(this.client);
      });
      
      this.client.once('disconnect', () => {
        reject(new Error('Failed to connect'));
      });
      
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 30000);
    });
  }
  
  async disconnect() {
    this.ready = false;
    this.client.disconnect();
  }
  
  getGuildCount() {
    return Object.keys(this.client.servers || {}).length;
  }
  
  getUserCount() {
    return Object.keys(this.client.users || {}).length;
  }
  
  getChannelCount() {
    let count = 0;
    const servers = this.client.servers || {};
    
    for (const serverId in servers) {
      const server = servers[serverId];
      count += Object.keys(server.channels || {}).length;
    }
    
    return count;
  }
  
  getUptime() {
    if (!this.connectedAt) return 0;
    return Date.now() - this.connectedAt;
  }
  
  getPing() {
    // discord.io no tiene ping directo, estimamos basado en heartbeat
    return this.client._lastHeartbeat ? Date.now() - this.client._lastHeartbeat : 0;
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
    // discord.io no tiene evento de reconnecting específico
    this.client.on('disconnect', callback);
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

module.exports = DiscordioAdapter;