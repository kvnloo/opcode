/**
 * Mock for @tauri-apps/api/core
 */
import { vi } from 'vitest';

export const invoke = vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
  // Return mock responses based on command
  switch (cmd) {
    case 'get_platform':
      return 'desktop';
    case 'get_version':
      return '1.0.0';
    default:
      return {};
  }
});

export const convertFileSrc = vi.fn((filePath: string) => `asset://${filePath}`);
