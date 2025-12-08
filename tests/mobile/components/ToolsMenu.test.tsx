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

      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('should render tools section header', () => {
      render(<ToolsMenu />);

      expect(screen.getByText('Tools')).toBeInTheDocument();
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

      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should not render close button when onClose not provided', () => {
      render(<ToolsMenu />);

      expect(screen.queryByText('Close')).not.toBeInTheDocument();
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

      const clearButton = screen.getByRole('button', { name: '' }); // X button has no name
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('should show clear button only when search has text', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');

      // No clear button initially
      expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Clear button appears
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
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

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category organization', () => {
    it('should separate search and tools categories', () => {
      render(<ToolsMenu />);

      const searchSection = screen.getByText('Search').closest('div');
      const toolsSection = screen.getByText('Tools').closest('div');

      expect(searchSection).toBeInTheDocument();
      expect(toolsSection).toBeInTheDocument();
    });

    it('should show search tools in search section', () => {
      render(<ToolsMenu />);

      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    it('should filter maintains category organization', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Should show "Search" tool in search category
      const searchSection = screen.getByText('Search').closest('div');
      expect(within(searchSection as HTMLElement).getByText('Search')).toBeInTheDocument();
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

      const scrollArea = container.querySelector('[class*="scroll"]');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input placeholder', () => {
      render(<ToolsMenu />);

      expect(screen.getByPlaceholderText('Search for tools and files')).toBeInTheDocument();
    });

    it('should maintain focus management', () => {
      render(<ToolsMenu />);

      const searchInput = screen.getByPlaceholderText('Search for tools and files');
      searchInput.focus();

      expect(searchInput).toHaveFocus();
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
