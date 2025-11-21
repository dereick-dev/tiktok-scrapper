const BaseAdapter = require('./BaseAdapter');
const DiscordJSAdapter = require('./DiscordJSAdapter');
const ErisAdapter = require('./ErisAdapter');
const DiscordioAdapter = require('./DiscordioAdapter');

const adapters = {
  BaseAdapter,
  DiscordJSAdapter,
  ErisAdapter,
  DiscordioAdapter
};

function getAdapter(name) {
  const adapterMap = {
    'discordjs': DiscordJSAdapter,
    'discord.js': DiscordJSAdapter,
    'eris': ErisAdapter,
    'discordio': DiscordioAdapter,
    'discord.io': DiscordioAdapter
  };
  
  const AdapterClass = adapterMap[name.toLowerCase()];
  
  if (!AdapterClass) {
    throw new Error(`Unknown adapter: ${name}. Available: ${Object.keys(adapterMap).join(', ')}`);
  }
  
  return AdapterClass;
}

function createAdapter(name, options = {}) {
  const AdapterClass = getAdapter(name);
  return new AdapterClass(options);
}

module.exports = {
  ...adapters,
  getAdapter,
  createAdapter
};