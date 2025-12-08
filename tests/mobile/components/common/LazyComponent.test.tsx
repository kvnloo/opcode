import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { LazyComponent } from '@/components/mobile/common/LazyComponent';

// Mock component to be lazy loaded
const MockComponent = ({ message = 'Loaded' }: { message?: string }) => (
  <div data-testid="mock-component">{message}</div>
);

// Mock the lazyWithRetry utility
vi.mock('@/lib/mobile/performance', () => ({
  lazyWithRetry: (loader: any) => {
    // Return a lazy component that calls the loader
    return vi.fn(() => loader());
  },
}));

describe('LazyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show default loading skeleton while loading', async () => {
      render(
        <LazyComponent
          loadComponent={() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ default: MockComponent }), 100)
            )
          }
        />
      );

      // Check for loading skeleton
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading content');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should show custom loading skeleton when provided', async () => {
      const customSkeleton = <div data-testid="custom-skeleton">Loading...</div>;

      render(
        <LazyComponent
          loadComponent={() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ default: MockComponent }), 100)
            )
          }
          loadingSkeleton={customSkeleton}
        />
      );

      expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on loading state', async () => {
      render(
        <LazyComponent
          loadComponent={() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ default: MockComponent }), 100)
            )
          }
        />
      );

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Successful Loading', () => {
    it('should render component after successful load', async () => {
      render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      });
    });

    it('should pass props to loaded component', async () => {
      render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
          componentProps={{ message: 'Custom message' }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom message')).toBeInTheDocument();
      });
    });

    it('should call onLoad callback after successful load', async () => {
      const onLoad = vi.fn();

      render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
          onLoad={onLoad}
        />
      );

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show default error fallback on load failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Load failed'))}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Failed to load component')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should show custom error fallback when provided', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const customError = <div data-testid="custom-error">Custom error</div>;

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Load failed'))}
          errorFallback={customError}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-error')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should call onError callback on failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onError = vi.fn();
      const error = new Error('Load failed');

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(error)}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });

      consoleError.mockRestore();
    });

    it('should have retry button in default error fallback', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Load failed'))}
        />
      );

      await waitFor(() => {
        const retryButton = screen.getByLabelText('Retry loading component');
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveClass('min-h-[44px]'); // Accessibility touch target
      });

      consoleError.mockRestore();
    });

    it('should show error message in default fallback', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Custom error message'))}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should have proper ARIA attributes on error state', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Load failed'))}
        />
      );

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });

      consoleError.mockRestore();
    });
  });

  describe('Retry Configuration', () => {
    it('should use default retry configuration', async () => {
      const { lazyWithRetry } = await import('@/lib/mobile/performance');

      render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
        />
      );

      expect(lazyWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        3, // default maxRetries
        1000 // default retryDelay
      );
    });

    it('should use custom retry configuration', async () => {
      const { lazyWithRetry } = await import('@/lib/mobile/performance');

      render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
          maxRetries={5}
          retryDelay={2000}
        />
      );

      expect(lazyWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        5,
        2000
      );
    });
  });

  describe('Component Memoization', () => {
    it('should memoize lazy component based on dependencies', () => {
      const { rerender } = render(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
          maxRetries={3}
          retryDelay={1000}
        />
      );

      const { lazyWithRetry } = require('@/lib/mobile/performance');
      const initialCallCount = vi.mocked(lazyWithRetry).mock.calls.length;

      // Rerender with same props
      rerender(
        <LazyComponent
          loadComponent={() => Promise.resolve({ default: MockComponent })}
          maxRetries={3}
          retryDelay={1000}
        />
      );

      // Should not create new lazy component
      expect(vi.mocked(lazyWithRetry).mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Accessibility', () => {
    it('should have proper loading announcement', async () => {
      render(
        <LazyComponent
          loadComponent={() =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ default: MockComponent }), 100)
            )
          }
        />
      );

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should have accessible error message', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LazyComponent
          loadComponent={() => Promise.reject(new Error('Load failed'))}
        />
      );

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });
});
