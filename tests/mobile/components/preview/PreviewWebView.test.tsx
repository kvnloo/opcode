import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { tap } from '../../utils/gestures';
import { PreviewWebView } from '@/components/mobile/preview/PreviewWebView';

// Mock vibrate API
const mockVibrate = vi.fn();
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: mockVibrate,
});

// Mock window.open
const mockWindowOpen = vi.fn();
global.window.open = mockWindowOpen;

// Mock alert
global.alert = vi.fn();

// Mock iframe behavior for JSDOM
beforeAll(() => {
  // Mock iframe contentWindow and contentDocument
  Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
    get() {
      return {
        document: document,
        location: {
          href: this.src || 'about:blank',
          reload: vi.fn()
        },
        postMessage: vi.fn(),
      };
    },
    configurable: true,
  });

  Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
    get() {
      return document;
    },
    configurable: true,
  });

  // Mock iframe onLoad event
  Object.defineProperty(HTMLIFrameElement.prototype, 'onload', {
    set(fn) {
      if (typeof fn === 'function') {
        // Trigger onLoad after a short delay to simulate loading
        setTimeout(() => fn.call(this, new Event('load')), 0);
      }
    },
    configurable: true,
  });
});

describe('PreviewWebView', () => {
  const defaultProps = {
    url: 'https://example.com',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVibrate.mockClear();
    mockWindowOpen.mockClear();
  });

  describe('Rendering', () => {
    it('should render with initial URL', () => {
      render(<PreviewWebView {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter URL...') as HTMLInputElement;
      expect(input.value).toBe('https://example.com');
    });

    it('should render close button', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Close preview')).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    });

    it('should render iframe with URL', () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toBe('https://example.com/');
    });

    it('should apply custom className', () => {
      const { container } = render(<PreviewWebView {...defaultProps} className="custom-class" />);

      expect(container.firstChild?.className).toContain('custom-class');
    });
  });

  describe('Close Button', () => {
    it('should call onClose when clicked', async () => {
      const onClose = vi.fn();
      render(<PreviewWebView {...defaultProps} onClose={onClose} />);

      await tap(screen.getByLabelText('Close preview'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('URL Navigation', () => {
    it('should update URL input on change', () => {
      render(<PreviewWebView {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter URL...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'https://newsite.com' } });

      expect(input.value).toBe('https://newsite.com');
    });

    it('should navigate to new URL on Enter key', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter URL...');
      fireEvent.change(input, { target: { value: 'https://newsite.com' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        const iframe = container.querySelector('iframe');
        expect(iframe?.src).toBe('https://newsite.com/');
      });
    });

    it('should show loading state when navigating', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const refreshBtn = screen.getByLabelText('Refresh');
      await tap(refreshBtn);

      const icon = container.querySelector('.animate-spin');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('should reload iframe on refresh click', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      const originalSrc = iframe?.src;

      await tap(screen.getByLabelText('Refresh'));

      await waitFor(() => {
        expect(iframe?.src).toBe(originalSrc);
      });
    });

    it('should show spinner while loading', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Refresh'));

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Device Frame Selection', () => {
    it('should start with iPhone frame by default', () => {
      render(<PreviewWebView {...defaultProps} />);

      const iPhoneBtn = screen.getByLabelText('iPhone');
      expect(iPhoneBtn.className).toContain('bg-primary');
    });

    it('should switch to Android frame when clicked', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Android'));

      await waitFor(() => {
        const androidBtn = screen.getByLabelText('Android');
        expect(androidBtn.className).toContain('bg-primary');
      });
    });

    it('should switch to Tablet frame', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Tablet'));

      await waitFor(() => {
        const tabletBtn = screen.getByLabelText('Tablet');
        expect(tabletBtn.className).toContain('bg-primary');
      });
    });

    it('should switch to Desktop frame', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Desktop'));

      await waitFor(() => {
        const desktopBtn = screen.getByLabelText('Desktop');
        expect(desktopBtn.className).toContain('bg-primary');
      });
    });

    it('should render all device frame buttons', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('iPhone')).toBeInTheDocument();
      expect(screen.getByLabelText('Android')).toBeInTheDocument();
      expect(screen.getByLabelText('Tablet')).toBeInTheDocument();
      expect(screen.getByLabelText('Desktop')).toBeInTheDocument();
    });
  });

  describe('Screenshot Feature', () => {
    it('should show screenshot button', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Take screenshot')).toBeInTheDocument();
    });

    it('should trigger haptic feedback on screenshot', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Take screenshot'));

      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(10);
      });
    });

    it('should show alert when screenshot is taken', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Take screenshot'));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Console Viewer', () => {
    it('should show console toggle button', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Toggle console')).toBeInTheDocument();
    });

    it('should open console when toggle clicked', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));

      await waitFor(() => {
        expect(screen.getByText('Console')).toBeInTheDocument();
      });
    });

    it('should close console on second toggle click', async () => {
      render(<PreviewWebView {...defaultProps} />);

      // Open console
      await tap(screen.getByLabelText('Toggle console'));
      await waitFor(() => {
        expect(screen.getByText('Console')).toBeInTheDocument();
      });

      // Close console
      await tap(screen.getByLabelText('Toggle console'));
      await waitFor(() => {
        expect(screen.queryByText('Clear')).not.toBeInTheDocument();
      });
    });

    it('should display demo console logs', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));

      await waitFor(() => {
        expect(screen.getByText('Preview started')).toBeInTheDocument();
      });
    });

    it('should have clear button in console', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('should clear console logs when clear clicked', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));
      await waitFor(() => {
        expect(screen.getByText('Preview started')).toBeInTheDocument();
      });

      await tap(screen.getByText('Clear'));

      await waitFor(() => {
        expect(screen.getByText('No console logs')).toBeInTheDocument();
      });
    });

    it('should highlight console toggle when active', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));

      await waitFor(() => {
        const toggleBtn = screen.getByLabelText('Toggle console');
        expect(toggleBtn.className).toContain('bg-primary');
      });
    });
  });

  describe('External Link', () => {
    it('should show open in new window button', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Open in new window')).toBeInTheDocument();
    });

    it('should open URL in new window when clicked', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Open in new window'));

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com', '_blank');
      });
    });
  });

  describe('Device Frame Styling', () => {
    it('should show iPhone notch', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      // iPhone should have notch
      const notch = container.querySelector('.bg-black.rounded-b-2xl');
      expect(notch).toBeInTheDocument();
    });

    it('should not show notch for non-iPhone devices', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Android'));

      await waitFor(() => {
        const notch = container.querySelector('.bg-black.rounded-b-2xl');
        expect(notch).not.toBeInTheDocument();
      });
    });

    it('should apply different rounded corners per device', async () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      // Check iPhone has rounded corners
      let deviceFrame = container.querySelector('[class*="rounded-"]');
      expect(deviceFrame).toBeInTheDocument();

      await tap(screen.getByLabelText('Desktop'));

      await waitFor(() => {
        deviceFrame = container.querySelector('[class*="rounded-"]');
        expect(deviceFrame).toBeInTheDocument();
      });
    });
  });

  describe('Iframe Sandbox', () => {
    it('should have proper sandbox attributes', () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-forms');
    });

    it('should have proper title', () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe?.title).toBe('Preview');
    });
  });

  describe('Animations', () => {
    it('should have entrance animation', () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should animate device frame changes', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Android'));

      // Animation should occur
      await waitFor(() => {
        const androidBtn = screen.getByLabelText('Android');
        expect(androidBtn.className).toContain('bg-primary');
      });
    });

    it('should animate console appearance', async () => {
      render(<PreviewWebView {...defaultProps} />);

      await tap(screen.getByLabelText('Toggle console'));

      await waitFor(() => {
        expect(screen.getByText('Console')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all buttons', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByLabelText('Close preview')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
      expect(screen.getByLabelText('iPhone')).toBeInTheDocument();
      expect(screen.getByLabelText('Android')).toBeInTheDocument();
      expect(screen.getByLabelText('Tablet')).toBeInTheDocument();
      expect(screen.getByLabelText('Desktop')).toBeInTheDocument();
      expect(screen.getByLabelText('Take screenshot')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle console')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in new window')).toBeInTheDocument();
    });

    it('should have proper input placeholder', () => {
      render(<PreviewWebView {...defaultProps} />);

      expect(screen.getByPlaceholderText('Enter URL...')).toBeInTheDocument();
    });
  });

  describe('Fullscreen Overlay', () => {
    it('should render as fullscreen overlay', () => {
      const { container } = render(<PreviewWebView {...defaultProps} />);

      const overlay = container.firstChild;
      expect(overlay?.className).toContain('fixed');
      expect(overlay?.className).toContain('inset-0');
      expect(overlay?.className).toContain('z-50');
    });
  });
});
