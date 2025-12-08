import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders';
import { ConnectionStatus } from '../../../../src/components/mobile/connection/ConnectionStatus';

describe('ConnectionStatus', () => {
  describe('Status Icons', () => {
    it('shows CheckCircle icon for connected status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      const statusDiv = screen.getByText('Local').closest('div');
      expect(statusDiv).toHaveClass('bg-green-500/10');
    });

    it('shows Loader2 icon for connecting status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'tailscale', status: 'connecting' }}
        />
      );

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('shows AlertCircle icon for error status', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'web',
            status: 'error',
            error: 'Connection failed',
          }}
        />
      );

      const statusDiv = screen.getByText('Claude Web').closest('div');
      expect(statusDiv).toHaveClass('bg-red-500/10');
    });

    it('shows WifiOff icon for disconnected status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'disconnected' }}
        />
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  describe('Status Text', () => {
    it('displays "Connected" for connected status without host', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('displays "Connected to {host}" for connected status with host', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'tailscale',
            status: 'connected',
            host: '100.64.0.5',
          }}
        />
      );

      expect(screen.getByText('Connected to 100.64.0.5')).toBeInTheDocument();
    });

    it('displays "Connecting..." for connecting status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'web', status: 'connecting' }}
        />
      );

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('displays error message for error status', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'tailscale',
            status: 'error',
            error: 'Authentication failed',
          }}
        />
      );

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });

    it('displays default error message when error is not provided', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'web', status: 'error' }}
        />
      );

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('displays "Disconnected" for disconnected status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'disconnected' }}
        />
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  describe('Mode Labels', () => {
    it('displays "Local" for local mode', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      expect(screen.getByText('Local')).toBeInTheDocument();
    });

    it('displays "Tailscale SSH" for tailscale mode', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'tailscale', status: 'disconnected' }}
        />
      );

      expect(screen.getByText('Tailscale SSH')).toBeInTheDocument();
    });

    it('displays "Claude Web" for web mode', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'web', status: 'connecting' }}
        />
      );

      expect(screen.getByText('Claude Web')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies green background for connected status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      const container = screen.getByText('Local').closest('div');
      expect(container).toHaveClass('bg-green-500/10');
    });

    it('applies red background for error status', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'web', status: 'error' }}
        />
      );

      const container = screen.getByText('Claude Web').closest('div');
      expect(container).toHaveClass('bg-red-500/10');
    });

    it('applies muted background for other statuses', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'tailscale', status: 'disconnected' }}
        />
      );

      const container = screen.getByText('Tailscale SSH').closest('div');
      expect(container).toHaveClass('bg-muted');
    });

    it('has proper flex layout', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      const container = screen.getByText('Local').closest('div');
      expect(container).toHaveClass('flex', 'items-center', 'gap-3');
    });
  });

  describe('Complete Status Scenarios', () => {
    it('renders local connected correctly', () => {
      render(
        <ConnectionStatus
          connection={{ mode: 'local', status: 'connected' }}
        />
      );

      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('renders tailscale connecting correctly', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'tailscale',
            status: 'connecting',
            host: '100.64.0.5',
          }}
        />
      );

      expect(screen.getByText('Tailscale SSH')).toBeInTheDocument();
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('renders web error correctly', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'web',
            status: 'error',
            error: 'OAuth failed',
          }}
        />
      );

      expect(screen.getByText('Claude Web')).toBeInTheDocument();
      expect(screen.getByText('OAuth failed')).toBeInTheDocument();
    });

    it('renders tailscale connected with host correctly', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'tailscale',
            status: 'connected',
            host: '192.168.1.100',
          }}
        />
      );

      expect(screen.getByText('Tailscale SSH')).toBeInTheDocument();
      expect(screen.getByText('Connected to 192.168.1.100')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined host gracefully', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'tailscale',
            status: 'connected',
            host: undefined,
          }}
        />
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.queryByText('to')).not.toBeInTheDocument();
    });

    it('handles empty error message', () => {
      render(
        <ConnectionStatus
          connection={{
            mode: 'web',
            status: 'error',
            error: '',
          }}
        />
      );

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });
});
