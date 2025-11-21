const { EventEmitter: NodeEventEmitter } = require('events');

class EventEmitter extends NodeEventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
  }
  
  emitAsync(event, ...args) {
    return new Promise((resolve, reject) => {
      try {
        this.emit(event, ...args);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  onceAsync(event) {
    return new Promise((resolve) => {
      this.once(event, (...args) => {
        resolve(args.length === 1 ? args[0] : args);
      });
    });
  }
  
  waitFor(event, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(event, listener);
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);
      
      const listener = (...args) => {
        clearTimeout(timer);
        resolve(args.length === 1 ? args[0] : args);
      };
      
      this.once(event, listener);
    });
  }
  
  removeAllListenersExcept(events = []) {
    const allEvents = this.eventNames();
    
    for (const event of allEvents) {
      if (!events.includes(event)) {
        this.removeAllListeners(event);
      }
    }
  }
  
  getListenerCount(event) {
    return this.listenerCount(event);
  }
  
  hasListeners(event) {
    return this.listenerCount(event) > 0;
  }
  
  emitWithTimeout(event, timeout = 5000, ...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Event emission timeout: ${event}`));
      }, timeout);
      
      try {
        this.emit(event, ...args);
        clearTimeout(timer);
        resolve();
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
  
  pipeEvents(target, events = []) {
    if (!target || typeof target.emit !== 'function') {
      throw new Error('Target must be an EventEmitter');
    }
    
    const eventsToListen = events.length > 0 ? events : this.eventNames();
    
    for (const event of eventsToListen) {
      this.on(event, (...args) => {
        target.emit(event, ...args);
      });
    }
  }
  
  onAny(callback) {
    const events = this.eventNames();
    
    for (const event of events) {
      this.on(event, (...args) => {
        callback(event, ...args);
      });
    }
    
    this.on('newListener', (event) => {
      this.on(event, (...args) => {
        callback(event, ...args);
      });
    });
  }
  
  emitSerial(event, ...args) {
    const listeners = this.listeners(event);
    
    return listeners.reduce((promise, listener) => {
      return promise.then(() => {
        return Promise.resolve(listener(...args));
      });
    }, Promise.resolve());
  }
  
  emitParallel(event, ...args) {
    const listeners = this.listeners(event);
    
    return Promise.all(
      listeners.map(listener => Promise.resolve(listener(...args)))
    );
  }
}

module.exports = EventEmitter;