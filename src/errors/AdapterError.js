class AdapterError extends Error {
  constructor(message, adapter = null) {
    super(message);
    
    this.name = 'AdapterError';
    this.adapter = adapter;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      adapter: this.adapter,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = AdapterError;