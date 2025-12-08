import React from 'react';
import { usePlatform } from '@/hooks/mobile/usePlatform';

export type MobilePane = 'apps' | 'create' | 'account';

interface MobileLayoutProps {
  children: React.ReactNode;
  activePane?: MobilePane;
  onPaneChange?: (pane: MobilePane) => void;
}

export function MobileLayout({ children, activePane = 'apps', onPaneChange }: MobileLayoutProps) {
  const platform = usePlatform();

  if (platform === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main Content - Full height minus bottom nav */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        active={activePane}
        onChange={onPaneChange}
      />
    </div>
  );
}

// Inline BottomNavigation for now - will be extracted later
function BottomNavigation({ active, onChange }: { active: MobilePane; onChange?: (pane: MobilePane) => void }) {
  const tabs = [
    { id: 'apps' as MobilePane, icon: '📱', label: 'Apps' },
    { id: 'create' as MobilePane, icon: '➕', label: 'Create' },
    { id: 'account' as MobilePane, icon: '👤', label: 'Account' },
  ];

  return (
    <div className="flex items-center justify-around bg-card border-t border-border py-2 pb-safe">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange?.(tab.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
            active === tab.id
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
