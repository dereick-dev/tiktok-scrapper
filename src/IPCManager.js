const EventEmitter = require('./events/EventEmitter');

class IPCManager extends EventEmitter {
  constructor(manager) {
    super();
    this.manager = manager;
    this._requests = new Map();
  }
  
  async broadcast(message) {
    const promises = [];
    
    for (const [id, shard] of this.manager.shards) {
      promises.push(
        shard.send({
          type: 'broadcast',
          message
        })
      );
    }
    
    return Promise.all(promises);
  }
  
  async sendTo(shardId, message) {
    const shard = this.manager.shards.get(shardId);
    
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }
    
    return shard.send(message);
  }
  
  async request(shardId, data, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      
      const timer = setTimeout(() => {
        this._requests.delete(id);
        reject(new Error('IPC request timeout'));
      }, timeout);
      
      this._requests.set(id, { resolve, reject, timer });
      
      this.sendTo(shardId, {
        type: 'request',
        id,
        data
      }).catch(reject);
    });
  }
  
  handleResponse(id, result, error) {
    const pending = this._requests.get(id);
    
    if (!pending) return;
    
    clearTimeout(pending.timer);
    this._requests.delete(id);
    
    if (error) {
      pending.reject(new Error(error));
    } else {
      pending.resolve(result);
    }
  }
  
  async fetchUser(userId) {
    const results = await Promise.all(
      Array.from(this.manager.shards.values()).map(shard =>
        shard.eval(`
          this.users.cache.get('${userId}') || 
          this.users.fetch('${userId}').catch(() => null)
        `)
      )
    );
    
    return results.find(r => r !== null);
  }
  
  async fetchGuild(guildId) {
    const results = await Promise.all(
      Array.from(this.manager.shards.values()).map(shard =>
        shard.eval(`this.guilds.cache.get('${guildId}')`)
      )
    );
    
    return results.find(r => r !== null);
  }
  
  async broadcastEval(script) {
    return this.manager.broadcastEval(script);
  }
}

module.exports = IPCManager;