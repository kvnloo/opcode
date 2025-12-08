# PublishingPane Component

## Overview

The `PublishingPane` component provides a mobile-optimized interface for publishing and deploying applications. It features subdomain management, availability checking, upgrade promotions, and deployment history tracking.

## Location

```
/home/kvn/workspace/evolve/repos/opcode/src/components/mobile/workspace/panes/PublishingPane.tsx
```

## Features

### 1. Header Section
- Back navigation button (optional)
- "Publishing" title with broadcast/antenna icon
- More options menu button

### 2. Primary URL Configuration
- Subdomain input with real-time validation
- Custom suffix support (`.opcode.app`, `.replit.app`, etc.)
- Availability checking with debounced input
- Visual indicators:
  - ✅ Green checkmark + "Available" when valid
  - ❌ Red X + error message when taken
  - ⏳ Loading spinner during availability check

### 3. Upgrade Promo Card
- Star icon with "Limited time offer" messaging
- Benefits list with icons:
  - Free '.com' domain (up to $13 value)
  - Monthly credits for Opcode Agent
  - Live app publishing and persistence
  - Access to powerful models
- "Free domain included" badge
- Full-width "Upgrade now" CTA button

### 4. Publishing Controls
- Primary publish button with loading states:
  - Disabled when subdomain unavailable or invalid
  - Shows spinner during publishing
  - Transforms to success card when published
- Published status card:
  - Green success indicator
  - Live URL with external link
  - Copy-to-clipboard functionality

### 5. Expandable Info Section
- "What does publishing do?" accordion
- Educational content:
  - Globe icon: Publishing explanation
  - Dollar icon: Cost information
- Action buttons:
  - "Watch video" tutorial link
  - "Learn more" documentation link

### 6. Deployment History
- Recent deployments list (up to 5 shown)
- Status indicators:
  - 🟢 Active (green)
  - 🟡 Building (yellow, pulsing)
  - 🔴 Failed (red)
- Timestamp display
- External links to active deployments

## Props

```typescript
interface PublishingPaneProps {
  // Subdomain state
  subdomain: string;
  onSubdomainChange: (value: string) => void;

  // Availability checking
  isAvailable: boolean;
  isChecking: boolean;

  // Publishing state
  publishStatus: 'unpublished' | 'publishing' | 'published';
  onPublish: () => void;

  // Navigation
  onBack?: () => void;

  // Optional features
  deploymentHistory?: Deployment[];
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  suffix?: string; // Default: ".opcode.app"
}

interface Deployment {
  id: string;
  subdomain: string;
  status: 'active' | 'building' | 'failed';
  timestamp: Date;
  url: string;
}
```

## Usage Examples

### Basic Usage

```tsx
import { PublishingPane } from '@/components/mobile/workspace/panes';

function MyApp() {
  const [subdomain, setSubdomain] = useState('my-app');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [publishStatus, setPublishStatus] = useState('unpublished');

  const handlePublish = () => {
    setPublishStatus('publishing');
    // Perform publish operation
    setTimeout(() => setPublishStatus('published'), 2000);
  };

  return (
    <PublishingPane
      subdomain={subdomain}
      onSubdomainChange={setSubdomain}
      isAvailable={isAvailable}
      isChecking={isChecking}
      publishStatus={publishStatus}
      onPublish={handlePublish}
    />
  );
}
```

### With Availability Checking

```tsx
import { PublishingPane } from '@/components/mobile/workspace/panes';
import { useDebounce } from '@/hooks/useDebounce';

function MyApp() {
  const [subdomain, setSubdomain] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const debouncedSubdomain = useDebounce(subdomain, 500);

  // Check availability when debounced value changes
  useEffect(() => {
    if (!debouncedSubdomain) return;

    setIsChecking(true);
    checkSubdomainAvailability(debouncedSubdomain)
      .then(setIsAvailable)
      .finally(() => setIsChecking(false));
  }, [debouncedSubdomain]);

  return (
    <PublishingPane
      subdomain={subdomain}
      onSubdomainChange={setSubdomain}
      isAvailable={isAvailable}
      isChecking={isChecking}
      publishStatus="unpublished"
      onPublish={() => {}}
    />
  );
}
```

### With Deployment History

```tsx
import { PublishingPane, Deployment } from '@/components/mobile/workspace/panes';

function MyApp() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      subdomain: 'my-app-v1',
      status: 'active',
      timestamp: new Date('2024-01-15'),
      url: 'https://my-app-v1.opcode.app',
    },
    {
      id: '2',
      subdomain: 'my-app-staging',
      status: 'building',
      timestamp: new Date('2024-01-16'),
      url: 'https://my-app-staging.opcode.app',
    },
  ]);

  return (
    <PublishingPane
      subdomain="my-app"
      onSubdomainChange={() => {}}
      isAvailable={true}
      isChecking={false}
      publishStatus="unpublished"
      onPublish={() => {}}
      deploymentHistory={deployments}
    />
  );
}
```

### With Custom Suffix (Replit)

```tsx
import { PublishingPane } from '@/components/mobile/workspace/panes';

function ReplitApp() {
  return (
    <PublishingPane
      subdomain="hex-conquest--veeman961"
      onSubdomainChange={() => {}}
      isAvailable={true}
      isChecking={false}
      publishStatus="unpublished"
      onPublish={() => {}}
      suffix=".replit.app"
    />
  );
}
```

## Styling

The component uses Tailwind CSS classes and follows the application's design system:

- **Colors**: Uses CSS variables from the theme system
- **Layout**: Flexbox with responsive spacing
- **Typography**: Hierarchical text sizes and weights
- **States**: Hover, active, disabled states
- **Animations**: Smooth transitions and loading states

### Key Design Elements

```css
/* Header */
- Height: auto with py-3 padding
- Border: Bottom border for separation
- Icons: 20px (w-5 h-5)

/* Content */
- Padding: px-4 py-6
- Spacing: space-y-6 between sections

/* Cards */
- Border radius: rounded-lg
- Shadow: shadow-xs
- Padding: p-4 for content

/* Buttons */
- Primary: Full width with lg size
- Secondary: outline variant
- Loading: Spinner animation

/* Input */
- Height: h-9 (36px)
- Border: border-input color
- Focus: ring-1 with primary color
```

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labels for icon-only buttons
- **Focus States**: Visible focus indicators
- **Screen Readers**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliant
- **Loading States**: Clear visual feedback during operations

## State Management

### Subdomain Validation

```typescript
// Subdomain must be:
// - Lowercase alphanumeric + hyphens
// - No special characters
// - Trimmed whitespace

const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  onSubdomainChange(value);
};
```

### Publish Flow

```
unpublished → [user clicks] → publishing → [API success] → published
                                    ↓
                              [API failure]
                                    ↓
                              unpublished (with error toast)
```

### Availability Checking

```
Input change → Debounce (500ms) → API call → Update isAvailable
                                       ↓
                                  Show indicator
```

## Performance Considerations

1. **Debounced Input**: 500ms debounce prevents excessive API calls
2. **Lazy Loading**: Deployment history limited to 5 most recent
3. **Optimized Re-renders**: Memoized callbacks with `useCallback`
4. **Conditional Rendering**: Info section only renders when expanded

## Integration Points

### Toast Notifications

```typescript
const handleShowToast = (message: string, type: 'success' | 'error') => {
  // Integrate with your toast system
  toast({ message, type, duration: 3000 });
};

<PublishingPane
  onShowToast={handleShowToast}
  // ... other props
/>
```

### Navigation

```typescript
const handleBack = () => {
  router.back();
  // or
  navigate('/workspace');
};

<PublishingPane
  onBack={handleBack}
  // ... other props
/>
```

## Dependencies

- `react` - Core React library
- `lucide-react` - Icon components
- `@/components/ui/button` - Button component
- `@/components/ui/input` - Input component
- `@/components/ui/card` - Card components
- `@/lib/utils` - Utility functions (cn)

## Related Components

- `/src/components/mobile/workspace/SwipeablePane.tsx` - Swipeable container
- `/src/components/mobile/workspace/PaneContainer.tsx` - Pane management
- `/src/components/ui/button.tsx` - Button primitives
- `/src/components/ui/input.tsx` - Input primitives
- `/src/components/ui/card.tsx` - Card primitives

## Future Enhancements

1. **Custom Domain Management**: Add/remove custom domains
2. **SSL Certificate Status**: Show SSL provisioning state
3. **Analytics Integration**: Track deployment metrics
4. **Rollback Support**: One-click rollback to previous deployments
5. **Environment Variables**: Manage environment configuration
6. **Build Logs**: View real-time deployment logs
7. **Preview URLs**: Generate preview URLs for branches
8. **Deployment Settings**: Configure build commands, output directory, etc.

## Testing

See `PublishingPane.example.tsx` for interactive examples:

```bash
# Run example in development
npm run dev

# Access at: /examples/publishing-pane
```

## Troubleshooting

### Subdomain not validating
- Ensure debounce is working (500ms delay)
- Check API endpoint is accessible
- Verify network requests in DevTools

### Publish button disabled
- Confirm `isAvailable` is true
- Check subdomain is not empty
- Verify `publishStatus` is not 'publishing'

### Deployment history not showing
- Ensure `deploymentHistory` prop is provided
- Check array is not empty
- Verify Deployment objects have required fields

## License

Internal component for Opcode mobile application.
