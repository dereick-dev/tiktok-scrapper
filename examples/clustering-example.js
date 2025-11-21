const { ClusterManager } = require('../src');
const path = require('path');

// Example with clustering
const clusterManager = new ClusterManager(path.join(__dirname, 'bot.js'), {
  token: process.env.DISCORD_TOKEN,
  adapter: 'discordjs',
  totalShards: 'auto',
  shardsPerCluster: 2,
  mode: 'process',
  respawn: true
});

clusterManager.on('clusterCreate', (id) => {
  console.log(`[CLUSTER MANAGER] Cluster ${id} created`);
});

clusterManager.on('clusterReady', (id) => {
  console.log(`[CLUSTER MANAGER] Cluster ${id} ready`);
});

clusterManager.on('shardReady', (clusterId, shardId) => {
  console.log(`[CLUSTER ${clusterId}] Shard ${shardId} ready`);
});

clusterManager.on('shardError', (error, clusterId, shardId) => {
  console.error(`[CLUSTER ${clusterId}] Shard ${shardId} error:`, error.message);
});

clusterManager.on('ready', async () => {
  console.log('[CLUSTER MANAGER] All clusters ready');
  
  // Get all shards across all clusters
  const allShards = clusterManager.getAllShards();
  console.log(`Total shards across clusters: ${allShards.size}`);
  
  // Broadcast to all clusters
  const results = await clusterManager.broadcastEval('this.guilds.cache.size');
  const totalGuilds = results.reduce((acc, val) => acc + val, 0);
  console.log(`Total guilds across all clusters: ${totalGuilds}`);
  
  // Get specific cluster
  const cluster0 = clusterManager.getCluster(0);
  if (cluster0) {
    console.log(`Cluster 0 has ${cluster0.shards.size} shards`);
  }
});

clusterManager.spawn()
  .then(() => console.log('All clusters spawned'))
  .catch(console.error);