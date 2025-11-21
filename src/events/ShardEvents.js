const EventEmitter = require('./EventEmitter');

class ShardEvents extends EventEmitter {
  constructor() {
    super();
    
    this.eventTypes = {
      SHARD_CREATE: 'shardCreate',
      SHARD_READY: 'shardReady',
      SHARD_DISCONNECT: 'shardDisconnect',
      SHARD_RECONNECTING: 'shardReconnecting',
      SHARD_DEATH: 'shardDeath',
      SHARD_ERROR: 'shardError',
      SHARD_RESUME: 'shardResume',
      SHARD_MESSAGE: 'shardMessage',
      
      MANAGER_READY: 'ready',
      MANAGER_ERROR: 'error',
      
      CLUSTER_CREATE: 'clusterCreate',
      CLUSTER_READY: 'clusterReady',
      CLUSTER_ERROR: 'clusterError',
      
      HEALTH_CHECK: 'healthCheck',
      STATS_UPDATE: 'statsUpdate'
    };
  }
  
  onShardCreate(callback) {
    this.on(this.eventTypes.SHARD_CREATE, callback);
  }
  
  onShardReady(callback) {
    this.on(this.eventTypes.SHARD_READY, callback);
  }
  
  onShardDisconnect(callback) {
    this.on(this.eventTypes.SHARD_DISCONNECT, callback);
  }
  
  onShardReconnecting(callback) {
    this.on(this.eventTypes.SHARD_RECONNECTING, callback);
  }
  
  onShardDeath(callback) {
    this.on(this.eventTypes.SHARD_DEATH, callback);
  }
  
  onShardError(callback) {
    this.on(this.eventTypes.SHARD_ERROR, callback);
  }
  
  onShardResume(callback) {
    this.on(this.eventTypes.SHARD_RESUME, callback);
  }
  
  onShardMessage(callback) {
    this.on(this.eventTypes.SHARD_MESSAGE, callback);
  }
  
  onManagerReady(callback) {
    this.on(this.eventTypes.MANAGER_READY, callback);
  }
  
  onManagerError(callback) {
    this.on(this.eventTypes.MANAGER_ERROR, callback);
  }
  
  onClusterCreate(callback) {
    this.on(this.eventTypes.CLUSTER_CREATE, callback);
  }
  
  onClusterReady(callback) {
    this.on(this.eventTypes.CLUSTER_READY, callback);
  }
  
  onClusterError(callback) {
    this.on(this.eventTypes.CLUSTER_ERROR, callback);
  }
  
  onHealthCheck(callback) {
    this.on(this.eventTypes.HEALTH_CHECK, callback);
  }
  
  onStatsUpdate(callback) {
    this.on(this.eventTypes.STATS_UPDATE, callback);
  }
  
  emitShardCreate(shard) {
    this.emit(this.eventTypes.SHARD_CREATE, shard);
  }
  
  emitShardReady(shardId) {
    this.emit(this.eventTypes.SHARD_READY, shardId);
  }
  
  emitShardDisconnect(shardId) {
    this.emit(this.eventTypes.SHARD_DISCONNECT, shardId);
  }
  
  emitShardReconnecting(shardId) {
    this.emit(this.eventTypes.SHARD_RECONNECTING, shardId);
  }
  
  emitShardDeath(shardId) {
    this.emit(this.eventTypes.SHARD_DEATH, shardId);
  }
  
  emitShardError(error, shardId) {
    this.emit(this.eventTypes.SHARD_ERROR, error, shardId);
  }
  
  emitShardResume(shardId) {
    this.emit(this.eventTypes.SHARD_RESUME, shardId);
  }
  
  emitShardMessage(message, shardId) {
    this.emit(this.eventTypes.SHARD_MESSAGE, message, shardId);
  }
  
  emitManagerReady() {
    this.emit(this.eventTypes.MANAGER_READY);
  }
  
  emitManagerError(error) {
    this.emit(this.eventTypes.MANAGER_ERROR, error);
  }
  
  emitClusterCreate(clusterId) {
    this.emit(this.eventTypes.CLUSTER_CREATE, clusterId);
  }
  
  emitClusterReady(clusterId) {
    this.emit(this.eventTypes.CLUSTER_READY, clusterId);
  }
  
  emitClusterError(error, clusterId) {
    this.emit(this.eventTypes.CLUSTER_ERROR, error, clusterId);
  }
  
  emitHealthCheck(results) {
    this.emit(this.eventTypes.HEALTH_CHECK, results);
  }
  
  emitStatsUpdate(stats) {
    this.emit(this.eventTypes.STATS_UPDATE, stats);
  }
  
  getAllEventTypes() {
    return Object.values(this.eventTypes);
  }
}

module.exports = ShardEvents;