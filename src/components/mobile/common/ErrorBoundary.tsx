import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { HapticButton } from './HapticButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorFallback component - default UI for error boundary
 */
function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  onReset,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onReset?: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: 'var(--mobile-bg-primary)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
      >
        <AlertCircle
          className="w-8 h-8"
          style={{ color: 'var(--mobile-accent-error)' }}
        />
      </div>

      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--mobile-text-primary)' }}
      >
        Something went wrong
      </h2>

      <p
        className="text-sm mb-6 max-w-md"
        style={{ color: 'var(--mobile-text-secondary)' }}
      >
        {error?.message || 'An unexpected error occurred'}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <HapticButton
          onClick={onRetry}
          className="px-6 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: 'var(--mobile-accent-primary)',
            color: 'var(--mobile-text-primary)',
          }}
          hapticType="medium"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </HapticButton>

        {onReset && (
          <HapticButton
            onClick={onReset}
            className="px-6 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: 'var(--mobile-bg-secondary)',
              color: 'var(--mobile-text-primary)',
            }}
            hapticType="light"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </HapticButton>
        )}
      </div>

      {/* Development mode error details */}
      {isDevelopment && error && (
        <details className="mt-8 w-full max-w-2xl">
          <summary
            className="cursor-pointer text-xs font-medium mb-2"
            style={{ color: 'var(--mobile-text-tertiary)' }}
          >
            Error Details (Development Only)
          </summary>
          <div
            className="text-left p-4 rounded-lg overflow-auto max-h-64"
            style={{
              backgroundColor: 'var(--mobile-bg-card)',
              borderRadius: 'var(--mobile-radius-md)',
            }}
          >
            <pre
              className="text-xs whitespace-pre-wrap break-words"
              style={{
                fontFamily: 'var(--mobile-font-mono)',
                color: 'var(--mobile-text-primary)',
              }}
            >
              {error.stack}
            </pre>
            {errorInfo && (
              <pre
                className="text-xs mt-4 whitespace-pre-wrap break-words"
                style={{
                  fontFamily: 'var(--mobile-font-mono)',
                  color: 'var(--mobile-text-secondary)',
                }}
              >
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * PaneErrorBoundary - Error boundary for pane components
 *
 * Catches errors in child components and displays a user-friendly error UI
 * with retry and reset options.
 *
 * @example
 * ```tsx
 * <PaneErrorBoundary onReset={() => navigate('/')}>
 *   <YourPaneComponent />
 * </PaneErrorBoundary>
 * ```
 */
export class PaneErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('PaneErrorBoundary caught error:', error, errorInfo);

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry)
      // reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      if (prevKeys.length !== currentKeys.length ||
          prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.handleRetry();
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReset = () => {
    this.handleRetry();
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReset={this.props.onReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

/**
 * useErrorHandler - Hook for programmatic error throwing
 *
 * Useful for async errors that occur outside of render
 *
 * @example
 * ```tsx
 * const throwError = useErrorHandler();
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   throwError(error);
 * }
 * ```
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error | unknown) => {
    setError(() => {
      throw error instanceof Error ? error : new Error(String(error));
    });
  }, []);
}
