import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ToolsMenu } from '@/components/mobile/tools/ToolsMenu';

describe('ToolsMenu', () => {
  const mockOnSelectTool = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<ToolsMenu />);

      expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should render search section header', () => {
      render(<ToolsMenu />);

      expect(screen.getByRole('heading', { name: 'Search', level: 3 })).toBeInTheDocument();
    });

    it('should render tools section header', () => {
      render(<ToolsMenu />);

      expect(screen.getByRole('heading', { name: 'Tools', level: 3 })).toBeInTheDocument();
    });

    it('should render all default tools', () => {
      render(<ToolsMenu />);

      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('Assistant')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Git')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should render close button when onClose provided', () => {
      render(<ToolsMenu onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should not render close button when onClose not provided', () => {
      render(<ToolsMenu />);

      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should filter tools by name', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'database' } });

      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.queryByText('Agent')).not.toBeInTheDocument();
      expect(screen.queryByText('Git')).not.toBeInTheDocument();
    });

    it('should filter tools by description', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'version control' } });

      expect(screen.getByText('Git')).toBeInTheDocument();
      expect(screen.queryByText('Database')).not.toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'AGENT' } });

      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('should show no results message when no matches', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });

      expect(screen.getByText('No tools found for "xyz123nonexistent"')).toBeInTheDocument();
    });

    it('should clear search when X button clicked', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'agent' } });

      expect(searchInput.value).toBe('agent');
      expect(screen.queryByText('Database')).not.toBeInTheDocument();

      // X button is a button element with X icon, no accessible name
      const clearButtons = screen.getAllByRole('button');
      const clearButton = clearButtons.find(btn => btn.querySelector('svg'));
      expect(clearButton).toBeDefined();
      fireEvent.click(clearButton!);

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should show clear button only when search has text', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');

      // No clear button initially - check for X icon specifically in clear button position
      const initialButtons = screen.queryAllByRole('button');
      const hasXButton = initialButtons.some(btn => {
        const svg = btn.querySelector('svg');
        // X icon is in a button with hover:text-foreground class and positioned absolutely
        return svg && btn.className.includes('absolute') && btn.className.includes('right-3');
      });
      expect(hasXButton).toBe(false);

      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Clear button (X) appears
      const buttonsAfterType = screen.getAllByRole('button');
      const clearButtonExists = buttonsAfterType.some(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.className.includes('absolute') && btn.className.includes('right-3');
      });
      expect(clearButtonExists).toBe(true);
    });
  });

  describe('Tool selection', () => {
    it('should call onSelectTool when tool is clicked', () => {
      render(<ToolsMenu onSelectTool={mockOnSelectTool} />);

      const agentTool = screen.getByText('Agent');
      fireEvent.click(agentTool);

      expect(mockOnSelectTool).toHaveBeenCalledTimes(1);
      expect(mockOnSelectTool).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'agent',
          name: 'Agent',
        })
      );
    });

    it('should call onSelectTool with correct tool data', () => {
      render(<ToolsMenu onSelectTool={mockOnSelectTool} />);

      const gitTool = screen.getByText('Git');
      fireEvent.click(gitTool);

      expect(mockOnSelectTool).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'git',
          name: 'Git',
          description: 'Version control for your App',
          category: 'tools',
        })
      );
    });

    it('should work without onSelectTool callback', () => {
      render(<ToolsMenu />);

      const agentTool = screen.getByText('Agent');
      expect(() => fireEvent.click(agentTool)).not.toThrow();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<ToolsMenu onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category organization', () => {
    it('should separate search and tools categories', () => {
      render(<ToolsMenu />);

      const searchSection = screen.getByRole('heading', { name: 'Search', level: 3 });
      const toolsSection = screen.getByRole('heading', { name: 'Tools', level: 3 });

      expect(searchSection).toBeInTheDocument();
      expect(toolsSection).toBeInTheDocument();
    });

    it('should show search tools in search section', () => {
      render(<ToolsMenu />);

      expect(screen.getByRole('heading', { name: 'Search', level: 3 })).toBeInTheDocument();
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    it('should filter maintains category organization', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Should show "Search" tool in search category - use getAllByText since "Search" appears as both heading and tool name
      const searchHeading = screen.getByRole('heading', { name: 'Search', level: 3 });
      const searchSection = searchHeading.closest('div');
      const searchTexts = within(searchSection as HTMLElement).getAllByText('Search');
      // Should have at least the tool name "Search" in the section (heading is separate)
      expect(searchTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Tool list rendering', () => {
    it('should render tool descriptions', () => {
      render(<ToolsMenu />);

      expect(screen.getByText(/Agent can make changes/)).toBeInTheDocument();
      expect(screen.getByText(/Assistant answers questions/)).toBeInTheDocument();
    });

    it('should render all tool categories', () => {
      render(<ToolsMenu />);

      // Spot check various tools from different functional areas
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Security Scanner')).toBeInTheDocument();
      expect(screen.getByText('Publishing')).toBeInTheDocument();
      expect(screen.getByText('Multiplayer')).toBeInTheDocument();
    });
  });

  describe('Scrollable area', () => {
    it('should have scrollable content area', () => {
      const { container } = render(<ToolsMenu />);

      // ScrollArea component creates a div with overflow-auto class
      const scrollArea = container.querySelector('.overflow-auto');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input placeholder', () => {
      render(<ToolsMenu />);

      expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should maintain focus management', () => {
      const { container } = render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files') as HTMLInputElement;

      // In JSDOM, we need to explicitly set focus
      searchInput.focus();

      // Check that input element is focusable and can receive focus
      expect(searchInput).toBe(container.querySelector('input'));

      // Verify input is in the document and not disabled
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).not.toBeDisabled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search query', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      // Should show all tools when search is only whitespace
      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should handle rapid search changes', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');

      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ag' } });
      fireEvent.change(searchInput, { target: { value: 'age' } });
      fireEvent.change(searchInput, { target: { value: 'agent' } });

      expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('should handle special characters in search', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: '@#$%' } });

      expect(screen.getByText(/No tools found/)).toBeInTheDocument();
    });
  });
});
