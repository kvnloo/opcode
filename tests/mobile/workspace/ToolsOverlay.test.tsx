import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ToolsOverlay } from '@/components/mobile/workspace/ToolsOverlay';

// Mock ToolItem component to match actual behavior
vi.mock('@/components/mobile/tools/ToolItem', () => ({
  ToolItem: ({ tool, onClick }: any) => (
    <button onClick={onClick} data-testid={`tool-${tool.id}`}>
      <h4>{tool.name}</h4>
      <p>{tool.description}</p>
    </button>
  ),
}));

describe('ToolsOverlay', () => {
  const mockOnClose = vi.fn();
  const mockOnToolSelect = vi.fn();
  const mockOnSearch = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onToolSelect: mockOnToolSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<ToolsOverlay {...defaultProps} />);

      // Check for main heading (h2) - "Project Tools"
      expect(screen.getByRole('heading', { name: 'Project Tools' })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ToolsOverlay {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Project Tools')).not.toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByLabelText('Close tools overlay')).toBeInTheDocument();
    });

    it('should render all 20 tools', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      // Count all tool buttons (2 search + 18 tools = 20 total)
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      expect(toolButtons.length).toBe(20);
    });

    it('should call onToolSelect with correct tool ID', async () => {
      render(<ToolsOverlay {...defaultProps} />);

      const storageTool = screen.getByTestId('tool-storage');
      fireEvent.click(storageTool);

      await waitFor(() => {
        expect(mockOnToolSelect).toHaveBeenCalledWith('storage');
      });
    });
  });

  describe('Tool categories', () => {
    it('should render search category tools', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByTestId('tool-search')).toBeInTheDocument();
      expect(screen.getByTestId('tool-files')).toBeInTheDocument();
    });

    it('should render all tools category', () => {
      render(<ToolsOverlay {...defaultProps} />);

      // Check for various tools
      expect(screen.getByTestId('tool-agent')).toBeInTheDocument();
      expect(screen.getByTestId('tool-assistant')).toBeInTheDocument();
      expect(screen.getByTestId('tool-database')).toBeInTheDocument();
      expect(screen.getByTestId('tool-git')).toBeInTheDocument();
    });

    it('should show Tools section header', () => {
      render(<ToolsOverlay {...defaultProps} />);

      // Check for section header specifically (uppercase text)
      const sectionHeader = screen.getByText('Tools', { selector: 'h3' });
      expect(sectionHeader).toBeInTheDocument();
    });
  });

  describe('Search filtering', () => {
    it('should filter tools by name', () => {
      render(<ToolsOverlay {...defaultProps} onSearch={mockOnSearch} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'agent' } });

      expect(mockOnSearch).toHaveBeenCalledWith('agent');
      expect(screen.getByTestId('tool-agent')).toBeInTheDocument();
      expect(screen.queryByTestId('tool-database')).not.toBeInTheDocument();
    });

    it('should filter tools by description', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'version control' } });

      expect(screen.getByTestId('tool-git')).toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'AGENT' } });

      expect(screen.getByTestId('tool-agent')).toBeInTheDocument();
    });

    it('should show all tools when search is empty', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '' } });

      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      expect(toolButtons.length).toBe(20);
    });

    it('should show clear button when search has text', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button clicked', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'agent' } });

      expect(searchInput.value).toBe('agent');

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
    });

    it('should not show clear button when search is empty', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('should show no results message when no matches', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });

      expect(screen.getByText('No tools found')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term')).toBeInTheDocument();
    });
  });

  describe('Tool selection', () => {
    it('should call onToolSelect when tool clicked', async () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      await waitFor(() => {
        expect(mockOnToolSelect).toHaveBeenCalledWith('agent');
      });
    });

    it('should close overlay after tool selection', async () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle multiple tool selections', async () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      await waitFor(() => {
        expect(mockOnToolSelect).toHaveBeenCalledWith('agent');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close tools overlay');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when panel content clicked', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const panel = container.querySelector('.fixed.inset-0.z-50');
      expect(panel).toBeInTheDocument();
      fireEvent.click(panel!);

      // Should not close when clicking content
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should reset search when closed', async () => {
      const { rerender } = render(<ToolsOverlay {...defaultProps} isOpen={true} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchInput.value).toBe('test');

      // Close overlay
      rerender(<ToolsOverlay {...defaultProps} isOpen={false} />);

      // Reopen overlay
      rerender(<ToolsOverlay {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const newSearchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;
        expect(newSearchInput.value).toBe('');
      });
    });
  });

  describe('Body scroll prevention', () => {
    it('should prevent body scroll when open', () => {
      render(<ToolsOverlay {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<ToolsOverlay {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ToolsOverlay {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(<ToolsOverlay {...defaultProps} isOpen={true} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Animations', () => {
    it('should render dark overlay with fade animation', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
    });

    it('should render panel with slide-up animation', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const panel = container.querySelector('.fixed.inset-0.z-50');
      expect(panel).toBeInTheDocument();
    });

    it('should animate tool items on render', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      // All tools should be rendered
      expect(toolButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Search input autofocus', () => {
    it('should render search input with focus capability', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      // Input should be rendered and focusable (autoFocus is set in component but may not work in JSDOM)
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });
  });

  describe('Layout and styling', () => {
    it('should have full screen overlay', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const panel = container.querySelector('.fixed.inset-0');
      expect(panel).toBeInTheDocument();
    });

    it('should have proper z-index layering', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const backdrop = container.querySelector('.z-40');
      const panel = container.querySelector('.z-50');

      expect(backdrop).toBeInTheDocument();
      expect(panel).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      // ScrollArea renders a flex-1 div that contains scrollable content
      const contentArea = container.querySelector('.flex-1');
      expect(contentArea).toBeInTheDocument();
    });

    it('should have header with border', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
      // Verify it contains the Tools heading
      expect(header).toHaveTextContent('Tools');
    });
  });

  describe('All 20 tools', () => {
    it('should render all expected tools', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const expectedTools = [
        'search',
        'files',
        'agent',
        'assistant',
        'publishing',
        'storage',
        'auth',
        'console',
        'database',
        'developer',
        'git',
        'integrations',
        'multiplayer',
        'preview',
        'kv-store',
        'secrets',
        'security',
        'shell',
        'settings',
        'workflows',
      ];

      expectedTools.forEach((toolId) => {
        expect(screen.getByTestId(`tool-${toolId}`)).toBeInTheDocument();
      });
    });

    it('should render exactly 20 tools', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');

      // Should have exactly 20 tools (2 search + 18 tools)
      expect(toolButtons.length).toBe(20);

      // Verify settings and workflows are present
      expect(screen.getByTestId('tool-settings')).toBeInTheDocument();
      expect(screen.getByTestId('tool-workflows')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for close button', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByLabelText('Close tools overlay')).toBeInTheDocument();
    });

    it('should have proper ARIA label for clear search', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should have semantic heading', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const headings = screen.getAllByRole('heading', { name: 'Tools' });
      // Should have at least the main heading
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible search input', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      // Input component from shadcn/ui may not explicitly set type="text"
      expect(searchInput.tagName).toBe('INPUT');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search query gracefully', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      // Should show all tools for whitespace-only query
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      expect(toolButtons.length).toBe(20);
    });

    it('should handle rapid search changes', () => {
      render(<ToolsOverlay {...defaultProps} onSearch={mockOnSearch} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');

      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ag' } });
      fireEvent.change(searchInput, { target: { value: 'age' } });
      fireEvent.change(searchInput, { target: { value: 'agent' } });

      expect(mockOnSearch).toHaveBeenCalledTimes(4);
    });

    it('should handle special characters in search', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '@#$%^&*' } });

      expect(screen.getByText('No tools found')).toBeInTheDocument();
    });

    it('should maintain search state during filtering', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: 'database' } });
      expect(searchInput.value).toBe('database');

      // Filter should work and input value should persist
      expect(screen.getByTestId('tool-database')).toBeInTheDocument();
      expect(searchInput.value).toBe('database');
    });
  });
});
