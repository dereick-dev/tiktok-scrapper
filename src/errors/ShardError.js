class ShardError extends Error {
  constructor(message, shardId = null) {
    super(message);
    
    this.name = 'ShardError';
    this.shardId = shardId;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      shardId: this.shardId,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = ShardError;