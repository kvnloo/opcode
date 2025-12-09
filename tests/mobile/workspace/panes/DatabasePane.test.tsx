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

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    storageListTables: vi.fn().mockResolvedValue([
      { name: 'users', type: 'table', sql: '' },
      { name: 'posts', type: 'table', sql: '' },
      { name: 'comments', type: 'table', sql: '' },
      { name: 'sqlite_sequence', type: 'table', sql: '' }, // Should be filtered out
    ]),
    storageExecuteSql: vi.fn((query: string) => {
      if (query.includes('PRAGMA table_info')) {
        return Promise.resolve({
          rows: [
            { cid: 0, name: 'id', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 1 },
            { cid: 1, name: 'email', type: 'VARCHAR(255)', notnull: 1, dflt_value: null, pk: 0 },
            { cid: 2, name: 'username', type: 'VARCHAR(50)', notnull: 1, dflt_value: null, pk: 0 },
            { cid: 3, name: 'created_at', type: 'TIMESTAMP', notnull: 1, dflt_value: null, pk: 0 },
            { cid: 4, name: 'updated_at', type: 'TIMESTAMP', notnull: 0, dflt_value: null, pk: 0 },
          ],
        });
      }
      if (query.includes('COUNT(*)')) {
        return Promise.resolve({
          rows: [{ count: 1247 }],
        });
      }
      // Default query result
      return Promise.resolve({
        rows: [
          { id: 1, email: 'alice@example.com', username: 'alice', created_at: '2024-01-15 10:30:00' },
          { id: 2, email: 'bob@example.com', username: 'bob', created_at: '2024-01-16 14:22:00' },
          { id: 3, email: 'charlie@example.com', username: 'charlie', created_at: '2024-01-17 09:15:00' },
        ],
      });
    }),
  },
}));

describe('DatabasePane', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    projectId: 'test-project',
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up Tauri environment for tests
    if (typeof window !== 'undefined') {
      (window as any).__TAURI__ = true;
    }
  });

  afterEach(() => {
    // Clean up
    if (typeof window !== 'undefined') {
      delete (window as any).__TAURI__;
    }
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
    it('displays list of tables', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
        expect(screen.getByText('posts')).toBeInTheDocument();
        expect(screen.getByText('comments')).toBeInTheDocument();
      });
    });

    it('shows table count', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Tables \(3\)/i)).toBeInTheDocument();
      });
    });

    it('selects table when clicked', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

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

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

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

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

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

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getByText('INTEGER')).toBeInTheDocument();
        expect(screen.getByText('VARCHAR(255)')).toBeInTheDocument();
      });
    });

    it('shows nullable constraints', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(screen.getAllByText('No').length).toBeGreaterThan(0);
        expect(screen.getByText('Yes')).toBeInTheDocument();
      });
    });

    it('shows message when no table is selected', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Select a table to view its schema')).toBeInTheDocument();
      });
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

    it('has accessible table list buttons', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        const tableButtons = screen.getAllByRole('button').filter(btn =>
          /users|posts|comments/i.test(btn.textContent || '')
        );

        tableButtons.forEach(btn => {
          expect(btn).toBeInTheDocument();
        });
      });
    });
  });

  describe('API Integration', () => {
    it('loads tables from API on mount', async () => {
      const { api } = await import('@/lib/api');
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(api.storageListTables).toHaveBeenCalled();
      });
    });

    it('filters out sqlite internal tables', async () => {
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('sqlite_sequence')).not.toBeInTheDocument();
        expect(screen.getByText('users')).toBeInTheDocument();
      });
    });

    it('loads table schema when table is selected', async () => {
      const { api } = await import('@/lib/api');
      render(<DatabasePane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('users')).toBeInTheDocument();
      });

      const usersTable = screen.getByText('users');
      fireEvent.click(usersTable);

      await waitFor(() => {
        expect(api.storageExecuteSql).toHaveBeenCalledWith(expect.stringContaining('PRAGMA table_info'));
        expect(api.storageExecuteSql).toHaveBeenCalledWith(expect.stringContaining('COUNT(*)'));
      });
    });

    it('executes SQL query via API', async () => {
      const { api } = await import('@/lib/api');
      render(<DatabasePane {...defaultProps} />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Query')).toBeInTheDocument();
      });

      // Expand query section
      const queryHeader = screen.getByText('Query');
      fireEvent.click(queryHeader);

      await waitFor(() => {
        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);
      });

      await waitFor(() => {
        expect(api.storageExecuteSql).toHaveBeenCalledWith('SELECT * FROM users LIMIT 10;');
      });
    });

    it('shows loading state during API calls', async () => {
      // Create a delayed mock to catch loading state
      const { api } = await import('@/lib/api');
      let resolveQuery: (value: any) => void;
      const delayedPromise = new Promise(resolve => { resolveQuery = resolve; });
      vi.mocked(api.storageExecuteSql).mockReturnValueOnce(delayedPromise as Promise<any>);

      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      await waitFor(() => {
        const queryHeader = screen.getByText('Query');
        fireEvent.click(queryHeader);
      });

      // Click run query button
      await waitFor(() => {
        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);
      });

      // Should show loading text during the delayed query
      await waitFor(() => {
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });

      // Resolve the delayed promise
      resolveQuery!([]);
    });

    it('displays error message on API failure', async () => {
      const { api } = await import('@/lib/api');
      vi.mocked(api.storageExecuteSql).mockRejectedValueOnce(new Error('SQL syntax error'));

      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      await waitFor(() => {
        const queryHeader = screen.getByText('Query');
        fireEvent.click(queryHeader);
      });

      // Click run query
      await waitFor(() => {
        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);
      });

      // Should show error message (may be multiple elements)
      await waitFor(() => {
        const errorElements = screen.getAllByText(/Query error:/i);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it('handles empty query input', async () => {
      render(<DatabasePane {...defaultProps} />);

      // Expand query section
      await waitFor(() => {
        const queryHeader = screen.getByText('Query');
        fireEvent.click(queryHeader);
      });

      // Clear query input
      await waitFor(() => {
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '' } });
      });

      // Click run query
      const runButton = screen.getByText('Run Query');
      fireEvent.click(runButton);

      // Should show error (may be multiple elements)
      await waitFor(() => {
        const errorElements = screen.getAllByText(/Please enter a SQL query/i);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });
});
