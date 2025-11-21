const EventEmitter = require('./events/EventEmitter');
const { ShardError } = require('./errors');

class Shard extends EventEmitter {
  constructor(manager, id) {
    super();
    
    this.manager = manager;
    this.id = id;
    this.process = null;
    this.ready = false;
    this.worker = null;
    this.env = Object.assign({}, process.env, {
      SHARD_ID: this.id,
      SHARD_COUNT: this.manager.totalShards,
      DISCORD_TOKEN: this.manager.token,
      ADAPTER: this.manager.adapter
    });
    
    this._evals = new Map();
    this._fetches = new Map();
    this._exitListener = null;
  }
  
  spawn(timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new ShardError(`Shard ${this.id} took too long to spawn`));
      }, timeout);
      
      if (this.manager.mode === 'process') {
        this._spawnProcess();
      } else if (this.manager.mode === 'worker') {
        this._spawnWorker();
      }
      
      this.once('ready', () => {
        clearTimeout(timeoutId);
        this.ready = true;
        resolve(this);
      });
      
      this.once('death', () => {
        clearTimeout(timeoutId);
        reject(new ShardError(`Shard ${this.id} died during spawn`));
      });
    });
  }
  
  _spawnProcess() {
    const { fork } = require('child_process');
    
    this.process = fork(this.manager.file, this.manager.shardArgs, {
      env: this.env,
      execArgv: this.manager.execArgv
    });
    
    this.process.on('message', this._handleMessage.bind(this));
    
    this.process.on('error', (error) => {
      this.emit('error', error);
    });
    
    this._exitListener = (code, signal) => {
      this.ready = false;
      this.emit('death');
      
      if (code !== 0) {
        this.manager.logger.error(`Shard ${this.id} exited with code ${code}`);
      }
    };
    
    this.process.once('exit', this._exitListener);
  }
  
  _spawnWorker() {
    const { Worker } = require('worker_threads');
    
    this.worker = new Worker(this.manager.file, {
      workerData: {
        shardId: this.id,
        shardCount: this.manager.totalShards,
        token: this.manager.token,
        adapter: this.manager.adapter
      }
    });
    
    this.worker.on('message', this._handleMessage.bind(this));
    
    this.worker.on('error', (error) => {
      this.emit('error', error);
    });
    
    this.worker.once('exit', (code) => {
      this.ready = false;
      this.emit('death');
      
      if (code !== 0) {
        this.manager.logger.error(`Shard ${this.id} worker exited with code ${code}`);
      }
    });
  }
  
  _handleMessage(message) {
    if (!message || typeof message !== 'object') return;
    
    switch (message.type) {
      case 'ready':
        this.emit('ready');
        break;
        
      case 'disconnect':
        this.emit('disconnect');
        break;
        
      case 'reconnecting':
        this.emit('reconnecting');
        break;
        
      case 'eval':
        this._handleEvalResponse(message);
        break;
        
      case 'fetch':
        this._handleFetchResponse(message);
        break;
        
      case 'stats':
        this.emit('stats', message.data);
        break;
        
      case 'log':
        this.manager.logger.log(message.level, `[Shard ${this.id}]`, message.message);
        break;
        
      default:
        this.emit('message', message);
    }
  }
  
  send(message) {
    return new Promise((resolve, reject) => {
      if (this.manager.mode === 'process') {
        if (!this.process || !this.process.connected) {
          reject(new ShardError(`Shard ${this.id} process not connected`));
          return;
        }
        
        this.process.send(message, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } else if (this.manager.mode === 'worker') {
        if (!this.worker) {
          reject(new ShardError(`Shard ${this.id} worker not available`));
          return;
        }
        
        this.worker.postMessage(message);
        resolve();
      }
    });
  }
  
  eval(script) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      
      const timeout = setTimeout(() => {
        this._evals.delete(id);
        reject(new ShardError(`Eval timeout on shard ${this.id}`));
      }, 10000);
      
      this._evals.set(id, { resolve, reject, timeout });
      
      this.send({
        type: 'eval',
        id,
        script
      }).catch(reject);
    });
  }
  
  _handleEvalResponse(message) {
    const pending = this._evals.get(message.id);
    if (!pending) return;
    
    clearTimeout(pending.timeout);
    this._evals.delete(message.id);
    
    if (message.error) {
      pending.reject(new Error(message.error));
    } else {
      pending.resolve(message.result);
    }
  }
  
  fetchClientValue(prop) {
    return this.eval(`this.${prop}`);
  }
  
  _handleFetchResponse(message) {
    const pending = this._fetches.get(message.id);
    if (!pending) return;
    
    clearTimeout(pending.timeout);
    this._fetches.delete(message.id);
    
    if (message.error) {
      pending.reject(new Error(message.error));
    } else {
      pending.resolve(message.result);
    }
  }
  
  async kill() {
    this.ready = false;
    
    if (this.process) {
      this.process.removeListener('exit', this._exitListener);
      this.process.kill();
      this.process = null;
    }
    
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    
    this._evals.clear();
    this._fetches.clear();
  }
  
  async respawn(delay = 500, timeout = 30000) {
    await this.kill();
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.spawn(timeout);
  }
}

module.exports = Shard;