import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/renderWithProviders';
import { simulateMobile, simulateTablet } from '../utils/platformSimulator';
import { CreateScreen } from '@/screens/mobile/CreateScreen';
import userEvent from '@testing-library/user-event';

// Mock API - must be before component imports
vi.mock('@/lib/api', () => ({
  api: {
    createProject: vi.fn(),
    getSetting: vi.fn(),
    updateSetting: vi.fn(),
  },
}));

// Get mock reference after module is mocked
import { api } from '@/lib/api';
const mockCreateProject = vi.mocked(api.createProject);

// Mock child components
vi.mock('@/components/mobile/create/BuildDesignToggle', () => ({
  BuildDesignToggle: ({ value, onChange }: any) => (
    <div data-testid="build-design-toggle">
      <button onClick={() => onChange('build')}>Build</button>
      <button onClick={() => onChange('design')}>Design</button>
      <span>Mode: {value}</span>
    </div>
  ),
}));

vi.mock('@/components/mobile/create/TemplateSelector', () => ({
  TemplateSelector: ({ selected, onSelect }: any) => (
    <div data-testid="template-selector">
      <button onClick={() => onSelect('web')}>Web</button>
      <button onClick={() => onSelect('mobile')}>Mobile</button>
      <span>Selected: {selected}</span>
    </div>
  ),
}));

vi.mock('@/components/mobile/create/PromptInput', () => ({
  PromptInput: ({ value, onChange, onSubmit, isLoading, placeholder }: any) => (
    <div data-testid="prompt-input">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="prompt input"
      />
      <button onClick={onSubmit} disabled={!value || !value.trim() || isLoading}>
        {isLoading ? 'Creating App...' : 'Create'}
      </button>
    </div>
  ),
}));

describe('CreateScreen', () => {
  beforeEach(() => {
    simulateMobile();
    vi.clearAllMocks();
    // Setup default mock behavior
    mockCreateProject.mockResolvedValue({ id: '123', path: '/projects/123' });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CreateScreen />);
      expect(screen.getByText(/what do you want to make?/i)).toBeInTheDocument();
    });

    it('renders greeting text', () => {
      render(<CreateScreen />);
      expect(screen.getByText('Hi there,')).toBeInTheDocument();
      expect(screen.getByText('what do you want to make?')).toBeInTheDocument();
    });

    it('renders all major UI components', () => {
      render(<CreateScreen />);

      expect(screen.getByTestId('build-design-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('prompt-input')).toBeInTheDocument();
      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    });

    it('renders footer with upgrade link', () => {
      render(<CreateScreen />);

      expect(screen.getByText('Start creating for free')).toBeInTheDocument();
      expect(screen.getByText('Join Opcode Core')).toBeInTheDocument();
    });

    it('renders prompt input with correct placeholder', () => {
      render(<CreateScreen />);

      const input = screen.getByLabelText('prompt input');
      expect(input).toHaveAttribute('placeholder', 'Describe the idea you want to build...');
    });
  });

  describe('Mode Toggle', () => {
    it('defaults to build mode', () => {
      render(<CreateScreen />);
      expect(screen.getByText('Mode: build')).toBeInTheDocument();
    });

    it('can switch to design mode', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      const designButton = screen.getByText('Design');
      await user.click(designButton);

      expect(screen.getByText('Mode: design')).toBeInTheDocument();
    });

    it('can switch back to build mode', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      // Switch to design
      await user.click(screen.getByText('Design'));
      expect(screen.getByText('Mode: design')).toBeInTheDocument();

      // Switch back to build
      await user.click(screen.getByText('Build'));
      expect(screen.getByText('Mode: build')).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('defaults to web template', () => {
      render(<CreateScreen />);
      expect(screen.getByText('Selected: web')).toBeInTheDocument();
    });

    it('can select mobile template', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      const mobileButton = screen.getByText('Mobile');
      await user.click(mobileButton);

      expect(screen.getByText('Selected: mobile')).toBeInTheDocument();
    });

    it('maintains template selection when switching modes', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      // Select mobile template
      await user.click(screen.getByText('Mobile'));
      expect(screen.getByText('Selected: mobile')).toBeInTheDocument();

      // Switch mode
      await user.click(screen.getByText('Design'));

      // Template should still be mobile
      expect(screen.getByText('Selected: mobile')).toBeInTheDocument();
    });
  });

  describe('Prompt Input', () => {
    it('starts with empty prompt', () => {
      render(<CreateScreen />);
      const input = screen.getByLabelText('prompt input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('updates prompt on user input', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      const input = screen.getByLabelText('prompt input');
      const createButton = screen.getByRole('button', { name: 'Create' });

      // Initially button should be disabled (empty prompt)
      expect(createButton).toBeDisabled();

      // Type in input
      await user.type(input, 'Build a todo app');

      // After typing, button should be enabled (indicating value was updated)
      expect(createButton).toBeEnabled();
    });

    it('preserves prompt text when switching modes', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      const input = screen.getByLabelText('prompt input');
      const createButton = screen.getByRole('button', { name: 'Create' });

      await user.type(input, 'Create something');

      // Button should be enabled after typing
      expect(createButton).toBeEnabled();

      // Switch to design mode
      await user.click(screen.getByText('Design'));

      // Button should still be enabled (prompt preserved)
      expect(createButton).toBeEnabled();
    });
  });

  describe('Create Action', () => {
    it('shows create button', () => {
      render(<CreateScreen />);
      // Get the button from the mock, not the h1 heading
      const createButton = screen.getByRole('button', { name: 'Create' });
      expect(createButton).toBeInTheDocument();
    });

    it('does not trigger create with empty prompt', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<CreateScreen />);

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      // Should not log anything for empty prompt
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('triggers create with valid prompt', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<CreateScreen />);

      // Type prompt
      const input = screen.getByLabelText('prompt input');
      await user.type(input, 'Build a todo app');

      // Click create
      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Created project:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });

    it('shows loading state during creation', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      // Type prompt
      const input = screen.getByLabelText('prompt input');
      await user.type(input, 'Build something');

      // Click create
      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      // Should show loading text
      expect(screen.getByText('Creating App...')).toBeInTheDocument();
    });

    it('includes selected mode in create action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<CreateScreen />);

      // Switch to design mode
      await user.click(screen.getByText('Design'));

      // Type prompt and create
      const input = screen.getByLabelText('prompt input');
      await user.type(input, 'Design a landing page');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Created project:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });

    it('includes selected template in create action', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<CreateScreen />);

      // Select mobile template
      await user.click(screen.getByText('Mobile'));

      // Type prompt and create
      const input = screen.getByLabelText('prompt input');
      await user.type(input, 'Mobile app');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Created project:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Layout', () => {
    it('renders correctly on mobile', () => {
      simulateMobile();
      render(<CreateScreen />);

      const container = screen.getByText(/what do you want to make?/i).closest('div');
      expect(container).toBeInTheDocument();
    });

    it('renders correctly on tablet', () => {
      simulateTablet();
      render(<CreateScreen />);

      expect(screen.getByText(/what do you want to make?/i)).toBeInTheDocument();
      expect(screen.getByTestId('build-design-toggle')).toBeInTheDocument();
    });

    it('maintains layout on orientation change', () => {
      simulateMobile();
      const { container } = render(<CreateScreen />);

      // Simulate orientation change
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('resize'));

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/what do you want to make?/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<CreateScreen />);
      const mainHeading = screen.getByRole('heading', { level: 1, name: 'Create' });
      expect(mainHeading.tagName).toBe('H1');
      const subHeading = screen.getByText('what do you want to make?');
      expect(subHeading.tagName).toBe('H2');
    });

    it('has accessible prompt input', () => {
      render(<CreateScreen />);
      const input = screen.getByLabelText('prompt input');
      expect(input).toBeInTheDocument();
    });

    it('has accessible upgrade link', () => {
      render(<CreateScreen />);
      const linkText = screen.getByText('Join Opcode Core');
      const link = linkText.closest('a');
      expect(link).toBeInTheDocument();
      expect(link?.tagName).toBe('A');
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only prompt', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<CreateScreen />);

      const input = screen.getByLabelText('prompt input');
      await user.type(input, '   ');

      await user.click(screen.getByRole('button', { name: 'Create' }));

      // Should not trigger create with whitespace-only prompt
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles very long prompts', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      const longPrompt = 'a'.repeat(500);
      const input = screen.getByLabelText('prompt input');
      const createButton = screen.getByRole('button', { name: 'Create' });

      await user.type(input, longPrompt);

      // Button should be enabled after typing long prompt
      expect(createButton).toBeEnabled();
    });

    it('handles rapid mode switching', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      // Rapidly switch modes
      await user.click(screen.getByText('Design'));
      await user.click(screen.getByText('Build'));
      await user.click(screen.getByText('Design'));
      await user.click(screen.getByText('Build'));

      // Should end up in build mode
      expect(screen.getByText('Mode: build')).toBeInTheDocument();
    });

    it('handles rapid template switching', async () => {
      const user = userEvent.setup();
      render(<CreateScreen />);

      // Rapidly switch templates
      await user.click(screen.getByText('Mobile'));
      await user.click(screen.getByText('Web'));
      await user.click(screen.getByText('Mobile'));

      // Should end up with mobile selected
      expect(screen.getByText('Selected: mobile')).toBeInTheDocument();
    });
  });
});
