class IPCError extends Error {
  constructor(message, details = null) {
    super(message);
    
    this.name = 'IPCError';
    this.details = details;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = IPCError;