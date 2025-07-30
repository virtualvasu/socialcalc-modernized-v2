/**
 * Jest Test Setup
 * Global setup for SocialCalc/EtherCalc test suite
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock jQuery for tests that require it
global.$ = jest.fn(() => ({
  ready: jest.fn(),
  ajax: jest.fn(),
  param: jest.fn()
}));

// Set up jsdom environment globals
global.document = document;
global.window = window;
global.navigator = navigator;

// Initialize SocialCalc namespace for tests
global.SocialCalc = {};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Setup DOM for spreadsheet testing
beforeEach(() => {
  document.body.innerHTML = '';
  
  // Create basic DOM structure that SocialCalc expects
  const container = document.createElement('div');
  container.id = 'tableeditor';
  document.body.appendChild(container);
  
  const workbookControl = document.createElement('div');
  workbookControl.id = 'workbookControl';
  document.body.appendChild(workbookControl);
  
  const msgDiv = document.createElement('div');
  msgDiv.id = 'msg';
  document.body.appendChild(msgDiv);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});