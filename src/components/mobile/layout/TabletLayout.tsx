import React, { useState } from 'react';
import { useOrientation } from '@/hooks/mobile/useOrientation';
import { cn } from '@/lib/utils';

interface TabletLayoutProps {
  /**
   * Sidebar content (navigation, tools, etc.)
   */
  sidebar: React.ReactNode;

  /**
   * Main content area
   */
  children: React.ReactNode;

  /**
   * Default sidebar width in pixels
   * @default 320
   */
  defaultSidebarWidth?: number;

  /**
   * Minimum sidebar width in pixels
   * @default 240
   */
  minSidebarWidth?: number;

  /**
   * Maximum sidebar width in pixels
   * @default 480
   */
  maxSidebarWidth?: number;

  /**
   * Whether sidebar can be resized
   * @default true
   */
  resizable?: boolean;

  /**
   * Whether sidebar can be collapsed
   * @default true
   */
  collapsible?: boolean;

  /**
   * Initial collapsed state
   * @default false
   */
  defaultCollapsed?: boolean;

  /**
   * Position of the sidebar
   * @default 'left'
   */
  sidebarPosition?: 'left' | 'right';

  /**
   * Callback when sidebar width changes
   */
  onSidebarWidthChange?: (width: number) => void;

  /**
   * Callback when sidebar collapse state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Tablet-optimized layout with split view
 * Provides larger touch targets and responsive sidebar
 * Optimized for landscape orientation on tablets
 *
 * @example
 * ```tsx
 * <TabletLayout
 *   sidebar={<NavigationMenu />}
 *   defaultSidebarWidth={360}
 *   sidebarPosition="left"
 * >
 *   <MainContent />
 * </TabletLayout>
 * ```
 */
export const TabletLayout: React.FC<TabletLayoutProps> = ({
  sidebar,
  children,
  defaultSidebarWidth = 320,
  minSidebarWidth = 240,
  maxSidebarWidth = 480,
  resizable = true,
  collapsible = true,
  defaultCollapsed = false,
  sidebarPosition = 'left',
  onSidebarWidthChange,
  onCollapsedChange,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isResizing, setIsResizing] = useState(false);
  const orientation = useOrientation();

  // Auto-collapse in portrait mode on smaller tablets
  const shouldAutoCollapse = orientation === 'portrait' && window.innerWidth < 900;

  const effectiveCollapsed = shouldAutoCollapse || isCollapsed;

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleResizeMove = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      let newWidth: number;
      if (sidebarPosition === 'left') {
        newWidth = clientX;
      } else {
        newWidth = window.innerWidth - clientX;
      }

      // Clamp width to min/max bounds
      newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));

      setSidebarWidth(newWidth);
      onSidebarWidthChange?.(newWidth);
    },
    [isResizing, minSidebarWidth, maxSidebarWidth, sidebarPosition, onSidebarWidthChange]
  );

  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex-shrink-0 relative transition-all duration-300 ease-in-out',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          effectiveCollapsed && 'w-0 border-r-0',
          sidebarPosition === 'right' && 'order-2 border-r-0 border-l'
        )}
        style={{
          width: effectiveCollapsed ? 0 : sidebarWidth,
        }}
        aria-hidden={effectiveCollapsed}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {sidebar}
        </div>

        {/* Resize handle */}
        {resizable && !effectiveCollapsed && (
          <div
            className={cn(
              'absolute top-0 bottom-0 w-1 cursor-col-resize',
              'hover:bg-blue-500 active:bg-blue-600 transition-colors',
              'touch-none select-none',
              // Larger touch target
              'before:absolute before:inset-y-0 before:w-4 before:-translate-x-1/2',
              sidebarPosition === 'left' ? 'right-0' : 'left-0'
            )}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            aria-valuenow={sidebarWidth}
            aria-valuemin={minSidebarWidth}
            aria-valuemax={maxSidebarWidth}
          >
            {/* Visual indicator */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-1 h-16 rounded-full',
                'bg-gray-300 dark:bg-gray-700',
                isResizing && 'bg-blue-500'
              )}
            />
          </div>
        )}
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Collapse toggle button */}
        {collapsible && !shouldAutoCollapse && (
          <button
            onClick={toggleCollapse}
            className={cn(
              'fixed z-10 m-4',
              'min-h-[44px] min-w-[44px] p-2',
              'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
              'border border-gray-200 dark:border-gray-700',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'transition-all duration-200',
              sidebarPosition === 'left' ? 'left-0' : 'right-0',
              effectiveCollapsed && sidebarPosition === 'left' && 'left-0',
              effectiveCollapsed && sidebarPosition === 'right' && 'right-0',
              !effectiveCollapsed && sidebarPosition === 'left' && 'left-[calc(var(--sidebar-width))]',
              !effectiveCollapsed && sidebarPosition === 'right' && 'right-[calc(var(--sidebar-width))]'
            )}
            style={
              {
                '--sidebar-width': `${sidebarWidth}px`,
              } as React.CSSProperties
            }
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            <svg
              className={cn(
                'w-6 h-6 transition-transform',
                isCollapsed && sidebarPosition === 'left' && 'rotate-180',
                !isCollapsed && sidebarPosition === 'right' && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarPosition === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>
        )}

        {children}
      </main>
    </div>
  );
};
