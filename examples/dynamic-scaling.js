const { ShardManager, strategies } = require('../src');
const path = require('path');

// Example with dynamic scaling
const manager = new ShardManager(path.join(__dirname, 'bot.js'), {
  token: process.env.DISCORD_TOKEN,
  adapter: 'discordjs',
  totalShards: 'auto',
  respawn: true
});

// Configure dynamic strategy
const dynamicStrategy = new strategies.DynamicStrategy(manager, {
  guildsPerShard: 1000,
  checkInterval: 300000, // 5 minutes
  scaleThreshold: 0.8,
  minShards: 1,
  maxShards: 16
});

manager.on('ready', async () => {
  console.log('Bot ready, starting dynamic scaling...');
  
  // Start automatic monitoring
  dynamicStrategy.startMonitoring();
  
  // Automatic statistics
  manager.statistics.startAutoCollect(60000);
});

manager.on('shardCreate', (shard) => {
  console.log(`Shard ${shard.id} created (Dynamic scaling)`);
});

// Signal management
process.on('SIGINT', async () => {
  dynamicStrategy.stopMonitoring();
  manager.statistics.stopAutoCollect();
  await manager.destroy();
  process.exit(0);
});

manager.spawn()
  .catch(console.error);