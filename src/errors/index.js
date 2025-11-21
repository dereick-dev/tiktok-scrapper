const ShardError = require('./ShardError');
const AdapterError = require('./AdapterError');
const ClusterError = require('./ClusterError');
const IPCError = require('./IPCError');
const TimeoutError = require('./TimeoutError');

module.exports = {
  ShardError,
  AdapterError,
  ClusterError,
  IPCError,
  TimeoutError
};