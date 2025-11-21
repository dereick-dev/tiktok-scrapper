const BaseAdapter = require('./BaseAdapter');

class DiscordJSAdapter extends BaseAdapter {
  constructor(options = {}) {
    const { Client, GatewayIntentBits, Partials } = require('discord.js');
    
    const client = new Client({
      intents: options.intents || [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: options.partials || [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
      ],
      shards: options.shardId !== undefined ? [options.shardId] : 'auto',
      shardCount: options.shardCount || 'auto'
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
    
    this.client.on('shardDisconnect', () => {
      this.ready = false;
      this._sendMessage({ type: 'disconnect' });
    });
    
    this.client.on('shardReconnecting', () => {
      this._sendMessage({ type: 'reconnecting' });
    });
    
    this.client.on('shardError', (error) => {
      this._sendMessage({ type: 'error', error: error.message });
    });
    
    this.client.on('shardResume', () => {
      this.ready = true;
      this._sendMessage({ type: 'ready' });
    });
  }
  
  async connect() {
    this.validateToken(this.token);
    
    try {
      await this.client.login(this.token);
      return this.client;
    } catch (error) {
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }
  
  async disconnect() {
    this.ready = false;
    await this.client.destroy();
  }
  
  getGuildCount() {
    return this.client.guilds.cache.size;
  }
  
  getUserCount() {
    return this.client.users.cache.size;
  }
  
  getChannelCount() {
    return this.client.channels.cache.size;
  }
  
  getUptime() {
    return this.client.uptime;
  }
  
  getPing() {
    return this.client.ws.ping;
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
    this.client.on('shardDisconnect', callback);
  }
  
  onReconnecting(callback) {
    this.client.on('shardReconnecting', callback);
  }
  
  onError(callback) {
    this.client.on('shardError', callback);
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

module.exports = DiscordJSAdapter;