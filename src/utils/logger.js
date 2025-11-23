<<<<<<< HEAD
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

class Logger {
  static formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    return `[${level}] ${timestamp} - ${message} ${dataStr}`;
  }

  static info(message, data = {}) {
    console.log(
      `${colors.blue}${this.formatMessage('INFO', message, data)}${colors.reset}`
    );
  }

  static success(message, data = {}) {
    console.log(
      `${colors.green}${this.formatMessage('SUCCESS', message, data)}${colors.reset}`
    );
  }

  static error(message, data = {}) {
    console.error(
      `${colors.red}${this.formatMessage('ERROR', message, data)}${colors.reset}`
    );
  }

  static warn(message, data = {}) {
    console.warn(
      `${colors.yellow}${this.formatMessage('WARN', message, data)}${colors.reset}`
    );
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.gray}${this.formatMessage('DEBUG', message, data)}${colors.reset}`
      );
    }
  }
}

=======
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

class Logger {
  static formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    return `[${level}] ${timestamp} - ${message} ${dataStr}`;
  }

  static info(message, data = {}) {
    console.log(
      `${colors.blue}${this.formatMessage('INFO', message, data)}${colors.reset}`
    );
  }

  static success(message, data = {}) {
    console.log(
      `${colors.green}${this.formatMessage('SUCCESS', message, data)}${colors.reset}`
    );
  }

  static error(message, data = {}) {
    console.error(
      `${colors.red}${this.formatMessage('ERROR', message, data)}${colors.reset}`
    );
  }

  static warn(message, data = {}) {
    console.warn(
      `${colors.yellow}${this.formatMessage('WARN', message, data)}${colors.reset}`
    );
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.gray}${this.formatMessage('DEBUG', message, data)}${colors.reset}`
      );
    }
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = Logger;