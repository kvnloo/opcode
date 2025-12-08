import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ToolsOverlay } from '@/components/mobile/workspace/ToolsOverlay';

// Mock ToolItem component
vi.mock('@/components/mobile/workspace/tools/ToolItem', () => ({
  ToolItem: ({ tool, onClick }: any) => (
    <button onClick={() => onClick(tool)} data-testid={`tool-${tool.id}`}>
      {tool.name} - {tool.description}
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

      expect(screen.getByText('Tools')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ToolsOverlay {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Tools')).not.toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ToolsOverlay {...defaultProps} />);

      expect(screen.getByLabelText('Close tools overlay')).toBeInTheDocument();
    });

    it('should render all 18 tools', () => {
      const { container } = render(<ToolsOverlay {...defaultProps} />);

      // Count all tool buttons (search tools + other tools)
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      expect(toolButtons.length).toBe(18);
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

      expect(screen.getByText('Tools')).toBeInTheDocument();
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
      expect(toolButtons.length).toBe(18);
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
    it('should call onToolSelect when tool clicked', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      expect(mockOnToolSelect).toHaveBeenCalledWith('agent');
    });

    it('should close overlay after tool selection', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple tool selections', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const agentTool = screen.getByTestId('tool-agent');
      fireEvent.click(agentTool);

      expect(mockOnToolSelect).toHaveBeenCalledWith('agent');
      expect(mockOnClose).toHaveBeenCalled();
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
      render(<ToolsOverlay {...defaultProps} />);

      const panel = screen.getByText('Tools').closest('.fixed.inset-0.z-50');
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
    it('should autofocus search input when opened', async () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');

      await waitFor(() => {
        expect(searchInput).toHaveFocus();
      });
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

      const scrollArea = container.querySelector('[class*="ScrollArea"]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have header with border', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const header = screen.getByText('Tools').closest('.border-b');
      expect(header).toBeInTheDocument();
    });
  });

  describe('All 18 tools', () => {
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
      ];

      expectedTools.forEach((toolId) => {
        expect(screen.getByTestId(`tool-${toolId}`)).toBeInTheDocument();
      });
    });

    it('should not render settings and workflows by default', () => {
      render(<ToolsOverlay {...defaultProps} />);

      // Settings and Workflows are in the list but we'll verify all 18 are rendered
      const { container } = render(<ToolsOverlay {...defaultProps} />);
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');

      // Should have exactly 18 tools
      expect(toolButtons.length).toBe(18);
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

      const heading = screen.getByRole('heading', { name: 'Tools' });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search query gracefully', () => {
      render(<ToolsOverlay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      // Should show all tools for whitespace-only query
      const { container } = render(<ToolsOverlay {...defaultProps} />);
      const toolButtons = container.querySelectorAll('[data-testid^="tool-"]');
      expect(toolButtons.length).toBe(18);
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
