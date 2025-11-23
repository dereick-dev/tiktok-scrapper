// Test setup and configuration
process.env.NODE_ENV = 'test';
process.env.PORT = 8001;
process.env.LOG_LEVEL = 'error';

// Mock console methods during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};