<<<<<<< HEAD
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
=======
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
>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
};