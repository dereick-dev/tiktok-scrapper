class BaseAdapter {
  constructor(client) {
    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter is an abstract class and cannot be instantiated directly');
    }
    
    this.client = client;
    this.ready = false;
  }
  
  async connect() {
    throw new Error('connect() must be implemented by adapter');
  }
  
  async disconnect() {
    throw new Error('disconnect() must be implemented by adapter');
  }
  
  getGuildCount() {
    throw new Error('getGuildCount() must be implemented by adapter');
  }
  
  getUserCount() {
    throw new Error('getUserCount() must be implemented by adapter');
  }
  
  getChannelCount() {
    throw new Error('getChannelCount() must be implemented by adapter');
  }
  
  getUptime() {
    throw new Error('getUptime() must be implemented by adapter');
  }
  
  getMemoryUsage() {
    return process.memoryUsage();
  }
  
  getPing() {
    throw new Error('getPing() must be implemented by adapter');
  }
  
  eval(script) {
    throw new Error('eval() must be implemented by adapter');
  }
  
  onReady(callback) {
    throw new Error('onReady() must be implemented by adapter');
  }
  
  onDisconnect(callback) {
    throw new Error('onDisconnect() must be implemented by adapter');
  }
  
  onReconnecting(callback) {
    throw new Error('onReconnecting() must be implemented by adapter');
  }
  
  onError(callback) {
    throw new Error('onError() must be implemented by adapter');
  }
  
  validateToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }
    
    if (token.length < 50) {
      throw new Error('Token is too short to be valid');
    }
    
    return true;
  }
}

module.exports = BaseAdapter;