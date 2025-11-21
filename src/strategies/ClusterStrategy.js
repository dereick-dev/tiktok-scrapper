const ShardingStrategy = require('../ShardingStrategy');

class ClusterStrategy extends ShardingStrategy {
  constructor(manager, options = {}) {
    super(manager);
    
    this.shardsPerCluster = options.shardsPerCluster || 2;
    this.minClusters = options.minClusters || 1;
    this.maxClusters = options.maxClusters || 8;
  }
  
  async calculate() {
    const totalShards = await this.manager.shardCalculator.getRecommendedShards();
    
    const clusterCount = Math.max(
      this.minClusters,
      Math.min(
        Math.ceil(totalShards / this.shardsPerCluster),
        this.maxClusters
      )
    );
    
    this.manager.logger.info(
      `Cluster strategy: ${clusterCount} clusters with ${totalShards} total shards`
    );
    
    return totalShards;
  }
  
  distribute(totalShards) {
    const clusterCount = Math.ceil(totalShards / this.shardsPerCluster);
    const distribution = [];
    
    for (let i = 0; i < clusterCount; i++) {
      const startShard = i * this.shardsPerCluster;
      const endShard = Math.min(startShard + this.shardsPerCluster, totalShards);
      
      const clusterShards = [];
      for (let j = startShard; j < endShard; j++) {
        clusterShards.push(j);
      }
      
      distribution.push({
        clusterId: i,
        shards: clusterShards
      });
    }
    
    return distribution;
  }
  
  getClusterForShard(shardId) {
    return Math.floor(shardId / this.shardsPerCluster);
  }
  
  getShardsForCluster(clusterId) {
    const startShard = clusterId * this.shardsPerCluster;
    const endShard = startShard + this.shardsPerCluster;
    
    return Array.from(
      { length: this.shardsPerCluster },
      (_, i) => startShard + i
    );
  }
  
  balanceLoad(clusterStats) {
    const balanced = [];
    
    const sortedClusters = Object.entries(clusterStats)
      .sort((a, b) => b[1].load - a[1].load);
    
    for (const [clusterId, stats] of sortedClusters) {
      balanced.push({
        clusterId: parseInt(clusterId),
        load: stats.load,
        shards: stats.shards,
        recommendation: this._getLoadRecommendation(stats.load)
      });
    }
    
    return balanced;
  }
  
  _getLoadRecommendation(load) {
    if (load > 0.8) {
      return 'high_load_consider_splitting';
    } else if (load < 0.3) {
      return 'low_load_consider_merging';
    } else {
      return 'optimal';
    }
  }
  
  async redistributeShards(targetClusters) {
    const currentShards = Array.from(this.manager.shards.keys());
    const shardsPerCluster = Math.ceil(currentShards.length / targetClusters);
    
    const newDistribution = [];
    
    for (let i = 0; i < targetClusters; i++) {
      const startIdx = i * shardsPerCluster;
      const endIdx = Math.min(startIdx + shardsPerCluster, currentShards.length);
      
      newDistribution.push({
        clusterId: i,
        shards: currentShards.slice(startIdx, endIdx)
      });
    }
    
    return newDistribution;
  }
}

module.exports = ClusterStrategy;