const chalk = require('chalk');

class Logger {
  constructor(name = 'ShardManager', level = 'info') {
    this.name = name;
    this.level = level;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.colors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      debug: chalk.green,
      trace: chalk.gray
    };
  }
  
  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }
  
  _format(level, ...args) {
    const timestamp = new Date().toISOString();
    const color = this.colors[level] || chalk.white;
    const prefix = color(`[${timestamp}] [${this.name}] [${level.toUpperCase()}]`);
    
    return `${prefix} ${args.join(' ')}`;
  }
  
  log(level, ...args) {
    if (!this._shouldLog(level)) return;
    
    const message = this._format(level, ...args);
    
    if (level === 'error') {
      console.error(message);
    } else if (level === 'warn') {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
  
  error(...args) {
    this.log('error', ...args);
  }
  
  warn(...args) {
    this.log('warn', ...args);
  }
  
  info(...args) {
    this.log('info', ...args);
  }
  
  debug(...args) {
    this.log('debug', ...args);
  }
  
  trace(...args) {
    this.log('trace', ...args);
  }
  
  setLevel(level) {
    if (!this.levels.hasOwnProperty(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    
    this.level = level;
  }
  
  child(name) {
    return new Logger(`${this.name}:${name}`, this.level);
  }
}

module.exports = Logger;