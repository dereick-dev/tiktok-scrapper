const { ShardManager } = require('../src');

// Example basic to use auto-sharding
const manager = new ShardManager('./bot.js', {
  token: process.env.DISCORD_TOKEN,
  totalShards: 'auto',
  mode: 'process',
  respawn: true
});

// Hear events
manager.on('shardCreate', (shard) => {
  console.log(`Shard ${shard.id} created`);
});

manager.on('shardReady', (id) => {
  console.log(`Shard ${id} is ready`);
});

manager.on('shardDisconnect', (id) => {
  console.log(`Shard ${id} disconnected`);
});

manager.on('shardError', (error, id) => {
  console.error(`Shard ${id} error:`, error);
});

manager.on('ready', () => {
  console.log('All shards ready!');
  
  // Obtain statistics every minute
  setInterval(async () => {
    const stats = await manager.statistics.collectStats();
    console.log('Stats:', {
      guilds: stats.totals.guilds,
      users: stats.totals.users,
      memory: `${Math.round(stats.totals.memory / 1024 / 1024)}MB`,
      ping: `${stats.totals.ping}ms`
    });
  }, 60000);
});

// Spawn shards
manager.spawn()
  .then(() => console.log('Sharding complete'))
  .catch(console.error);

// Graceful closing technique
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await manager.destroy();
  process.exit(0);
});