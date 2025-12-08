/**
 * Mock for @tauri-apps/plugin-os
 */
import { vi } from 'vitest';

export const platform = vi.fn().mockReturnValue('desktop');
export const type = vi.fn().mockReturnValue('Linux');
export const version = vi.fn().mockReturnValue('1.0.0');
export const arch = vi.fn().mockReturnValue('x86_64');
