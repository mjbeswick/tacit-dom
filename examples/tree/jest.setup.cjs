// Jest setup file for tree example tests
// This file runs before each test file

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Setup DOM environment
beforeEach(() => {
  // Ensure clean DOM for each test
  document.body.innerHTML = '<div id="app"></div>';
});

afterEach(() => {
  // Clean up after each test
  document.body.innerHTML = '';
});
