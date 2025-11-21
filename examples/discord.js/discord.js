const { ShardManager } = require('../src');
const path = require('path');

// Example with discord.js
const manager = new ShardManager(path.join(__dirname, 'bot-discordjs.js'), {
  token: process.env.DISCORD_TOKEN,
  adapter: 'discordjs',
  totalShards: 'auto',
  mode: 'process',
  respawn: true,
  shardArgs: ['--ansi', '--color'],
  execArgv: ['--trace-warnings']
});

manager.on('shardCreate', (shard) => {
  console.log(`[MANAGER] Launched shard ${shard.id}`);
  
  shard.on('ready', () => {
    console.log(`[SHARD ${shard.id}] Ready`);
  });
  
  shard.on('death', () => {
    console.log(`[SHARD ${shard.id}] Died`);
  });
  
  shard.on('error', (error) => {
    console.error(`[SHARD ${shard.id}] Error:`, error);
  });
});

manager.on('ready', async () => {
  console.log('[MANAGER] All shards ready');
  
  // Broadcast eval example
  const results = await manager.broadcastEval('this.guilds.cache.size');
  const totalGuilds = results.reduce((acc, val) => acc + val, 0);
  console.log(`Total guilds: ${totalGuilds}`);
  
  // Fetch client values
  const usernames = await manager.fetchClientValues('user.username');
  console.log('Bot usernames per shard:', usernames);
});

manager.spawn()
  .catch(console.error);