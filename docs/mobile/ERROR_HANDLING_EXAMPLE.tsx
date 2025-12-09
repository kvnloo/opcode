/**
 * Example: Enhanced SharePane with Error Handling
 *
 * This example shows how to integrate the new error handling
 * features into an existing pane component.
 */

import { useState, useCallback } from 'react';
import { Share2, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { PaneErrorBoundary } from '@/components/mobile/common/ErrorBoundary';
import {
  executeWithRetry,
  getUserMessage,
  getErrorAction,
  isRetryableError,
} from '@/lib/mobile/apiErrorHandler';

interface SharePaneProps {
  projectUrl: string;
  projectName: string;
  onCopyLink: () => void;
  onShare: (platform: string) => void;
}

function SharePaneContent({ projectUrl, projectName, onCopyLink, onShare }: SharePaneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Enhanced copy link with retry mechanism
   */
  const handleCopyLink = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Use retry mechanism for clipboard API
      await executeWithRetry(
        async () => {
          await navigator.clipboard.writeText(projectUrl);
        },
        {
          maxRetries: 2,
          initialDelay: 500,
          onRetry: (err, attempt) => {
            console.log(`Retrying clipboard write (attempt ${attempt})...`);
          },
        }
      );

      onCopyLink();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Show user-friendly error message
      setError(getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectUrl, onCopyLink]);

  /**
   * Enhanced share with better error handling
   */
  const handleSystemShare = useCallback(async () => {
    if (!navigator.share) {
      setError('Sharing is not supported on your device');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await executeWithRetry(
        async () => {
          await navigator.share({
            title: projectName,
            text: `Check out my project: ${projectName}`,
            url: projectUrl,
          });
        },
        {
          maxRetries: 1, // Single retry for share API
          shouldRetry: (error) => {
            // Don't retry if user cancelled
            return !String(error).includes('AbortError');
          },
        }
      );

      onShare('system');
    } catch (err) {
      // Only show error if not user cancellation
      if (!String(err).includes('AbortError')) {
        setError(getUserMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectName, projectUrl, onShare]);

  /**
   * Retry handler for retryable errors
   */
  const handleRetry = useCallback(() => {
    setError(null);
    // Retry the last failed operation
    // In production, you might track which operation failed
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Share</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Error Banner with Retry */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                {error}
              </p>
              <p className="text-xs text-red-500 dark:text-red-500">
                {getErrorAction(error)}
              </p>
            </div>
            {isRetryableError(error) && (
              <HapticButton
                onClick={handleRetry}
                className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-md flex-shrink-0"
                hapticType="light"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </HapticButton>
            )}
          </div>
        )}

        {/* Share Link Section */}
        <section>
          <h3 className="text-sm font-semibold mb-3">Share your app</h3>

          {/* Link Preview Card */}
          <div className="p-3 mb-3 bg-card rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Project URL</p>
            <p className="text-sm font-mono truncate">{projectUrl}</p>
          </div>

          <div className="flex gap-2">
            <HapticButton
              onClick={handleCopyLink}
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              hapticType="light"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Copying...
                </>
              ) : copied ? (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </HapticButton>

            {navigator.share && (
              <HapticButton
                onClick={handleSystemShare}
                disabled={isLoading}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                hapticType="light"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </HapticButton>
            )}
          </div>
        </section>

        {/* Additional share options would go here */}
      </div>
    </div>
  );
}

/**
 * Wrapped component with error boundary
 *
 * This is the exported component that consumers use.
 * The error boundary catches any unhandled errors in the component tree.
 */
export function SharePane(props: SharePaneProps) {
  return (
    <PaneErrorBoundary
      onReset={() => {
        // Optional: Reset handler (e.g., navigate away)
        console.log('SharePane error boundary reset');
      }}
      onError={(error, errorInfo) => {
        // Optional: Log to error reporting service
        console.error('SharePane error:', error, errorInfo);
      }}
    >
      <SharePaneContent {...props} />
    </PaneErrorBoundary>
  );
}

/**
 * Migration Checklist for Existing Panes:
 *
 * 1. ✅ Wrap main component in PaneErrorBoundary
 * 2. ✅ Add error state management
 * 3. ✅ Use executeWithRetry for API calls
 * 4. ✅ Replace error messages with getUserMessage()
 * 5. ✅ Add error action hints with getErrorAction()
 * 6. ✅ Show retry button for retryable errors
 * 7. ✅ Add loading states during operations
 * 8. ✅ Handle specific error cases (e.g., user cancellation)
 * 9. ✅ Add error logging
 * 10. ✅ Write tests for error scenarios
 */

/**
 * Example Test for Enhanced Component:
 */
/*
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SharePane } from './SharePane';

describe('SharePane with Error Handling', () => {
  it('should show error when clipboard write fails', async () => {
    // Mock clipboard to fail
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')),
      },
    });

    render(
      <SharePane
        projectUrl="https://example.com"
        projectName="My Project"
        onCopyLink={vi.fn()}
        onShare={vi.fn()}
      />
    );

    const copyButton = screen.getByText(/copy link/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should retry clipboard write on error', async () => {
    const writeText = vi.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValueOnce(undefined);

    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(
      <SharePane
        projectUrl="https://example.com"
        projectName="My Project"
        onCopyLink={vi.fn()}
        onShare={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/copy link/i));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });

  it('should show retry button for retryable errors', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new TypeError('Network error')),
      },
    });

    render(
      <SharePane
        projectUrl="https://example.com"
        projectName="My Project"
        onCopyLink={vi.fn()}
        onShare={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/copy link/i));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
*/
