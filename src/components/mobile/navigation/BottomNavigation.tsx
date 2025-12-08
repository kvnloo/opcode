import { Folder, Plus, User } from 'lucide-react';

export type NavigationTab = 'apps' | 'create' | 'account';

interface BottomNavigationProps {
  active: NavigationTab;
  onChange: (tab: NavigationTab) => void;
}

export function BottomNavigation({ active, onChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'apps' as NavigationTab, Icon: Folder, label: 'Apps' },
    { id: 'create' as NavigationTab, Icon: Plus, label: 'Create' },
    { id: 'account' as NavigationTab, Icon: User, label: 'Account' },
  ];

  const handleTabPress = (tab: NavigationTab) => {
    // TODO: Add haptic feedback when available
    onChange(tab);
  };

  return (
    <nav
      className="flex items-center justify-around bg-card border-t border-border py-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab.id)}
            className={`
              flex flex-col items-center justify-center
              p-2 rounded-lg transition-all duration-200
              min-w-[64px] min-h-[48px]
              ${isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <tab.Icon
              size={24}
              className={isActive ? 'text-primary' : undefined}
            />
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
