const AutoStrategy = require('./AutoStrategy');
const ManualStrategy = require('./ManualStrategy');
const DynamicStrategy = require('./DynamicStrategy');
const ClusterStrategy = require('./ClusterStrategy');

module.exports = {
  AutoStrategy,
  ManualStrategy,
  DynamicStrategy,
  ClusterStrategy,
  
  getStrategy(name, manager, options) {
    const strategies = {
      auto: AutoStrategy,
      manual: ManualStrategy,
      dynamic: DynamicStrategy,
      cluster: ClusterStrategy
    };
    
    const StrategyClass = strategies[name.toLowerCase()];
    
    if (!StrategyClass) {
      throw new Error(
        `Unknown strategy: ${name}. Available: ${Object.keys(strategies).join(', ')}`
      );
    }
    
    return new StrategyClass(manager, options);
  }
};