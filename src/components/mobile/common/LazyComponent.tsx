import React, { Suspense, ComponentType } from 'react';
import { lazyWithRetry } from '@/lib/mobile/performance';

interface LazyComponentProps {
  /**
   * Function that returns the component import
   */
  loadComponent: () => Promise<{ default: ComponentType<any> }>;

  /**
   * Props to pass to the lazy-loaded component
   */
  componentProps?: Record<string, any>;

  /**
   * Custom loading skeleton
   */
  loadingSkeleton?: React.ReactNode;

  /**
   * Custom error fallback
   */
  errorFallback?: React.ReactNode;

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retry attempts in ms
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Callback when component loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when component fails to load
   */
  onError?: (error: Error) => void;
}

/**
 * Default loading skeleton component
 */
const DefaultLoadingSkeleton: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <div className="space-y-3 w-full max-w-md">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
    </div>
  </div>
);

/**
 * Default error fallback component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  {
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    children: React.ReactNode;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponent Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="w-full h-full flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-600 dark:text-red-400">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Failed to load component
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              aria-label="Retry loading component"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lazy component wrapper with loading skeleton and error boundary
 * Automatically retries failed imports and provides accessible loading states
 *
 * @example
 * ```tsx
 * <LazyComponent
 *   loadComponent={() => import('./HeavyComponent')}
 *   componentProps={{ userId: 123 }}
 *   loadingSkeleton={<CustomSkeleton />}
 *   onLoad={() => console.log('Component loaded')}
 * />
 * ```
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  loadComponent,
  componentProps = {},
  loadingSkeleton,
  errorFallback,
  maxRetries = 3,
  retryDelay = 1000,
  onLoad,
  onError,
}) => {
  // Create lazy component with retry logic
  const LazyLoadedComponent = React.useMemo(
    () => lazyWithRetry(loadComponent, maxRetries, retryDelay),
    [loadComponent, maxRetries, retryDelay]
  );

  // Track load status
  React.useEffect(() => {
    // This effect runs after the component mounts successfully
    const timer = setTimeout(() => {
      onLoad?.();
    }, 0);

    return () => clearTimeout(timer);
  }, [onLoad]);

  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense
        fallback={
          <div role="status" aria-live="polite" aria-label="Loading content">
            {loadingSkeleton || <DefaultLoadingSkeleton />}
          </div>
        }
      >
        <LazyLoadedComponent {...componentProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Hook for creating lazy components with consistent configuration
 */
export function useLazyComponent<T extends ComponentType<any>>(
  loadComponent: () => Promise<{ default: T }>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  }
) {
  const { maxRetries = 3, retryDelay = 1000 } = options || {};

  return React.useMemo(
    () => lazyWithRetry(loadComponent, maxRetries, retryDelay),
    [loadComponent, maxRetries, retryDelay]
  );
}
