import React, { useState } from 'react';
import { Lock, Database, Users, Plus, Search, Folder, X } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { cn } from '@/lib/utils';

interface QuickAccessBarProps {
  /**
   * Handler for Secrets button click
   */
  onSecretsClick: () => void;

  /**
   * Handler for Database button click
   */
  onDatabaseClick: () => void;

  /**
   * Handler for Auth button click
   */
  onAuthClick: () => void;

  /**
   * Handler for New Tab button click
   */
  onNewTab: () => void;

  /**
   * Handler for search interaction (opens ToolsOverlay)
   */
  onSearchClick: () => void;

  /**
   * Optional className for container
   */
  className?: string;
}

interface QuickActionButton {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

/**
 * QuickAccessBar - Horizontal toolbar with common workspace tools and search
 *
 * Features:
 * - Horizontal scrollable button row (Secrets, Database, Auth, New Tab)
 * - Integrated search bar with folder/search icons
 * - Dark theme styling (bg-zinc-800 buttons on bg-zinc-900)
 * - Haptic feedback on all interactions
 * - Accessible touch targets (WCAG 2.1 AA compliant)
 *
 * Layout from screenshot 124526:
 * - Top row: Icon buttons with labels below
 * - Bottom: Search bar with close button
 *
 * @example
 * ```tsx
 * <QuickAccessBar
 *   onSecretsClick={() => openSecretsManager()}
 *   onDatabaseClick={() => openDatabase()}
 *   onAuthClick={() => openAuthPanel()}
 *   onNewTab={() => createNewTab()}
 *   onSearchClick={() => setToolsOverlayOpen(true)}
 * />
 * ```
 */
export function QuickAccessBar({
  onSecretsClick,
  onDatabaseClick,
  onAuthClick,
  onNewTab,
  onSearchClick,
  className,
}: QuickAccessBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const quickActions: QuickActionButton[] = [
    {
      icon: Lock,
      label: 'Secrets',
      onClick: onSecretsClick,
    },
    {
      icon: Database,
      label: 'Database',
      onClick: onDatabaseClick,
    },
    {
      icon: Users,
      label: 'Auth',
      onClick: onAuthClick,
    },
    {
      icon: Plus,
      label: 'New Tab',
      onClick: onNewTab,
    },
  ];

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleSearchFocus = () => {
    // Open tools overlay when search is focused
    onSearchClick();
  };

  return (
    <div
      className={cn(
        'bg-zinc-900 border-t border-zinc-800',
        'flex flex-col gap-3 p-3',
        className
      )}
    >
      {/* Quick Action Buttons Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
        {quickActions.map((action) => (
          <HapticButton
            key={action.label}
            onClick={action.onClick}
            hapticType="light"
            className={cn(
              // Container styling
              'flex flex-col items-center justify-center gap-1.5',
              'min-w-[80px] flex-shrink-0',
              'bg-zinc-800 hover:bg-zinc-700',
              'border border-zinc-700 hover:border-zinc-600',
              'rounded-lg px-4 py-3',
              'transition-colors',

              // Touch target (already handled by HapticButton)
              'active:bg-zinc-600'
            )}
            aria-label={action.label}
          >
            <action.icon
              className="text-zinc-300"
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-zinc-300">
              {action.label}
            </span>
          </HapticButton>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-2',
            'bg-zinc-800 rounded-lg',
            'border border-zinc-700',
            'px-3 py-2.5',
            'transition-colors',
            'focus-within:border-zinc-600 focus-within:bg-zinc-750'
          )}
        >
          {/* Folder Icon */}
          <Folder
            className="text-zinc-400 flex-shrink-0"
            size={18}
            aria-hidden="true"
          />

          {/* Search Input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search..."
            className={cn(
              'flex-1 bg-transparent',
              'text-sm text-zinc-100 placeholder:text-zinc-500',
              'outline-none border-none',
              'min-w-0' // Prevent overflow
            )}
            aria-label="Search workspace"
          />

          {/* Search Icon */}
          <Search
            className="text-zinc-400 flex-shrink-0"
            size={18}
            aria-hidden="true"
          />

          {/* Clear Button (only shown when there's text) */}
          {searchValue && (
            <button
              onClick={handleSearchClear}
              className={cn(
                'text-zinc-400 hover:text-zinc-300',
                'transition-colors',
                'p-0.5 rounded',
                'active:scale-95',
                // Accessibility
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-zinc-500 focus-visible:ring-offset-1',
                'focus-visible:ring-offset-zinc-800'
              )}
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Hide scrollbar on webkit browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
