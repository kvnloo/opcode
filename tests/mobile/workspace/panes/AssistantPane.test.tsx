import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssistantPane } from '@/components/mobile/workspace/panes/AssistantPane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

describe('AssistantPane', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders header with back button', () => {
      render(<AssistantPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('renders assistant title', () => {
      render(<AssistantPane {...defaultProps} />);

      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('has message display area', () => {
      const { container } = render(<AssistantPane {...defaultProps} />);

      // Look for the messages container (scrollable area)
      const scrollArea = container.querySelector('.overflow-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('has input field for messages', () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      expect(input).toBeInTheDocument();
    });

    it('has send button', () => {
      render(<AssistantPane {...defaultProps} />);

      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeInTheDocument();
    });

    it('shows initial conversation messages', () => {
      render(<AssistantPane {...defaultProps} />);

      expect(screen.getByText('Hello! How can I help you with your project today?')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button clicked', () => {
      render(<AssistantPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Handling', () => {
    it('allows typing in input field', () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello assistant' } });

      expect((input as HTMLInputElement).value).toBe('Hello assistant');
    });

    it('sends message when send button clicked', async () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByLabelText('Send message');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        // Message should be displayed
        expect(screen.getByText('Test message')).toBeInTheDocument();
        // Input should be cleared
        expect((input as HTMLInputElement).value).toBe('');
      });
    });

    it('disables send button when input is empty', () => {
      render(<AssistantPane {...defaultProps} />);

      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByLabelText('Send message');

      fireEvent.change(input, { target: { value: 'Test' } });

      expect(sendButton).not.toBeDisabled();
    });

    it('sends message on Enter key press', async () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');

      fireEvent.change(input, { target: { value: 'Enter test' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('Enter test')).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe('');
      });
    });
  });

  describe('Message Display', () => {
    it('displays user messages', async () => {
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByLabelText('Send message');

      fireEvent.change(input, { target: { value: 'Hello from user' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Hello from user')).toBeInTheDocument();
      });
    });

    it('displays assistant responses after user sends message', async () => {
      vi.useFakeTimers();
      render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByLabelText('Send message');

      fireEvent.change(input, { target: { value: 'Test for AI response' } });
      fireEvent.click(sendButton);

      // Advance timer to trigger mock AI response (1500ms in component)
      await vi.runAllTimersAsync();

      // Switch back to real timers before waitFor
      vi.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText(/mock response/i)).toBeInTheDocument();
      });
    });

    it('shows typing indicator while loading', async () => {
      vi.useFakeTimers();
      const { container } = render(<AssistantPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByLabelText('Send message');

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);

      // Should show loading indicator
      const typingIndicator = container.querySelector('.animate-bounce');
      expect(typingIndicator).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Clear Functionality', () => {
    it('has clear conversation button', () => {
      render(<AssistantPane {...defaultProps} />);

      const clearButton = screen.getByLabelText('Clear conversation');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears messages when clear button clicked', async () => {
      render(<AssistantPane {...defaultProps} />);

      // Initial message exists
      expect(screen.getByText('Can you help me debug this authentication issue?')).toBeInTheDocument();

      // Clear messages
      const clearButton = screen.getByLabelText('Clear conversation');
      fireEvent.click(clearButton);

      await waitFor(() => {
        // Old messages should be gone
        expect(screen.queryByText('Can you help me debug this authentication issue?')).not.toBeInTheDocument();
        // New welcome message should appear
        expect(screen.getByText('Conversation cleared. How can I help you?')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AssistantPane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear conversation')).toBeInTheDocument();
      expect(screen.getByLabelText('Message input')).toBeInTheDocument();
    });

    it('has semantic heading structure', () => {
      render(<AssistantPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /AI Assistant/i })).toBeInTheDocument();
    });
  });
});
