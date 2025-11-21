const ShardManager = require('./ShardManager');
const Shard = require('./Shard');
const ShardingStrategy = require('./ShardingStrategy');
const ProcessManager = require('./ProcessManager');
const IPCManager = require('./IPCManager');
const ClusterManager = require('./ClusterManager');

const adapters = require('./adapters');

const Logger = require('./utils/Logger');
const RateLimiter = require('./utils/RateLimiter');
const ShardCalculator = require('./utils/ShardCalculator');
const HealthChecker = require('./utils/HealthChecker');
const Statistics = require('./utils/Statistics');

const EventEmitter = require('./events/EventEmitter');
const ShardEvents = require('./events/ShardEvents');

const strategies = require('./strategies');

const errors = require('./errors');

module.exports = {
  ShardManager,
  Shard,
  ShardingStrategy,
  ProcessManager,
  IPCManager,
  ClusterManager,
  
  adapters,
  
  Logger,
  RateLimiter,
  ShardCalculator,
  HealthChecker,
  Statistics,
  
  EventEmitter,
  ShardEvents,
  
  strategies,
  
  errors,
  
  version: require('../package.json').version
};