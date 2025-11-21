class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 50;
    this.interval = options.interval || 1000;
    this.queue = [];
    this.processing = false;
    this.requestCount = 0;
    this.resetTime = Date.now() + this.interval;
  }
  
  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._process();
    });
  }
  
  async _process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      
      if (now >= this.resetTime) {
        this.requestCount = 0;
        this.resetTime = now + this.interval;
      }
      
      if (this.requestCount >= this.maxRequests) {
        const waitTime = this.resetTime - now;
        await this._sleep(waitTime);
        this.requestCount = 0;
        this.resetTime = Date.now() + this.interval;
      }
      
      const { fn, resolve, reject } = this.queue.shift();
      this.requestCount++;
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getRemainingRequests() {
    return Math.max(0, this.maxRequests - this.requestCount);
  }
  
  getResetTime() {
    return this.resetTime;
  }
  
  clear() {
    this.queue = [];
    this.requestCount = 0;
    this.resetTime = Date.now() + this.interval;
  }
}

module.exports = RateLimiter;