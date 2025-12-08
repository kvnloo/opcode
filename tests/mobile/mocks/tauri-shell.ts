/**
 * Mock for @tauri-apps/api/shell
 */
import { vi } from 'vitest';

export const Command = vi.fn().mockImplementation(() => ({
  execute: vi.fn().mockResolvedValue({ code: 0, stdout: '', stderr: '' }),
  spawn: vi.fn(),
}));

export const open = vi.fn().mockResolvedValue(undefined);
