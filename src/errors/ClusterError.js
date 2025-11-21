class ClusterError extends Error {
  constructor(message, clusterId = null) {
    super(message);
    
    this.name = 'ClusterError';
    this.clusterId = clusterId;
    this.timestamp = new Date();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      clusterId: this.clusterId,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = ClusterError;