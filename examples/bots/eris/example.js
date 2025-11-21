const { createAdapter } = require('../src/adapters');

const adapter = createAdapter('eris', {
  token: process.env.DISCORD_TOKEN,
  shardId: parseInt(process.env.SHARD_ID),
  shardCount: parseInt(process.env.SHARD_COUNT),
  intents: ['guilds', 'guildMessages']
});

// Connect
adapter.connect()
  .then(client => {
    console.log(`[Shard ${process.env.SHARD_ID}] Connected as ${client.user.username}`);
    
    client.on('messageCreate', async (message) => {
      if (message.content === '!ping') {
        client.createMessage(message.channel.id, `Pong! Shard ${process.env.SHARD_ID}`);
      }
      
      if (message.content === '!stats') {
        const stats = adapter.getStats();
        client.createMessage(message.channel.id, `\`\`\`json
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
});