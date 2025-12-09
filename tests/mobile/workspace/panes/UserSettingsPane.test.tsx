import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSettingsPane } from '@/components/mobile/workspace/panes/UserSettingsPane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

describe('UserSettingsPane', () => {
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
      render(<UserSettingsPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('renders settings title', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
    });

    it('shows editor section', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Editor/i)).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button clicked', () => {
      render(<UserSettingsPane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme Settings', () => {
    it('has theme toggle buttons', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dark theme/i)).toBeInTheDocument();
    });

    it('toggles between light and dark themes', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      const darkButton = screen.getByLabelText(/Dark theme/i);
      fireEvent.click(darkButton);

      await waitFor(() => {
        // Dark button should now be selected (have primary background)
        expect(darkButton).toHaveClass(/bg-primary/);
      });
    });
  });

  describe('Font Size Settings', () => {
    it('has font size selector', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
    });

    it('shows font size options', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByLabelText('Font size 12px')).toBeInTheDocument();
      expect(screen.getByLabelText('Font size 14px')).toBeInTheDocument();
      expect(screen.getByLabelText('Font size 16px')).toBeInTheDocument();
      expect(screen.getByLabelText('Font size 18px')).toBeInTheDocument();
      expect(screen.getByLabelText('Font size 20px')).toBeInTheDocument();
    });

    it('changes font size when option selected', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      const size18Button = screen.getByLabelText('Font size 18px');
      fireEvent.click(size18Button);

      await waitFor(() => {
        expect(size18Button).toHaveClass(/bg-primary/);
      });
    });
  });

  describe('Tab Size Settings', () => {
    it('has tab size selector', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Tab Size/i)).toBeInTheDocument();
    });

    it('shows tab size options', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByLabelText('Tab size 2 spaces')).toBeInTheDocument();
      expect(screen.getByLabelText('Tab size 4 spaces')).toBeInTheDocument();
      expect(screen.getByLabelText('Tab size 8 spaces')).toBeInTheDocument();
    });

    it('changes tab size when option selected', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      const tab4Button = screen.getByLabelText('Tab size 4 spaces');
      fireEvent.click(tab4Button);

      await waitFor(() => {
        expect(tab4Button).toHaveClass(/bg-primary/);
      });
    });
  });

  describe('Editor Preferences', () => {
    it('shows line wrapping toggle', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Line Wrapping/i)).toBeInTheDocument();
    });

    it('toggles line wrapping', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      const wrapButton = screen.getByLabelText(/Disable line wrapping/i);
      fireEvent.click(wrapButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Enable line wrapping/i)).toBeInTheDocument();
      });
    });

    it('shows auto-save toggle', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Auto-save/i)).toBeInTheDocument();
    });

    it('toggles auto-save', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      const autoSaveButton = screen.getByLabelText(/Disable auto-save/i);
      fireEvent.click(autoSaveButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Enable auto-save/i)).toBeInTheDocument();
      });
    });
  });

  describe('Settings Info', () => {
    it('shows settings persistence info', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByText(/Settings are stored locally/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('has semantic heading structure', () => {
      render(<UserSettingsPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
    });

    it('all interactive elements have accessible names', () => {
      render(<UserSettingsPane {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const label = button.getAttribute('aria-label') || button.textContent;
        expect(label).toBeTruthy();
      });
    });
  });
});
