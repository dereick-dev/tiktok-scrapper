const { ShardManager } = require('../src');
const path = require('path');

// Example with eris
const manager = new ShardManager(path.join(__dirname, 'bot-eris.js'), {
  token: process.env.DISCORD_TOKEN,
  adapter: 'eris',
  totalShards: 'auto',
  mode: 'process',
  respawn: true,
  timeout: 60000
});

manager.on('shardCreate', (shard) => {
  console.log(`[MANAGER] Shard ${shard.id} spawned`);
});

manager.on('shardReady', (id) => {
  console.log(`[MANAGER] Shard ${id} ready`);
});

manager.on('shardError', (error, id) => {
  console.error(`[MANAGER] Shard ${id} error:`, error.message);
});

manager.on('ready', async () => {
  console.log('[MANAGER] All shards online');
  
  // IPC example - broadcast message
  await manager.ipcManager.broadcast({
    type: 'announcement',
    message: 'All shards are now online!'
  });
  
  // Get stats
  setInterval(async () => {
    const stats = manager.getStats();
    if (stats) {
      console.log('=== Bot Statistics ===');
      console.log(`Guilds: ${stats.totals.guilds}`);
      console.log(`Users: ${stats.totals.users}`);
      console.log(`Channels: ${stats.totals.channels}`);
      console.log(`Average Ping: ${stats.totals.ping}ms`);
      console.log(`Memory: ${Math.round(stats.totals.memory / 1024 / 1024)}MB`);
      console.log('=====================');
    }
  }, 300000); // Every 5 minutes
});

// Spawn with custom delay between shards
manager.spawn('auto', 7000)
  .catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await manager.destroy();
  process.exit(0);
});