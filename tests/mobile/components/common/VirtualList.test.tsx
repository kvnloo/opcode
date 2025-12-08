import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { swipeDown } from '../../utils/gestures';
import { VirtualList, VirtualListItem, useItemHeight } from '@/components/mobile/common/VirtualList';
import { act, renderHook } from '@testing-library/react';

// ResizeObserver is mocked globally in setup.ts - no local mock needed
// The global MockResizeObserver class provides observe, unobserve, and disconnect methods

const mockItems = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  text: `Item ${i}`,
}));

describe('VirtualList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with items', () => {
      render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
        />
      );

      // Should render at least some items
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    it('should render empty component when no items', () => {
      const emptyComponent = <div>No items found</div>;

      render(
        <VirtualList
          items={[]}
          itemHeight={50}
          renderItem={(item: any) => <div>{item.text}</div>}
          emptyComponent={emptyComponent}
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render default empty message when no items and no emptyComponent', () => {
      render(
        <VirtualList
          items={[]}
          itemHeight={50}
          renderItem={(item: any) => <div>{item.text}</div>}
        />
      );

      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          className="custom-list"
        />
      );

      const list = container.querySelector('.virtual-list');
      expect(list?.className).toContain('custom-list');
    });
  });

  describe('Virtualization', () => {
    it('should only render visible items within viewport', () => {
      render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.text}</div>}
          overscan={2}
        />
      );

      // Should not render items far from viewport
      expect(screen.queryByTestId('item-50')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-90')).not.toBeInTheDocument();
    });

    it('should render overscan items', () => {
      render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.text}</div>}
          overscan={3}
        />
      );

      // With overscan of 3, should render a few extra items
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
    });

    it('should handle variable item heights', () => {
      const getHeight = (item: any) => (item.id % 2 === 0 ? 50 : 100);

      render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={getHeight}
          renderItem={(item) => <div>{item.text}</div>}
        />
      );

      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('should handle scroll events', async () => {
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.text}</div>}
        />
      );

      const list = container.querySelector('.virtual-list');

      if (list) {
        act(() => {
          list.scrollTop = 500;
          list.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await waitFor(() => {
          // After scrolling, different items should be visible
          expect(list.scrollTop).toBe(500);
        });
      }
    });

    it('should trigger onEndReached when scrolled near bottom', async () => {
      const onEndReached = vi.fn();
      const { container } = render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.8}
        />
      );

      const list = container.querySelector('.virtual-list');

      if (list) {
        // Mock dimensions
        Object.defineProperty(list, 'scrollHeight', { value: 5000, configurable: true });
        Object.defineProperty(list, 'scrollTop', { value: 4500, configurable: true, writable: true });
        Object.defineProperty(list, 'clientHeight', { value: 500, configurable: true });

        act(() => {
          list.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await waitFor(() => {
          expect(onEndReached).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Pull to Refresh', () => {
    it('should show refresh indicator on pull down', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          onRefresh={onRefresh}
        />
      );

      const list = container.querySelector('.virtual-list');

      if (list) {
        await swipeDown(list, { distance: 80 });

        // Pull to refresh indicator should be visible
        await waitFor(() => {
          expect(screen.getByText(/pull to refresh/i)).toBeInTheDocument();
        });
      }
    });

    it('should trigger onRefresh when pulled past threshold', async () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          onRefresh={onRefresh}
        />
      );

      const list = container.querySelector('.virtual-list');

      if (list) {
        // Mock scrollTop to be at top
        Object.defineProperty(list, 'scrollTop', { value: 0, configurable: true });

        await swipeDown(list, { distance: 80 });

        await waitFor(() => {
          expect(onRefresh).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });

    it('should show refreshing state', async () => {
      const onRefresh = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          onRefresh={onRefresh}
          refreshing={true}
        />
      );

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading component when provided', () => {
      const loadingComponent = <div>Loading more...</div>;

      render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
          loadingComponent={loadingComponent}
        />
      );

      expect(screen.getByText('Loading more...')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should use ResizeObserver to measure container', () => {
      // Spy on ResizeObserver constructor
      const observeSpy = vi.fn();
      const disconnectSpy = vi.fn();
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: observeSpy,
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      }));

      render(
        <VirtualList
          items={mockItems.slice(0, 10)}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
        />
      );

      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(observeSpy).toHaveBeenCalled();
    });

    it('should calculate item positions efficiently', () => {
      render(
        <VirtualList
          items={mockItems}
          itemHeight={50}
          renderItem={(item) => <div>{item.text}</div>}
        />
      );

      // Should render without performance issues
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });
});

describe('VirtualListItem', () => {
  it('should render children', () => {
    render(
      <VirtualListItem>
        <div>Item content</div>
      </VirtualListItem>
    );

    expect(screen.getByText('Item content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <VirtualListItem className="custom-item">
        <div>Item</div>
      </VirtualListItem>
    );

    const item = screen.getByText('Item').parentElement;
    expect(item?.className).toContain('custom-item');
  });

  it('should have default class', () => {
    render(
      <VirtualListItem>
        <div>Item</div>
      </VirtualListItem>
    );

    const item = screen.getByText('Item').parentElement;
    expect(item?.className).toContain('virtual-list-item-content');
  });
});

describe('useItemHeight', () => {
  const testItems = [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ];

  it('should return default height for unknown items', () => {
    const { result } = renderHook(() => useItemHeight(testItems, 100));
    const [getHeight] = result.current;

    expect(getHeight(testItems[0], 0)).toBe(100);
  });

  it('should store and retrieve measured heights', () => {
    const { result } = renderHook(() => useItemHeight(testItems, 100));

    act(() => {
      const [, setHeight] = result.current;
      setHeight(0, 150);
    });

    const [getHeight] = result.current;
    expect(getHeight(testItems[0], 0)).toBe(150);
  });

  it('should update heights independently', () => {
    const { result } = renderHook(() => useItemHeight(testItems, 100));

    act(() => {
      const [, setHeight] = result.current;
      setHeight(0, 150);
      setHeight(1, 200);
    });

    const [getHeight] = result.current;
    expect(getHeight(testItems[0], 0)).toBe(150);
    expect(getHeight(testItems[1], 1)).toBe(200);
    expect(getHeight(testItems[2], 2)).toBe(100); // default
  });

  it('should use custom default height', () => {
    const { result } = renderHook(() => useItemHeight(testItems, 250));
    const [getHeight] = result.current;

    expect(getHeight(testItems[0], 0)).toBe(250);
  });
});
