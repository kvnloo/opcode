/**
 * API Error Handling Utilities
 * Provides consistent error handling and retry logic for API calls
 */

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Check if an error is due to a missing Tauri command
 * Common on mobile platforms where some commands aren't available
 */
export function isCommandNotFoundError(error: unknown): boolean {
  const errorStr = String(error);
  return errorStr.includes('Command') && errorStr.includes('not found');
}

/**
 * Check if running in Tauri environment
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__TAURI__;
}

/**
 * Transform unknown errors into structured ApiError format
 */
export function handleApiError(error: unknown): ApiError {
  // Command not found errors (platform-specific)
  if (isCommandNotFoundError(error)) {
    return {
      code: 'COMMAND_NOT_FOUND',
      message: 'This feature is not available on this platform',
      details: String(error),
    };
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network request failed. Please check your connection.',
      details: error.message,
    };
  }

  // Standard Error objects
  if (error instanceof Error) {
    return {
      code: 'API_ERROR',
      message: error.message,
      details: error.stack,
    };
  }

  // Unknown error types
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: String(error),
  };
}

/**
 * Retry a function with exponential backoff
 * Useful for handling transient network failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on command not found errors
      if (isCommandNotFoundError(err)) {
        throw lastError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Don't delay on last attempt
      if (attempt < retries - 1) {
        const waitTime = delay * Math.pow(backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * Create a timeout wrapper for promises
 * Useful for preventing indefinite hangs
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Safe fallback wrapper for API calls
 * Returns fallback value on error instead of throwing
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  options: {
    logError?: boolean;
    onError?: (error: Error) => void;
  } = {}
): Promise<T> {
  const { logError = true, onError } = options;

  try {
    return await fn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    if (logError) {
      console.error('API call failed, using fallback:', error);
    }

    if (onError) {
      onError(error);
    }

    return fallback;
  }
}

/**
 * Check if an error indicates the feature is unavailable
 */
export function isFeatureUnavailable(error: unknown): boolean {
  return isCommandNotFoundError(error) ||
         (error instanceof Error && error.message.includes('not available'));
}

/**
 * Get user-friendly error message from error object
 */
export function getUserMessage(error: unknown): string {
  const apiError = handleApiError(error);

  switch (apiError.code) {
    case 'COMMAND_NOT_FOUND':
      return 'This feature is not available on your device';
    case 'NETWORK_ERROR':
      return 'Connection failed. Please check your internet connection';
    case 'API_ERROR':
      return apiError.message;
    default:
      return 'Something went wrong. Please try again';
  }
}
