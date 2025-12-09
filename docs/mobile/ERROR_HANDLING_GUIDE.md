# Mobile Error Handling Enhancement Guide

## Overview

This guide documents the error handling enhancements added to mobile pane components, including:

1. **PaneErrorBoundary** - React error boundary component
2. **Enhanced apiErrorHandler** - Retry mechanisms and error categorization
3. **Error UI patterns** - User-friendly error states with retry functionality

## Components Created

### 1. ErrorBoundary Component

**Location**: `src/components/mobile/common/ErrorBoundary.tsx`

**Features**:
- Catches and handles React component errors
- Provides user-friendly error UI
- Retry functionality
- Development-mode error details
- Customizable fallback UI

**Usage**:
```tsx
import { PaneErrorBoundary } from '@/components/mobile/common/ErrorBoundary';

function MyPane() {
  return (
    <PaneErrorBoundary onReset={() => navigate('/')}>
      <PaneContent />
    </PaneErrorBoundary>
  );
}
```

### 2. Enhanced API Error Handler

**Location**: `src/lib/mobile/apiErrorHandler.ts`

**New Functions**:

#### `executeWithRetry<T>`
Execute functions with automatic retry and exponential backoff.

```tsx
const data = await executeWithRetry(
  () => api.fetchData(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}`);
    },
  }
);
```

#### `categorizeError(error)`
Categorize errors into types:
- NETWORK
- AUTHENTICATION
- PERMISSION
- VALIDATION
- NOT_FOUND
- TIMEOUT
- SERVER
- UNKNOWN

#### `getErrorAction(error)`
Get user-friendly action suggestion based on error type.

#### `isRetryableError(error)`
Check if an error should be retried automatically.

#### `errorToToast(error, options)`
Convert error to toast notification format.

```tsx
const toast = errorToToast(error, {
  showRetry: true,
  onRetry: () => refetch(),
});
```

## Integration Patterns

### Pattern 1: Basic Error Boundary

```tsx
import { PaneErrorBoundary } from '@/components/mobile/common/ErrorBoundary';

export function MyPane() {
  return (
    <PaneErrorBoundary>
      <MyPaneContent />
    </PaneErrorBoundary>
  );
}
```

### Pattern 2: Error Boundary with Reset

```tsx
export function MyPane({ onClose }: Props) {
  return (
    <PaneErrorBoundary onReset={onClose}>
      <MyPaneContent />
    </PaneErrorBoundary>
  );
}
```

### Pattern 3: API Calls with Retry

```tsx
import { executeWithRetry, getUserMessage } from '@/lib/mobile/apiErrorHandler';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await executeWithRetry(
        () => api.fetchData(),
        {
          maxRetries: 3,
          onRetry: (err, attempt) => {
            console.log(`Retrying (${attempt})...`);
          },
        }
      );
      setData(data);
    } catch (err) {
      setError(getUserMessage(err));
    }
  };

  return (
    <>
      {error && <ErrorDisplay message={error} />}
      {/* ... */}
    </>
  );
}
```

### Pattern 4: Error UI with Retry Button

```tsx
import {
  getUserMessage,
  getErrorAction,
  isRetryableError,
} from '@/lib/mobile/apiErrorHandler';

function ErrorDisplay({ error, onRetry }: Props) {
  return (
    <div className="error-container">
      <AlertCircle className="error-icon" />
      <p className="error-message">{getUserMessage(error)}</p>
      <p className="error-action">{getErrorAction(error)}</p>

      {isRetryableError(error) && (
        <HapticButton onClick={onRetry}>
          <RefreshCw className="icon" />
          Retry
        </HapticButton>
      )}
    </div>
  );
}
```

### Pattern 5: Complete Pane Integration

```tsx
import { useState } from 'react';
import { PaneErrorBoundary } from '@/components/mobile/common/ErrorBoundary';
import {
  executeWithRetry,
  getUserMessage,
  getErrorAction,
  isRetryableError,
} from '@/lib/mobile/apiErrorHandler';

export function DatabasePane() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await executeWithRetry(
        () => api.fetchData(),
        {
          maxRetries: 3,
          onRetry: (err, attempt) => {
            console.log(`Retry ${attempt}...`);
          },
        }
      );
      setData(data);
    } catch (err) {
      setError(getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaneErrorBoundary>
      <div className="pane">
        {error && (
          <div className="error-banner">
            <AlertCircle />
            <div>
              <p>{error}</p>
              <p className="text-sm">{getErrorAction(error)}</p>
            </div>
            {isRetryableError(error) && (
              <button onClick={loadData}>Retry</button>
            )}
          </div>
        )}
        {/* Pane content */}
      </div>
    </PaneErrorBoundary>
  );
}
```

## Error Handling Best Practices

### 1. Always Wrap Panes in Error Boundaries

```tsx
// ✅ Good
<PaneErrorBoundary>
  <MyPane />
</PaneErrorBoundary>

// ❌ Bad - no error boundary
<MyPane />
```

### 2. Use Retry for Transient Errors

```tsx
// ✅ Good - retry network errors
await executeWithRetry(() => api.fetch(), { maxRetries: 3 });

// ❌ Bad - no retry for network issues
await api.fetch();
```

### 3. Show User-Friendly Messages

```tsx
// ✅ Good - user-friendly message
setError(getUserMessage(err));

// ❌ Bad - technical error message
setError(err.message);
```

### 4. Provide Actionable Guidance

```tsx
// ✅ Good - tell user what to do
<>
  <p>{getUserMessage(error)}</p>
  <p>{getErrorAction(error)}</p>
</>

// ❌ Bad - just show error
<p>{error.message}</p>
```

### 5. Only Show Retry for Retryable Errors

```tsx
// ✅ Good - check if retryable
{isRetryableError(error) && <RetryButton />}

// ❌ Bad - always show retry
<RetryButton />
```

## Testing

### Test Files Created

1. **ErrorBoundary tests**: `tests/mobile/common/ErrorBoundary.test.tsx`
2. **API error handler tests**: `tests/mobile/lib/apiErrorHandler.test.ts`

### Running Tests

```bash
# Run all error handling tests
npm test -- ErrorBoundary
npm test -- apiErrorHandler

# Run with coverage
npm test -- --coverage ErrorBoundary apiErrorHandler
```

### Example Test Cases

#### ErrorBoundary Tests
- ✅ Renders children when no error
- ✅ Shows error UI when error occurs
- ✅ Retry resets error state
- ✅ Calls onError callback
- ✅ Shows custom fallback when provided
- ✅ Resets on resetKeys change

#### API Error Handler Tests
- ✅ Handles different error types
- ✅ Retries with exponential backoff
- ✅ Respects max retries
- ✅ Doesn't retry non-retryable errors
- ✅ Categorizes errors correctly
- ✅ Provides user-friendly messages
- ✅ Converts errors to toast format

## Error Categories

| Category | Description | Retryable | User Action |
|----------|-------------|-----------|-------------|
| NETWORK | Network/connection errors | ✅ Yes | Check internet connection |
| TIMEOUT | Request timeout | ✅ Yes | Try again |
| SERVER | Server errors (500) | ✅ Yes | Try again later |
| AUTHENTICATION | Auth failures | ❌ No | Sign in again |
| PERMISSION | Access denied | ❌ No | Contact admin |
| VALIDATION | Invalid input | ❌ No | Check input |
| NOT_FOUND | Resource not found | ❌ No | Check resource exists |
| UNKNOWN | Unexpected errors | ❌ No | Contact support |

## Migration Checklist

To add error handling to existing panes:

- [ ] Wrap pane in `PaneErrorBoundary`
- [ ] Use `executeWithRetry` for API calls
- [ ] Replace error messages with `getUserMessage(error)`
- [ ] Add error action hints with `getErrorAction(error)`
- [ ] Show retry button for retryable errors
- [ ] Add error state UI components
- [ ] Write tests for error scenarios
- [ ] Test retry functionality
- [ ] Verify error logging
- [ ] Check mobile-specific error handling

## Examples by Pane Type

### Data-Fetching Pane (DatabasePane, KeyValueStorePane)
```tsx
const loadData = async () => {
  try {
    const data = await executeWithRetry(() => api.fetch());
    setData(data);
  } catch (err) {
    setError(getUserMessage(err));
  }
};
```

### Form Pane (SecretsPane, UserSettingsPane)
```tsx
const handleSubmit = async () => {
  try {
    await executeWithRetry(() => api.save(values), { maxRetries: 2 });
    onSuccess();
  } catch (err) {
    setError(getUserMessage(err));
  }
};
```

### Real-time Pane (ConsolePane, ShellPane)
```tsx
// Use shorter retry times for real-time panes
const execute = async (command: string) => {
  try {
    const result = await executeWithRetry(
      () => api.execute(command),
      { maxRetries: 1, initialDelay: 500 }
    );
    setOutput(result);
  } catch (err) {
    setError(getUserMessage(err));
  }
};
```

## Next Steps

1. Apply error boundaries to all panes
2. Add retry mechanisms to API calls
3. Implement user-friendly error UIs
4. Add comprehensive error tests
5. Monitor error rates in production
6. Consider error reporting service integration
