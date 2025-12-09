import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  lineWrapping: boolean;
  autoSave: boolean;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  lineWrapping: true,
  autoSave: true,
};

interface SettingsHookResult {
  settings: Settings;
  isLoading: boolean;
  error: Error | null;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Hook for managing application settings
 * Provides loading, updating, and persistence of settings
 */
export function useSettings(): SettingsHookResult {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if running in Tauri environment
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const [theme, fontSize, tabSize, lineWrapping, autoSave] = await Promise.all([
          api.getSetting('theme'),
          api.getSetting('fontSize'),
          api.getSetting('tabSize'),
          api.getSetting('lineWrapping'),
          api.getSetting('autoSave'),
        ]);

        setSettings({
          theme: (theme as 'light' | 'dark') || defaultSettings.theme,
          fontSize: fontSize ? parseInt(fontSize) : defaultSettings.fontSize,
          tabSize: tabSize ? parseInt(tabSize) : defaultSettings.tabSize,
          lineWrapping: lineWrapping !== 'false',
          autoSave: autoSave !== 'false',
        });
      } else {
        // Use default settings in non-Tauri environments
        setSettings(defaultSettings);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load settings');
      setError(error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void> => {
    try {
      // Update local state immediately for responsive UI
      setSettings(prev => ({ ...prev, [key]: value }));

      // Persist to backend if in Tauri environment
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        await api.saveSetting(key, String(value));
      }
    } catch (err) {
      // Revert local state on error
      await load();
      const error = err instanceof Error ? err : new Error(`Failed to update ${key}`);
      setError(error);
      throw error;
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { settings, isLoading, error, update, reload: load };
}
