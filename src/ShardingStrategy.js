class ShardingStrategy {
  constructor(manager) {
    this.manager = manager;
  }
  
  calculate() {
    throw new Error('ShardingStrategy.calculate() must be implemented');
  }
  
  distribute(shardCount) {
    throw new Error('ShardingStrategy.distribute() must be implemented');
  }
}

module.exports = ShardingStrategy;