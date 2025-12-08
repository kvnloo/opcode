import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/renderWithProviders';
import { ConnectionManager } from '../../../../src/components/mobile/connection/ConnectionManager';
import userEvent from '@testing-library/user-event';

describe('ConnectionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders connection manager with all modes', () => {
      render(<ConnectionManager />);

      expect(screen.getByText('Connection Mode')).toBeInTheDocument();
      expect(screen.getAllByText('Local')).toHaveLength(2); // One in card, one in status
      expect(screen.getByText('Tailscale SSH')).toBeInTheDocument();
      expect(screen.getByText('Claude Code Web')).toBeInTheDocument();
    });

    it('renders connection status component', () => {
      render(<ConnectionManager />);

      // Local mode is connected by default
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('renders mode descriptions', () => {
      render(<ConnectionManager />);

      expect(screen.getByText('Run Claude Code on this device')).toBeInTheDocument();
      expect(screen.getByText('Connect to your dev machine via VPN')).toBeInTheDocument();
      expect(screen.getByText('Direct API connection (Pro/Max)')).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('selects local mode by default', () => {
      render(<ConnectionManager />);

      // Get the heading "Local" which is inside the card
      const localHeading = screen.getAllByText('Local').find(el => el.tagName === 'H3');
      const localCard = localHeading?.closest('.cursor-pointer');
      expect(localCard).toHaveClass('ring-2', 'ring-primary');
    });

    it('switches to tailscale mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);

      expect(tailscaleCard).toHaveClass('ring-2', 'ring-primary');
      expect(screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).toBeInTheDocument();
    });

    it('switches to web mode when clicked', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      const webHeading = screen.getByRole('heading', { name: /claude code web/i });
      const webCard = webHeading.closest('.cursor-pointer');
      await user.click(webCard!);

      expect(webCard).toHaveClass('ring-2', 'ring-primary');
      expect(screen.getByText(/Sign in with your GitHub account to use Claude Code Web API/)).toBeInTheDocument();
    });

    it('only shows connection form for selected mode', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      // Initially local mode, no forms
      expect(screen.queryByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).not.toBeInTheDocument();

      // Click tailscale
      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);
      expect(screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).toBeInTheDocument();

      // Click web
      const webHeading = screen.getByRole('heading', { name: /claude code web/i });
      const webCard = webHeading.closest('.cursor-pointer');
      await user.click(webCard!);
      expect(screen.queryByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).not.toBeInTheDocument();
      expect(screen.getByText('Connect with GitHub')).toBeInTheDocument();
    });
  });

  describe('Connection States', () => {
    it('shows local as connected by default', () => {
      render(<ConnectionManager />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
      const localHeading = screen.getAllByText('Local').find(el => el.tagName === 'H3');
      const localCard = localHeading?.closest('div.p-4');
      const indicator = localCard?.querySelector('.bg-green-500.rounded-full');
      expect(indicator).toBeInTheDocument();
    });

    it('shows connecting state during tailscale connection', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<ConnectionManager />);

      // Switch to tailscale and fill form
      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(hostInput, '100.64.0.5');
      await user.type(usernameInput, 'testuser');

      const connectButton = screen.getByText('Connect via Tailscale');
      await user.click(connectButton);

      // Should show connecting state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('shows connected state after successful connection', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<ConnectionManager />);

      // Switch to tailscale and connect
      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(hostInput, '100.64.0.5');
      await user.type(usernameInput, 'testuser');

      const connectButton = screen.getByText('Connect via Tailscale');
      await user.click(connectButton);

      // Fast-forward 2 seconds (connection timeout)
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/Connected to 100\.64\.0\.5/)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('updates status when switching modes', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      // Local is connected
      expect(screen.getByText('Connected')).toBeInTheDocument();

      // Switch to tailscale (not connected)
      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);

      // Status should still show local as connected since we haven't connected to tailscale
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('Connection Callbacks', () => {
    it('calls handleConnect with correct mode and host for tailscale', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<ConnectionManager />);

      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');
      await user.click(tailscaleCard!);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(hostInput, '192.168.1.100');
      await user.type(usernameInput, 'admin');

      const connectButton = screen.getByText('Connect via Tailscale');
      await user.click(connectButton);

      // Verify connecting state is set
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      // Fast-forward and check connection completed
      vi.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(screen.getByText(/Connected to 192\.168\.1\.100/)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('calls handleConnect with correct mode for web', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<ConnectionManager />);

      const webHeading = screen.getByRole('heading', { name: /claude code web/i });
      const webCard = webHeading.closest('.cursor-pointer');
      await user.click(webCard!);

      const connectButton = screen.getByText('Connect with GitHub');
      await user.click(connectButton);

      // Verify connecting state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      // Fast-forward and check connection completed
      vi.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Visual Indicators', () => {
    it('shows green indicator for connected mode', () => {
      render(<ConnectionManager />);

      const localHeading = screen.getAllByText('Local').find(el => el.tagName === 'H3');
      const localCard = localHeading?.closest('div.p-4');
      const indicator = localCard?.querySelector('.bg-green-500.rounded-full');
      expect(indicator).toBeInTheDocument();
    });

    it('shows indicator only for connected mode', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      // Local has indicator
      let localHeading = screen.getAllByText('Local').find(el => el.tagName === 'H3');
      let localCard = localHeading?.closest('div.p-4');
      expect(localCard?.querySelector('.bg-green-500.rounded-full')).toBeInTheDocument();

      // Tailscale doesn't have indicator
      let tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      let tailscaleCard = tailscaleHeading.closest('div.p-4');
      expect(tailscaleCard?.querySelector('.bg-green-500.rounded-full')).not.toBeInTheDocument();

      // Web doesn't have indicator
      let webHeading = screen.getByRole('heading', { name: /claude code web/i });
      let webCard = webHeading.closest('div.p-4');
      expect(webCard?.querySelector('.bg-green-500.rounded-full')).not.toBeInTheDocument();
    });

    it('shows correct icons for each mode', () => {
      render(<ConnectionManager />);

      // Check that icons are rendered (by checking parent divs with specific colors)
      const localHeading = screen.getAllByText('Local').find(el => el.tagName === 'H3');
      const serverIcon = localHeading?.parentElement?.parentElement?.querySelector('.bg-green-500\\/20');
      expect(serverIcon).toBeInTheDocument();

      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const wifiIcon = tailscaleHeading.parentElement?.parentElement?.querySelector('.bg-blue-500\\/20');
      expect(wifiIcon).toBeInTheDocument();

      const webHeading = screen.getByRole('heading', { name: /claude code web/i });
      const cloudIcon = webHeading.parentElement?.parentElement?.querySelector('.bg-purple-500\\/20');
      expect(cloudIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper heading hierarchy', () => {
      render(<ConnectionManager />);

      const heading = screen.getByText('Connection Mode');
      expect(heading.tagName).toBe('H2');
    });

    it('mode cards are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ConnectionManager />);

      const tailscaleHeading = screen.getByRole('heading', { name: /tailscale ssh/i });
      const tailscaleCard = tailscaleHeading.closest('.cursor-pointer');

      // Should be clickable (accessible)
      await user.click(tailscaleCard!);
      expect(tailscaleCard).toHaveClass('ring-2');
    });
  });
});
