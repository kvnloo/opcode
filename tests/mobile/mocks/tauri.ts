/**
 * Tauri API Mocks
 * Provides mock implementations for Tauri functions and platform detection
 */

export interface TauriInvokeResponse {
  [key: string]: any;
}

// Mock responses storage
const mockResponses = new Map<string, any>();
const mockErrors = new Map<string, Error>();

/**
 * Mock implementation of Tauri's invoke function
 */
export const mockTauriInvoke = jest.fn(async <T = any>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> => {
  // Check for error response first
  if (mockErrors.has(cmd)) {
    throw mockErrors.get(cmd);
  }

  // Return mocked response or default
  if (mockResponses.has(cmd)) {
    const response = mockResponses.get(cmd);
    // If response is a function, call it with args
    if (typeof response === 'function') {
      return response(args);
    }
    return response;
  }

  // Default responses for common commands
  switch (cmd) {
    case 'get_platform':
      return 'desktop' as T;
    case 'get_version':
      return '1.0.0' as T;
    default:
      return {} as T;
  }
});

/**
 * Platform detection mock
 */
let mockPlatformValue: 'iOS' | 'android' | 'desktop' = 'desktop';

export const mockPlatform = {
  get: () => mockPlatformValue,
  set: (platform: 'iOS' | 'android' | 'desktop') => {
    mockPlatformValue = platform;
  },
  isIOS: () => mockPlatformValue === 'iOS',
  isAndroid: () => mockPlatformValue === 'android',
  isDesktop: () => mockPlatformValue === 'desktop',
  isMobile: () => mockPlatformValue === 'iOS' || mockPlatformValue === 'android',
};

/**
 * Mock window.__TAURI__ object
 */
export const mockTauriGlobal = {
  invoke: mockTauriInvoke,
  convertFileSrc: (filePath: string) => `asset://${filePath}`,
  platform: mockPlatform.get(),
};

/**
 * Set mock response for a specific command
 */
export const setMockResponse = (cmd: string, response: any) => {
  mockResponses.set(cmd, response);
};

/**
 * Set mock error for a specific command
 */
export const setMockError = (cmd: string, error: Error) => {
  mockErrors.set(cmd, error);
};

/**
 * Clear specific mock response
 */
export const clearMockResponse = (cmd: string) => {
  mockResponses.delete(cmd);
  mockErrors.delete(cmd);
};

/**
 * Reset all mocks to initial state
 */
export const resetMocks = () => {
  mockTauriInvoke.mockClear();
  mockResponses.clear();
  mockErrors.clear();
  mockPlatformValue = 'desktop';
};

/**
 * Setup helper to inject __TAURI__ into global
 */
export const setupTauriGlobal = () => {
  Object.defineProperty(window, '__TAURI__', {
    value: mockTauriGlobal,
    writable: true,
    configurable: true,
  });
};

/**
 * Cleanup helper to remove __TAURI__ from global
 */
export const cleanupTauriGlobal = () => {
  delete (window as any).__TAURI__;
};

// Auto-setup for tests
beforeEach(() => {
  setupTauriGlobal();
  resetMocks();
});

afterEach(() => {
  cleanupTauriGlobal();
});
