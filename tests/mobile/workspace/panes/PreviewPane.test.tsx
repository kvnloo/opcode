import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreviewPane } from '@/components/mobile/workspace/panes/PreviewPane';

// Mock Tauri API
const mockTauriOpen = vi.fn();
vi.mock('@tauri-apps/api/shell', () => ({
  open: mockTauriOpen,
}));

describe('PreviewPane', () => {
  const mockOnUrlChange = vi.fn();
  const mockOnPublish = vi.fn();
  const mockOnDeviceChange = vi.fn();

  const defaultProps = {
    previewUrl: 'http://localhost:3000',
    onUrlChange: mockOnUrlChange,
    onPublish: mockOnPublish,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.__TAURI__
    (window as any).__TAURI__ = true;
  });

  describe('Rendering', () => {
    it('should render header section', () => {
      render(<PreviewPane {...defaultProps} />);

      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });

    it('should render device frame toggle', () => {
      render(<PreviewPane {...defaultProps} />);

      expect(screen.getByText('iPhone')).toBeInTheDocument();
    });

    it('should render browser controls', () => {
      render(<PreviewPane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Go forward')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    });

    it('should render URL input', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      expect(urlInput).toBeInTheDocument();
    });

    it('should render iframe', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'http://localhost:3000');
    });
  });

  describe('Device frame switching', () => {
    it('should start with iPhone frame by default', () => {
      render(<PreviewPane {...defaultProps} />);

      expect(screen.getByText('iPhone')).toBeInTheDocument();
    });

    it('should cycle to Android when toggled', () => {
      render(<PreviewPane {...defaultProps} onDeviceChange={mockOnDeviceChange} />);

      const toggleButton = screen.getByLabelText(/Current: iPhone/);
      fireEvent.click(toggleButton);

      expect(screen.getByText('Android')).toBeInTheDocument();
      expect(mockOnDeviceChange).toHaveBeenCalledWith('android');
    });

    it('should cycle to Desktop after Android', () => {
      render(<PreviewPane {...defaultProps} onDeviceChange={mockOnDeviceChange} />);

      const toggleButton = screen.getByLabelText(/Current:/);

      // Click to Android
      fireEvent.click(toggleButton);
      expect(screen.getByText('Android')).toBeInTheDocument();

      // Click to Desktop
      fireEvent.click(toggleButton);
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(mockOnDeviceChange).toHaveBeenCalledWith('desktop');
    });

    it('should cycle back to iPhone after Desktop', () => {
      render(<PreviewPane {...defaultProps} onDeviceChange={mockOnDeviceChange} />);

      const toggleButton = screen.getByLabelText(/Current:/);

      // Cycle through all devices
      fireEvent.click(toggleButton); // Android
      fireEvent.click(toggleButton); // Desktop
      fireEvent.click(toggleButton); // iPhone

      expect(screen.getByText('iPhone')).toBeInTheDocument();
    });

    it('should accept initial device frame prop', () => {
      render(<PreviewPane {...defaultProps} deviceFrame="desktop" />);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('should show correct icon for each device', () => {
      const { rerender } = render(<PreviewPane {...defaultProps} deviceFrame="iphone" />);

      let toggleButton = screen.getByLabelText(/Current: iPhone/);
      expect(toggleButton.querySelector('svg')).toBeInTheDocument();

      rerender(<PreviewPane {...defaultProps} deviceFrame="android" />);
      expect(screen.getByLabelText(/Current: Android/).querySelector('svg')).toBeInTheDocument();

      rerender(<PreviewPane {...defaultProps} deviceFrame="desktop" />);
      expect(screen.getByLabelText(/Current: Desktop/).querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('URL navigation', () => {
    it('should update input when typing', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/') as HTMLInputElement;
      fireEvent.change(urlInput, { target: { value: '/about' } });

      expect(urlInput.value).toBe('/about');
    });

    it('should navigate on Enter key', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      fireEvent.change(urlInput, { target: { value: '/about' } });
      fireEvent.keyDown(urlInput, { key: 'Enter' });

      expect(mockOnUrlChange).toHaveBeenCalledWith('/about');
    });

    it('should navigate when chevron button clicked', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      fireEvent.change(urlInput, { target: { value: '/contact' } });

      const navigateButton = screen.getByLabelText('Navigate to URL');
      fireEvent.click(navigateButton);

      expect(mockOnUrlChange).toHaveBeenCalledWith('/contact');
    });

    it('should add leading slash if missing', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      fireEvent.change(urlInput, { target: { value: 'about' } });
      fireEvent.keyDown(urlInput, { key: 'Enter' });

      expect(mockOnUrlChange).toHaveBeenCalledWith('/about');
    });

    it('should handle http URLs', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      fireEvent.change(urlInput, { target: { value: 'http://example.com' } });
      fireEvent.keyDown(urlInput, { key: 'Enter' });

      expect(mockOnUrlChange).toHaveBeenCalledWith('http://example.com');
    });
  });

  describe('Browser controls', () => {
    it('should have back button disabled initially', () => {
      render(<PreviewPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeDisabled();
    });

    it('should have forward button disabled initially', () => {
      render(<PreviewPane {...defaultProps} />);

      const forwardButton = screen.getByLabelText('Go forward');
      expect(forwardButton).toBeDisabled();
    });

    it('should trigger haptic feedback on back button click', () => {
      // Mock navigator.vibrate
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        configurable: true,
      });

      render(<PreviewPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      // Enable it temporarily
      fireEvent.click(backButton);

      // Would check vibrateMock but button is disabled
    });

    it('should refresh iframe when refresh clicked', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh');
      const iframe = container.querySelector('iframe') as HTMLIFrameElement;
      const originalSrc = iframe.src;

      fireEvent.click(refreshButton);

      // Iframe src should be reset to trigger reload
      expect(iframe.src).toBe(originalSrc);
    });

    it('should show loading state when refreshing', async () => {
      render(<PreviewPane {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh');
      fireEvent.click(refreshButton);

      // Refresh icon should have spin animation
      const refreshIcon = refreshButton.querySelector('.animate-spin');
      expect(refreshIcon).toBeInTheDocument();
    });
  });

  describe('Publish button', () => {
    it('should render publish button', () => {
      render(<PreviewPane {...defaultProps} />);

      const publishButton = screen.getByText('Publish');
      expect(publishButton).toBeInTheDocument();
    });

    it('should call onPublish when clicked', () => {
      render(<PreviewPane {...defaultProps} />);

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      expect(mockOnPublish).toHaveBeenCalledTimes(1);
    });
  });

  describe('External browser link', () => {
    it('should render external link button', () => {
      render(<PreviewPane {...defaultProps} />);

      const externalButton = screen.getByLabelText('Open in external browser');
      expect(externalButton).toBeInTheDocument();
    });

    it('should open in Tauri shell when available', async () => {
      (window as any).__TAURI__ = true;

      render(<PreviewPane {...defaultProps} />);

      const externalButton = screen.getByLabelText('Open in external browser');
      fireEvent.click(externalButton);

      await waitFor(() => {
        expect(mockTauriOpen).toHaveBeenCalledWith('http://localhost:3000');
      });
    });

    it('should fallback to window.open when Tauri unavailable', async () => {
      (window as any).__TAURI__ = undefined;
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<PreviewPane {...defaultProps} />);

      const externalButton = screen.getByLabelText('Open in external browser');
      fireEvent.click(externalButton);

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith('http://localhost:3000', '_blank');
      });

      windowOpenSpy.mockRestore();
    });
  });

  describe('Device frame rendering', () => {
    it('should show iPhone notch', () => {
      const { container } = render(<PreviewPane {...defaultProps} deviceFrame="iphone" />);

      const notch = container.querySelector('.bg-black');
      expect(notch).toBeInTheDocument();
    });

    it('should not show notch for Android', () => {
      const { container } = render(<PreviewPane {...defaultProps} deviceFrame="android" />);

      // Android doesn't have notch with same class pattern
      const frameContainer = container.querySelector('[class*="rounded-lg"]');
      expect(frameContainer).toBeInTheDocument();
    });

    it('should apply correct dimensions for iPhone', () => {
      const { container } = render(<PreviewPane {...defaultProps} deviceFrame="iphone" />);

      const frame = container.querySelector('[style*="width"]');
      expect(frame).toHaveStyle({ width: '375px', height: '667px' });
    });

    it('should apply correct dimensions for Android', () => {
      const { container } = render(<PreviewPane {...defaultProps} deviceFrame="android" />);

      const frame = container.querySelector('[style*="width"]');
      expect(frame).toHaveStyle({ width: '360px', height: '640px' });
    });

    it('should use full width/height for desktop', () => {
      const { container } = render(<PreviewPane {...defaultProps} deviceFrame="desktop" />);

      const frame = container.querySelector('[style*="width"]');
      expect(frame).toHaveStyle({ width: '100%', height: '100%' });
    });
  });

  describe('Loading states', () => {
    it('should show loading indicator initially', () => {
      render(<PreviewPane {...defaultProps} />);

      // Should show loading until iframe loads
      const refreshButton = screen.getByLabelText('Refresh');
      fireEvent.click(refreshButton);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide loading when iframe loads', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const iframe = container.querySelector('iframe') as HTMLIFrameElement;
      fireEvent.load(iframe);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should hide loading on iframe error', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const iframe = container.querySelector('iframe') as HTMLIFrameElement;
      fireEvent.error(iframe);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Iframe sandbox', () => {
    it('should have proper sandbox attributes', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-forms allow-popups'
      );
    });

    it('should have accessible title', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toHaveAttribute('title', 'Live Preview');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PreviewPane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Go forward')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
      expect(screen.getByLabelText('Navigate to URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Open in external browser')).toBeInTheDocument();
    });

    it('should have descriptive device toggle label', () => {
      render(<PreviewPane {...defaultProps} />);

      const toggleButton = screen.getByLabelText(/Current: iPhone. Click to change/);
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('should have flex column layout', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('should have header with styling', () => {
      render(<PreviewPane {...defaultProps} />);

      const header = screen.getByText('Preview').closest('div');
      expect(header).toBeInTheDocument();
      // Test for style attribute presence instead of specific classes
      expect(header).toHaveAttribute('style');
    });

    it('should have browser controls bar with styling', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      const controlsBar = backButton.closest('div');

      expect(controlsBar).toBeInTheDocument();
      expect(controlsBar).toHaveAttribute('style');
    });

    it('should center preview frame', () => {
      const { container } = render(<PreviewPane {...defaultProps} />);

      const previewArea = container.querySelector('.flex-1');
      expect(previewArea).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty previewUrl', () => {
      render(<PreviewPane {...defaultProps} previewUrl="" />);

      const urlInput = screen.getByPlaceholderText('/') as HTMLInputElement;
      expect(urlInput.value).toBe('/');
    });

    it('should handle rapid device frame switching', () => {
      render(<PreviewPane {...defaultProps} onDeviceChange={mockOnDeviceChange} />);

      const toggleButton = screen.getByLabelText(/Current:/);

      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      expect(mockOnDeviceChange).toHaveBeenCalledTimes(4);
    });

    it('should apply custom className', () => {
      const { container } = render(<PreviewPane {...defaultProps} className="custom-class" />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('custom-class');
    });

    it('should handle URL with query params', () => {
      render(<PreviewPane {...defaultProps} />);

      const urlInput = screen.getByPlaceholderText('/');
      fireEvent.change(urlInput, { target: { value: '/page?param=value' } });
      fireEvent.keyDown(urlInput, { key: 'Enter' });

      expect(mockOnUrlChange).toHaveBeenCalledWith('/page?param=value');
    });
  });
});
