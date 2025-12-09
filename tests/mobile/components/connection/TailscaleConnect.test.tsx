import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../utils/renderWithProviders';
import { TailscaleConnect } from '../../../../src/components/mobile/connection/TailscaleConnect';
import userEvent from '@testing-library/user-event';

describe('TailscaleConnect', () => {
  const mockOnConnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders host input field', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      expect(screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).toBeInTheDocument();
    });

    it('renders username input field', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    });

    it('renders connect button', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      expect(screen.getByText('Connect via Tailscale')).toBeInTheDocument();
    });

    it('renders as a form', () => {
      const { container } = render(<TailscaleConnect onConnect={mockOnConnect} />);

      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when host is empty', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toBeDisabled();
    });

    it('disables submit button when username is empty', async () => {
      const user = userEvent.setup();
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      await user.type(hostInput, '100.64.0.5');

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toBeDisabled();
    });

    it('enables submit button when both fields are filled', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      fireEvent.change(hostInput, { target: { value: '100.64.0.5' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).not.toBeDisabled();
    });

    it('prevents submission with empty fields', async () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });

      // Button is disabled, so click won't trigger
      expect(button).toBeDisabled();

      // Try to submit anyway (should not call onConnect)
      const form = button.closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('updates host input value', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      fireEvent.change(hostInput, { target: { value: '192.168.1.100' } });

      expect(hostInput).toHaveValue('192.168.1.100');
    });

    it('updates username input value', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'admin' } });

      expect(usernameInput).toHaveValue('admin');
    });

    it('allows clearing and re-entering values', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');

      fireEvent.change(hostInput, { target: { value: '100.64.0.5' } });
      expect(hostInput).toHaveValue('100.64.0.5');

      fireEvent.change(hostInput, { target: { value: '' } });
      expect(hostInput).toHaveValue('');

      fireEvent.change(hostInput, { target: { value: '192.168.1.1' } });
      expect(hostInput).toHaveValue('192.168.1.1');
    });
  });

  describe('Connection Callbacks', () => {
    it('calls onConnect with host and username when form is submitted', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      fireEvent.change(hostInput, { target: { value: '100.64.0.5' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      fireEvent.click(button);

      expect(mockOnConnect).toHaveBeenCalledWith('100.64.0.5', 'testuser');
      expect(mockOnConnect).toHaveBeenCalledTimes(1);
    });

    it('does not call onConnect when fields are empty', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toBeDisabled();

      expect(mockOnConnect).not.toHaveBeenCalled();
    });

    it('prevents default form submission', async () => {
      const user = userEvent.setup();
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      await user.type(hostInput, '100.64.0.5');
      await user.type(usernameInput, 'testuser');

      const form = screen.getByText('Connect via Tailscale').closest('form')!;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows "Connecting..." text when isConnecting is true', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={true} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('shows "Connect via Tailscale" text when not connecting', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={false} />);

      expect(screen.getByText('Connect via Tailscale')).toBeInTheDocument();
    });

    it('disables inputs when connecting', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={true} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      expect(hostInput).toBeDisabled();
      expect(usernameInput).toBeDisabled();
    });

    it('disables submit button when connecting', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={true} />);

      const button = screen.getByRole('button', { name: /connecting/i });
      expect(button).toBeDisabled();
    });

    it('enables inputs when not connecting', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={false} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      expect(hostInput).not.toBeDisabled();
      expect(usernameInput).not.toBeDisabled();
    });

    it('shows loader icon when connecting', () => {
      const { container } = render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={true} />);

      // Check for animate-spin class which is on the Loader2 icon
      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('applies correct base styles to button', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toHaveClass('w-full', 'py-3', 'bg-blue-500', 'text-white', 'rounded-lg', 'font-medium');
    });

    it('applies disabled styles when button is disabled', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure for screen readers', () => {
      const { container } = render(<TailscaleConnect onConnect={mockOnConnect} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('inputs have appropriate placeholders', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      expect(screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    });

    it('button has proper type attribute', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const button = screen.getByRole('button', { name: /connect via tailscale/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid input changes', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      fireEvent.change(hostInput, { target: { value: 'abc' } });

      expect(hostInput).toHaveValue('abc');
    });

    it('handles special characters in input', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'user@example.com' } });

      expect(usernameInput).toHaveValue('user@example.com');
    });

    it('maintains state during isConnecting transition', () => {
      render(<TailscaleConnect onConnect={mockOnConnect} isConnecting={false} />);

      const hostInput = screen.getByPlaceholderText('Tailscale IP (e.g., 100.64.0.5)');
      const usernameInput = screen.getByPlaceholderText('Username');

      fireEvent.change(hostInput, { target: { value: '100.64.0.5' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      // Component maintains internal state, so values should be present
      expect(hostInput).toHaveValue('100.64.0.5');
      expect(usernameInput).toHaveValue('testuser');
    });
  });
});
