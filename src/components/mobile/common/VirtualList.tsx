/**
 * Virtualized List Component
 *
 * Efficiently renders large lists by only rendering visible items.
 * Supports smooth scrolling, variable heights, pull-to-refresh, and infinite scroll.
 */

import React, { useRef, useEffect, useState, useCallback, ReactNode } from 'react';

interface VirtualListProps<T = any> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;
  estimatedItemHeight?: number;
}

interface ItemPosition {
  index: number;
  offset: number;
  height: number;
}

/**
 * Virtualized list for efficient rendering of large datasets
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  onEndReachedThreshold = 0.8,
  onRefresh,
  refreshing = false,
  emptyComponent,
  loadingComponent,
  estimatedItemHeight = 100,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemPositions, setItemPositions] = useState<ItemPosition[]>([]);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const isRefreshing = useRef(false);

  /**
   * Calculates item positions for variable height items
   */
  useEffect(() => {
    const positions: ItemPosition[] = [];
    let offset = 0;

    items.forEach((item, index) => {
      const height =
        typeof itemHeight === 'function'
          ? itemHeight(item, index)
          : itemHeight;

      positions.push({ index, offset, height });
      offset += height;
    });

    setItemPositions(positions);
  }, [items, itemHeight]);

  /**
   * Measures container height
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  /**
   * Handles scroll events
   */
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const newScrollTop = target.scrollTop;

      setScrollTop(newScrollTop);

      // Check if end reached for infinite scroll
      if (onEndReached) {
        const scrollHeight = target.scrollHeight;
        const scrollBottom = newScrollTop + containerHeight;
        const threshold = scrollHeight * onEndReachedThreshold;

        if (scrollBottom >= threshold) {
          onEndReached();
        }
      }
    },
    [containerHeight, onEndReached, onEndReachedThreshold]
  );

  /**
   * Pull to refresh handlers
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || containerRef.current.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !containerRef.current || containerRef.current.scrollTop > 0) return;

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, 100));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance > 60 && onRefresh && !isRefreshing.current) {
      isRefreshing.current = true;
      try {
        await onRefresh();
      } finally {
        isRefreshing.current = false;
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, onRefresh]);

  /**
   * Calculates visible range
   */
  const getVisibleRange = useCallback(() => {
    if (itemPositions.length === 0) {
      return { start: 0, end: 0 };
    }

    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + containerHeight;

    let start = 0;
    let end = itemPositions.length - 1;

    // Binary search for start
    for (let i = 0; i < itemPositions.length; i++) {
      const pos = itemPositions[i];
      if (pos.offset + pos.height >= viewportTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // Binary search for end
    for (let i = start; i < itemPositions.length; i++) {
      const pos = itemPositions[i];
      if (pos.offset > viewportBottom) {
        end = Math.min(itemPositions.length - 1, i + overscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemPositions, overscan]);

  /**
   * Gets total content height
   */
  const getTotalHeight = useCallback(() => {
    if (itemPositions.length === 0) {
      return items.length * estimatedItemHeight;
    }

    const lastPos = itemPositions[itemPositions.length - 1];
    return lastPos.offset + lastPos.height;
  }, [itemPositions, items.length, estimatedItemHeight]);

  /**
   * Renders visible items
   */
  const renderVisibleItems = () => {
    if (items.length === 0) {
      return emptyComponent || <div className="p-8 text-center text-gray-500">No items</div>;
    }

    const { start, end } = getVisibleRange();
    const visibleItems: ReactNode[] = [];

    for (let i = start; i <= end; i++) {
      const item = items[i];
      const position = itemPositions[i];

      if (!item || !position) continue;

      visibleItems.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: position.offset,
            left: 0,
            right: 0,
            height: position.height,
          }}
          className="virtual-list-item"
        >
          {renderItem(item, i)}
        </div>
      );
    }

    return visibleItems;
  };

  const totalHeight = getTotalHeight();
  const pullProgress = Math.min(pullDistance / 60, 1);

  return (
    <div
      ref={containerRef}
      className={`virtual-list relative overflow-auto ${className}`}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull to refresh indicator */}
      {onRefresh && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
          style={{
            height: 60,
            transform: `translateY(${Math.max(-60, pullDistance - 60)}px)`,
            opacity: pullProgress,
          }}
        >
          {refreshing || isRefreshing.current ? (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium">Refreshing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="h-5 w-5 transition-transform"
                style={{ transform: `rotate(${pullProgress * 180}deg)` }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="text-sm font-medium">
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Virtual content container */}
      <div
        className="virtual-list-content relative"
        style={{
          height: totalHeight,
          transform: refreshing || isRefreshing.current ? `translateY(60px)` : undefined,
          transition: 'transform 0.2s',
        }}
      >
        {renderVisibleItems()}
      </div>

      {/* Loading indicator for infinite scroll */}
      {loadingComponent && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
          {loadingComponent}
        </div>
      )}
    </div>
  );
}

/**
 * Simple virtualized list item wrapper
 */
export function VirtualListItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`virtual-list-item-content ${className}`}>
      {children}
    </div>
  );
}

/**
 * Hook for measuring dynamic item heights
 */
export function useItemHeight<T = any>(
  _items: T[],
  defaultHeight = 100
): [(item: T, index: number) => number, (index: number, height: number) => void] {
  const [heights, setHeights] = useState<Map<number, number>>(new Map());

  const getHeight = useCallback(
    (_item: T, index: number) => {
      return heights.get(index) || defaultHeight;
    },
    [heights, defaultHeight]
  );

  const setHeight = useCallback((index: number, height: number) => {
    setHeights((prev) => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);

  return [getHeight, setHeight];
}
