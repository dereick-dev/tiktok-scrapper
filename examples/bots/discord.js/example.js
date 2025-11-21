const { Client, GatewayIntentBits } = require('discord.js');
const { createAdapter } = require('../src/adapters');

const adapter = createAdapter('discordjs', {
  token: process.env.DISCORD_TOKEN,
  shardId: parseInt(process.env.SHARD_ID),
  shardCount: parseInt(process.env.SHARD_COUNT),
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Connect
adapter.connect()
  .then(client => {
    console.log(`[Shard ${process.env.SHARD_ID}] Connected as ${client.user.tag}`);
    
    client.on('messageCreate', message => {
      if (message.content === '!ping') {
        message.reply(`Pong! Shard ${process.env.SHARD_ID}`);
      }
      
      if (message.content === '!stats') {
        const stats = adapter.getStats();
        message.reply(`\`\`\`json
${JSON.stringify(stats, null, 2)}
\`\`\``);
      }
    });
  })
  .catch(console.error);

// Handle IPC messages
process.on('message', async (message) => {
  if (message.type === 'eval') {
    try {
      const result = await adapter.eval(message.script);
      process.send({
        type: 'eval',
        id: message.id,
        result
      });
    } catch (error) {
      process.send({
        type: 'eval',
        id: message.id,
        error: error.message
      });
    }
  }
  
  if (message.type === 'broadcast') {
    console.log('[Shard] Received broadcast:', message.message);
  }
});