class TimeoutError extends Error {
  constructor(message, operation = null, timeout = null) {
    super(message);
    
    this.name = 'TimeoutError';
    this.operation = operation;
    this.timeout = timeout;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      timeout: this.timeout,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = TimeoutError;