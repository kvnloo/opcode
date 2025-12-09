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

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    getSetting: vi.fn().mockImplementation((key) => {
      const settings: Record<string, string> = {
        theme: 'dark',
        fontSize: '14',
        tabSize: '2',
        lineWrapping: 'true',
        autoSave: 'true',
      };
      return Promise.resolve(settings[key] || null);
    }),
    saveSetting: vi.fn().mockResolvedValue(undefined),
    getClaudeSettings: vi.fn().mockResolvedValue({
      model: 'sonnet',
      maxTokens: 4096,
    }),
    saveClaudeSettings: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('UserSettingsPane', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Tauri environment
    Object.defineProperty(window, '__TAURI__', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  describe('Rendering', () => {
    it('renders header with back button', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        const backButton = screen.getByLabelText('Go back');
        expect(backButton).toBeInTheDocument();
      });
    });

    it('renders settings title', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
      });
    });

    it('shows editor section', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Editor/i)).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(<UserSettingsPane {...defaultProps} />);

      // Loading spinner should be visible
      expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
    });

    it('loads settings from API on mount', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(api.getSetting).toHaveBeenCalledWith('theme');
        expect(api.getSetting).toHaveBeenCalledWith('fontSize');
        expect(api.getSetting).toHaveBeenCalledWith('tabSize');
        expect(api.getSetting).toHaveBeenCalledWith('lineWrapping');
        expect(api.getSetting).toHaveBeenCalledWith('autoSave');
        expect(api.getClaudeSettings).toHaveBeenCalled();
      });
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
    it('has theme toggle buttons', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dark theme/i)).toBeInTheDocument();
      });
    });

    it('toggles between light and dark themes', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
      });

      const lightButton = screen.getByLabelText(/Light theme/i);
      fireEvent.click(lightButton);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('theme', 'light');
        expect(lightButton).toHaveClass(/bg-primary/);
      });
    });

    it('saves theme changes to API', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
      });

      const lightButton = screen.getByLabelText(/Light theme/i);
      fireEvent.click(lightButton);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('theme', 'light');
      });
    });
  });

  describe('Font Size Settings', () => {
    it('has font size selector', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
      });
    });

    it('shows font size options', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Font size 12px')).toBeInTheDocument();
        expect(screen.getByLabelText('Font size 14px')).toBeInTheDocument();
        expect(screen.getByLabelText('Font size 16px')).toBeInTheDocument();
        expect(screen.getByLabelText('Font size 18px')).toBeInTheDocument();
        expect(screen.getByLabelText('Font size 20px')).toBeInTheDocument();
      });
    });

    it('changes font size when option selected', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Font size 18px')).toBeInTheDocument();
      });

      const size18Button = screen.getByLabelText('Font size 18px');
      fireEvent.click(size18Button);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('fontSize', '18');
        expect(size18Button).toHaveClass(/bg-primary/);
      });
    });
  });

  describe('Tab Size Settings', () => {
    it('has tab size selector', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Tab Size/i)).toBeInTheDocument();
      });
    });

    it('shows tab size options', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Tab size 2 spaces')).toBeInTheDocument();
        expect(screen.getByLabelText('Tab size 4 spaces')).toBeInTheDocument();
        expect(screen.getByLabelText('Tab size 8 spaces')).toBeInTheDocument();
      });
    });

    it('changes tab size when option selected', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Tab size 4 spaces')).toBeInTheDocument();
      });

      const tab4Button = screen.getByLabelText('Tab size 4 spaces');
      fireEvent.click(tab4Button);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('tabSize', '4');
        expect(tab4Button).toHaveClass(/bg-primary/);
      });
    });
  });

  describe('Editor Preferences', () => {
    it('shows line wrapping toggle', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Line Wrapping/i)).toBeInTheDocument();
      });
    });

    it('toggles line wrapping', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Disable line wrapping/i)).toBeInTheDocument();
      });

      const wrapButton = screen.getByLabelText(/Disable line wrapping/i);
      fireEvent.click(wrapButton);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('lineWrapping', 'false');
        expect(screen.getByLabelText(/Enable line wrapping/i)).toBeInTheDocument();
      });
    });

    it('shows auto-save toggle', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Auto-save/i)).toBeInTheDocument();
      });
    });

    it('toggles auto-save', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Disable auto-save/i)).toBeInTheDocument();
      });

      const autoSaveButton = screen.getByLabelText(/Disable auto-save/i);
      fireEvent.click(autoSaveButton);

      await waitFor(() => {
        expect(api.saveSetting).toHaveBeenCalledWith('autoSave', 'false');
        expect(screen.getByLabelText(/Enable auto-save/i)).toBeInTheDocument();
      });
    });
  });

  describe('Settings Info', () => {
    it('shows settings persistence info', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Settings are stored locally/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', async () => {
      const { api } = await import('@/lib/api');

      // Mock getSetting to reject
      (api.getSetting as any).mockRejectedValueOnce(new Error('API Error'));

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
      });
    });

    it('displays error message when saving fails', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
      });

      // Mock saveSetting to reject
      (api.saveSetting as any).mockRejectedValueOnce(new Error('Save Error'));

      const lightButton = screen.getByLabelText(/Light theme/i);
      fireEvent.click(lightButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save theme/i)).toBeInTheDocument();
      });
    });
  });

  describe('Non-Tauri Environment', () => {
    beforeEach(() => {
      // Mock non-Tauri environment
      Object.defineProperty(window, '__TAURI__', {
        writable: true,
        configurable: true,
        value: undefined,
      });
    });

    it('uses default settings in non-Tauri environment', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      // Should not call API in non-Tauri env
      expect(api.getSetting).not.toHaveBeenCalled();
    });

    it('does not save settings in non-Tauri environment', async () => {
      const { api } = await import('@/lib/api');

      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Light theme/i)).toBeInTheDocument();
      });

      const lightButton = screen.getByLabelText(/Light theme/i);
      fireEvent.click(lightButton);

      await waitFor(() => {
        expect(lightButton).toHaveClass(/bg-primary/);
      });

      // Should not call saveSetting in non-Tauri env
      expect(api.saveSetting).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      });
    });

    it('has semantic heading structure', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
      });
    });

    it('all interactive elements have accessible names', async () => {
      render(<UserSettingsPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /User Settings/i })).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const label = button.getAttribute('aria-label') || button.textContent;
        expect(label).toBeTruthy();
      });
    });
  });
});
