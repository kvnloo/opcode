import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatabasePane } from '@/components/mobile/workspace/panes/DatabasePane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

describe('DatabasePane', () => {
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
      render(<DatabasePane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
    });

    it('renders database title', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /database/i })).toBeInTheDocument();
    });

    it('shows tables list section', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText(/Tables/i)).toBeInTheDocument();
    });

    it('shows connection status', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    });

    it('has refresh button', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByLabelText('Refresh database')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button clicked', () => {
      render(<DatabasePane {...defaultProps} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tables List', () => {
    it('displays list of tables', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('posts')).toBeInTheDocument();
      expect(screen.getByText('comments')).toBeInTheDocument();
    });

    it('shows table count', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText(/Tables \(3\)/i)).toBeInTheDocument();
    });

    it('selects table when clicked', async () => {
      render(<DatabasePane {...defaultProps} />);

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        // Should show schema for selected table
        expect(screen.getByText('1,247 rows')).toBeInTheDocument();
      });
    });
  });

  describe('Table Schema', () => {
    it('shows schema for selected table', async () => {
      render(<DatabasePane {...defaultProps} />);

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getByText('Column')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Nullable')).toBeInTheDocument();
      });
    });

    it('displays column information', async () => {
      render(<DatabasePane {...defaultProps} />);

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getByText('id')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(screen.getByText('username')).toBeInTheDocument();
      });
    });

    it('shows column types', async () => {
      render(<DatabasePane {...defaultProps} />);

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getByText('INTEGER')).toBeInTheDocument();
        expect(screen.getByText('VARCHAR(255)')).toBeInTheDocument();
      });
    });

    it('shows nullable constraints', async () => {
      render(<DatabasePane {...defaultProps} />);

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getAllByText('No').length).toBeGreaterThan(0);
        expect(screen.getByText('Yes')).toBeInTheDocument();
      });
    });

    it('shows message when no table is selected', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText('Select a table to view its schema')).toBeInTheDocument();
    });
  });

  describe('Query Section', () => {
    it('has collapsible query section', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByText('Query')).toBeInTheDocument();
    });

    it('expands query section when clicked', async () => {
      render(<DatabasePane {...defaultProps} />);

      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('SELECT * FROM table_name;')).toBeInTheDocument();
      });
    });

    it('has query input area when expanded', async () => {
      render(<DatabasePane {...defaultProps} />);

      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
      });
    });

    it('has run query button when expanded', async () => {
      render(<DatabasePane {...defaultProps} />);

      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        expect(screen.getByText('Run Query')).toBeInTheDocument();
      });
    });
  });

  describe('Query Execution', () => {
    it('allows typing SQL query', async () => {
      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'SELECT * FROM users' } });
        expect(textarea.value).toBe('SELECT * FROM users');
      });
    });

    it('executes query when run query button clicked', async () => {
      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        expect(screen.getByText('Run Query')).toBeInTheDocument();
      });

      const runButton = screen.getByText('Run Query');
      fireEvent.click(runButton);

      await waitFor(() => {
        // Should show results - "Results (3 rows)" format
        expect(screen.getByText(/Results.*3.*rows/i)).toBeInTheDocument();
      });
    });

    it('displays query results in table format', async () => {
      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);
      });

      await waitFor(() => {
        // Should show result table with data
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('triggers refresh when refresh button clicked', async () => {
      const { container } = render(<DatabasePane {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh database');
      fireEvent.click(refreshButton);

      // Should show spinning animation
      await waitFor(() => {
        const spinningIcon = container.querySelector('.animate-spin');
        expect(spinningIcon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh database')).toBeInTheDocument();
    });

    it('has semantic heading structure', () => {
      render(<DatabasePane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /database/i })).toBeInTheDocument();
    });

    it('has accessible table list buttons', () => {
      render(<DatabasePane {...defaultProps} />);

      const tableButtons = screen.getAllByRole('button').filter(btn =>
        /users|posts|comments/i.test(btn.textContent || '')
      );

      tableButtons.forEach(btn => {
        expect(btn).toBeInTheDocument();
      });
    });
  });
});
