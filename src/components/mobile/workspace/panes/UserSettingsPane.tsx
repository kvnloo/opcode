import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Settings, Moon, Sun, Type, ChevronLeft, Loader2 } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';
import { api, ClaudeSettings } from '@/lib/api';

interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  lineWrapping: boolean;
  autoSave: boolean;
  claudeSettings?: ClaudeSettings;
}

interface UserSettingsPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function UserSettingsPane({ projectId, onBack, className }: UserSettingsPaneProps) {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    lineWrapping: true,
    autoSave: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if running in Tauri environment
  const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!isTauri) {
        // Use default settings for web/dev
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [theme, fontSize, tabSize, lineWrapping, autoSave, claudeSettings] = await Promise.all([
          api.getSetting('theme'),
          api.getSetting('fontSize'),
          api.getSetting('tabSize'),
          api.getSetting('lineWrapping'),
          api.getSetting('autoSave'),
          api.getClaudeSettings().catch(() => ({})),
        ]);

        setSettings({
          theme: (theme as 'light' | 'dark') || 'dark',
          fontSize: fontSize ? parseInt(fontSize) : 14,
          tabSize: tabSize ? parseInt(tabSize) : 2,
          lineWrapping: lineWrapping === 'true',
          autoSave: autoSave === 'true',
          claudeSettings,
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isTauri]);

  // Debounced auto-save
  const saveSettingDebounced = useCallback(
    async (key: string, value: string) => {
      if (!isTauri) return;

      try {
        await api.saveSetting(key, value);
      } catch (err) {
        console.error(`Failed to save setting ${key}:`, err);
        setError(`Failed to save ${key}`);
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    },
    [isTauri]
  );

  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Auto-save to API
      if (isTauri) {
        const stringValue = String(value);
        saveSettingDebounced(key, stringValue);
      }
    },
    [isTauri, saveSettingDebounced]
  );

  const fontSizeOptions = [12, 14, 16, 18, 20];
  const tabSizeOptions = [2, 4, 8];

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <Settings size={20} className="text-primary" />
        <h2 className="text-lg font-semibold">User Settings</h2>
        {isLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
      </header>

      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Appearance Section */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Appearance
          </h3>
          <div className="space-y-2">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2">
                {settings.theme === 'dark' ? (
                  <Moon size={18} className="text-primary" />
                ) : (
                  <Sun size={18} className="text-primary" />
                )}
                <span className="text-sm font-medium">Theme</span>
              </div>
              <div className="flex gap-1">
                <HapticButton
                  onClick={() => updateSetting('theme', 'light')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[60px]',
                    settings.theme === 'light'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                  aria-label="Light theme"
                >
                  Light
                </HapticButton>
                <HapticButton
                  onClick={() => updateSetting('theme', 'dark')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[60px]',
                    settings.theme === 'dark'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                  aria-label="Dark theme"
                >
                  Dark
                </HapticButton>
              </div>
            </div>
          </div>
        </section>

        {/* Editor Section */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Editor
          </h3>
          <div className="space-y-2">
            {/* Font Size */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Type size={18} className="text-primary" />
                <span className="text-sm font-medium">Font Size</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {fontSizeOptions.map((size) => (
                  <HapticButton
                    key={size}
                    onClick={() => updateSetting('fontSize', size)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[44px]',
                      settings.fontSize === size
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                    aria-label={`Font size ${size}px`}
                  >
                    {size}
                  </HapticButton>
                ))}
              </div>
            </div>

            {/* Tab Size */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Tab Size</span>
              </div>
              <div className="flex gap-1.5">
                {tabSizeOptions.map((size) => (
                  <HapticButton
                    key={size}
                    onClick={() => updateSetting('tabSize', size)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[44px]',
                      settings.tabSize === size
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                    aria-label={`Tab size ${size} spaces`}
                  >
                    {size}
                  </HapticButton>
                ))}
              </div>
            </div>

            {/* Line Wrapping Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <span className="text-sm font-medium">Line Wrapping</span>
              <HapticButton
                onClick={() => updateSetting('lineWrapping', !settings.lineWrapping)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[60px]',
                  settings.lineWrapping
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
                aria-label={settings.lineWrapping ? 'Disable line wrapping' : 'Enable line wrapping'}
                aria-pressed={settings.lineWrapping}
              >
                {settings.lineWrapping ? 'On' : 'Off'}
              </HapticButton>
            </div>

            {/* Auto-save Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <span className="text-sm font-medium">Auto-save</span>
              <HapticButton
                onClick={() => updateSetting('autoSave', !settings.autoSave)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors min-h-[36px] min-w-[60px]',
                  settings.autoSave
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
                aria-label={settings.autoSave ? 'Disable auto-save' : 'Enable auto-save'}
                aria-pressed={settings.autoSave}
              >
                {settings.autoSave ? 'On' : 'Off'}
              </HapticButton>
            </div>
          </div>
        </section>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground px-1">
          Settings are stored locally and apply to all projects.
        </p>
      </div>
    </div>
  );
}

export default UserSettingsPane;
