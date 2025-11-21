# discord-autosharding

🚀 Advanced auto-sharding library for Discord bots with multi-library support

## Features

- ✨ **Automatic Sharding** - Let Discord recommend the optimal shard count
- 🔄 **Smart Respawning** - Automatically restart failed shards
- 📊 **Real-time Statistics** - Monitor guilds, users, memory, and ping
- 🔌 **Multi-Library Support** - Works with discord.js, Eris, and discord.io
- 🚀 **Clustering** - Distribute shards across multiple processes
- 💪 **Dynamic Scaling** - Automatically scale shards based on load
- 📝 **Advanced Logging** - Beautiful colored logs with multiple levels
- 🏥 **Health Checking** - Monitor and auto-recover unhealthy shards
- 📡 **IPC Communication** - Inter-process communication between shards

## Installation
```bash
npm install discord-autosharding
```

## Quick Start
```javascript
const { ShardManager } = require('discord-autoshard');

const manager = new ShardManager('./bot.js', {
  token: 'YOUR_BOT_TOKEN',
  totalShards: 'auto'
});

manager.on('shardCreate', shard => {
  console.log(`Shard ${shard.id} launched`);
});

manager.spawn();
```

## Usage

### Basic Sharding
```javascript
const { ShardManager } = require('discord-autoshard');

const manager = new ShardManager('./bot.js', {
  token: process.env.DISCORD_TOKEN,
  adapter: 'discordjs', // or 'eris', 'discordio'
  totalShards: 'auto',
  mode: 'process', // or 'worker'
  respawn: true
});

manager.spawn();
```

### With Discord.js
```javascript
const { ShardManager } = require('discord-autoshard');

const manager = new ShardManager('./bot.js', {
  token: process.env.DISCORD_TOKEN,
  adapter: 'discordjs',
  totalShards: 'auto'
});

manager.on('ready', async () => {
  // Broadcast eval to all shards
  const guilds = await manager.broadcastEval('this.guilds.cache.size');
  console.log(`Total guilds: ${guilds.reduce((a, b) => a + b, 0)}`);
});

manager.spawn();
```

### With Clustering
```javascript
const { ClusterManager } = require('discord-autoshard');

const clusterManager = new ClusterManager('./bot.js', {
  token: process.env.DISCORD_TOKEN,
  shardsPerCluster: 2,
  totalShards: 'auto'
});

clusterManager.spawn();
```

### Dynamic Scaling
```javascript
const { ShardManager, strategies } = require('discord-autoshard');

const manager = new ShardManager('./bot.js', {
  token: process.env.DISCORD_TOKEN
});

const dynamicStrategy = new strategies.DynamicStrategy(manager, {
  guildsPerShard: 1000,
  checkInterval: 300000, // Check every 5 minutes
  minShards: 1,
  maxShards: 16
});

manager.on('ready', () => {
  dynamicStrategy.startMonitoring();
});

manager.spawn();
```

## Events

- `shardCreate` - Emitted when a shard is created
- `shardReady` - Emitted when a shard is ready
- `shardDisconnect` - Emitted when a shard disconnects
- `shardReconnecting` - Emitted when a shard reconnects
- `shardDeath` - Emitted when a shard dies
- `shardError` - Emitted when a shard encounters an error
- `ready` - Emitted when all shards are ready

## API

### ShardManager

#### Constructor Options

- `token` - Bot token
- `adapter` - Library adapter ('discordjs', 'eris', 'discordio')
- `totalShards` - Number of shards or 'auto'
- `mode` - Spawn mode ('process' or 'worker')
- `respawn` - Auto-respawn dead shards
- `timeout` - Spawn timeout in milliseconds

#### Methods

- `spawn(amount, delay, timeout)` - Spawn shards
- `respawnShard(id)` - Respawn a specific shard
- `respawnAll()` - Respawn all shards
- `broadcast(message)` - Send message to all shards
- `broadcastEval(script)` - Evaluate code on all shards
- `fetchClientValues(prop)` - Fetch property from all shards
- `getStats()` - Get current statistics
- `destroy()` - Shutdown all shards

### ClusterManager

#### Methods

- `spawn()` - Spawn all clusters
- `broadcast(message)` - Broadcast to all clusters
- `broadcastEval(script)` - Eval on all clusters
- `getCluster(id)` - Get specific cluster
- `respawnCluster(id)` - Respawn a cluster
- `destroy()` - Shutdown all clusters

## Adapters

### Creating Custom Adapters
```javascript
const { adapters } = require('discord-autoshard');

class MyAdapter extends adapters.BaseAdapter {
  async connect() {
    // Implement connection logic
  }
  
  async disconnect() {
    // Implement disconnection logic
  }
  
  getGuildCount() {
    // Return guild count
  }
  
  // Implement other required methods...
}
```

## Strategies

- `AutoStrategy` - Automatic shard calculation
- `ManualStrategy` - Manual shard configuration
- `DynamicStrategy` - Dynamic scaling based on load
- `ClusterStrategy` - Cluster-based distribution

## Examples

See the [examples](./examples) directory for more detailed examples:

- `basic-usage.js` - Basic sharding example
- `discord-js-example.js` - Discord.js integration
- `eris-example.js` - Eris integration
- `clustering-example.js` - Clustering example
- `custom-adapter.js` - Custom adapter example
- `dynamic-scaling.js` - Dynamic scaling example

## Configuration

### Environment Variables

Create a `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
LOG_LEVEL=info
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Support

- [GitHub Issues](https://github.com/yourusername/discord-autoshard/issues)
- [Discord Server](https://discord.gg/your-server)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
```

## LICENSE
```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
