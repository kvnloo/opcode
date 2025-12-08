import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/renderWithProviders';
import { simulateMobile, simulateTablet } from '../utils/platformSimulator';
import { AppsScreen } from '@/screens/mobile/AppsScreen';
import userEvent from '@testing-library/user-event';

// Mock child components
vi.mock('@/components/mobile/apps/ProjectList', () => ({
  ProjectList: ({ projects, onProjectClick }: any) => (
    <div data-testid="project-list">
      {projects.length === 0 ? (
        <div>No apps yet</div>
      ) : (
        <div>
          {projects.map((p: any) => (
            <button key={p.id} onClick={() => onProjectClick(p)}>
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

vi.mock('@/screens/mobile/WorkspaceScreen', () => ({
  WorkspaceScreen: ({ projectId, projectName, onBack }: any) => (
    <div data-testid="workspace-screen">
      <div>Workspace: {projectName}</div>
      <div>ID: {projectId}</div>
      <button onClick={onBack}>Back to Apps</button>
    </div>
  ),
}));

// Mock workspace store
const mockSetProject = vi.fn();
const mockCurrentProject = vi.fn(() => null);

vi.mock('@/stores/workspaceStore', () => ({
  useWorkspaceStore: () => ({
    setProject: mockSetProject,
    currentProject: mockCurrentProject(),
  }),
}));

describe('AppsScreen', () => {
  beforeEach(() => {
    simulateMobile();
    vi.clearAllMocks();
    mockCurrentProject.mockReturnValue(null);
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AppsScreen />);
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });

    it('renders screen header', () => {
      render(<AppsScreen />);
      expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
    });

    it('renders filter bar', () => {
      render(<AppsScreen />);
      expect(screen.getByText('All Apps')).toBeInTheDocument();
    });

    it('renders project list component', () => {
      render(<AppsScreen />);
      expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });

    it('has proper layout structure', () => {
      const { container } = render(<AppsScreen />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col', 'bg-background');
    });
  });

  describe('Header Section', () => {
    it('displays Apps heading with correct styling', () => {
      render(<AppsScreen />);
      const heading = screen.getByRole('heading', { name: 'Apps' });
      expect(heading).toHaveClass('text-2xl', 'font-bold');
    });

    it('has border below header', () => {
      render(<AppsScreen />);
      const header = screen.getByText('Apps').closest('div');
      expect(header).toHaveClass('border-b', 'border-border');
    });

    it('has proper spacing in header', () => {
      render(<AppsScreen />);
      const header = screen.getByText('Apps').closest('div');
      expect(header).toHaveClass('p-4');
    });
  });

  describe('Filter Bar', () => {
    it('renders filter button', () => {
      render(<AppsScreen />);
      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      expect(filterButton).toBeInTheDocument();
    });

    it('displays filter arrow', () => {
      render(<AppsScreen />);
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('has proper styling', () => {
      render(<AppsScreen />);
      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      expect(filterButton).toHaveClass('flex', 'items-center', 'gap-2', 'text-muted-foreground');
    });

    it('filter button is clickable', async () => {
      const user = userEvent.setup();
      render(<AppsScreen />);
      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      await user.click(filterButton);
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no projects', () => {
      render(<AppsScreen />);
      expect(screen.getByText('No apps yet')).toBeInTheDocument();
    });

    it('passes empty projects array to ProjectList', () => {
      render(<AppsScreen />);
      const projectList = screen.getByTestId('project-list');
      expect(projectList).toBeInTheDocument();
      expect(screen.getByText('No apps yet')).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('has scrollable area for project list', () => {
      const { container } = render(<AppsScreen />);
      const scrollArea = container.querySelector('[class*="flex-1"]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('scroll area takes remaining height', () => {
      const { container } = render(<AppsScreen />);
      const scrollArea = screen.getByTestId('project-list').closest('.flex-1');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Layout and Spacing', () => {
    it('has proper spacing around project list', () => {
      render(<AppsScreen />);
      const projectListContainer = screen.getByTestId('project-list').parentElement;
      expect(projectListContainer).toHaveClass('p-4', 'space-y-4');
    });

    it('uses background color', () => {
      const { container } = render(<AppsScreen />);
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('bg-background');
    });

    it('uses full height layout', () => {
      const { container } = render(<AppsScreen />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('h-full');
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile', () => {
      simulateMobile();
      render(<AppsScreen />);
      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });

    it('renders correctly on tablet', () => {
      simulateTablet();
      render(<AppsScreen />);
      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });

    it('maintains layout on orientation change', () => {
      simulateMobile();
      const { container } = render(<AppsScreen />);

      // Simulate orientation change
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('resize'));

      expect(container.firstChild).toHaveClass('h-full');
      expect(screen.getByText('Apps')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      render(<AppsScreen />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Apps');
    });

    it('has interactive filter button', () => {
      render(<AppsScreen />);
      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      expect(filterButton).toBeEnabled();
    });

    it('uses flex column for proper flow', () => {
      const { container } = render(<AppsScreen />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex-col');
    });
  });

  describe('Integration', () => {
    it('renders all main sections together', () => {
      render(<AppsScreen />);

      expect(screen.getByRole('heading', { name: 'Apps' })).toBeInTheDocument();
      expect(screen.getByText('All Apps')).toBeInTheDocument();
      expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });

    it('maintains proper visual hierarchy', () => {
      const { container } = render(<AppsScreen />);
      const sections = container.querySelectorAll('[class*="border-b"]');
      expect(sections.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Navigation States', () => {
    it('shows apps list by default', () => {
      render(<AppsScreen />);
      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.queryByTestId('workspace-screen')).not.toBeInTheDocument();
    });

    it('does not show workspace initially', () => {
      render(<AppsScreen />);
      expect(screen.queryByTestId('workspace-screen')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid filter clicks', async () => {
      const user = userEvent.setup();
      render(<AppsScreen />);

      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      await user.click(filterButton);
      await user.click(filterButton);
      await user.click(filterButton);

      expect(filterButton).toBeInTheDocument();
    });

    it('maintains structure with no projects', () => {
      render(<AppsScreen />);

      expect(screen.getByText('Apps')).toBeInTheDocument();
      expect(screen.getByText('All Apps')).toBeInTheDocument();
      expect(screen.getByText('No apps yet')).toBeInTheDocument();
    });

    it('handles empty project array gracefully', () => {
      render(<AppsScreen />);
      expect(screen.getByTestId('project-list')).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('uses theme classes', () => {
      const { container } = render(<AppsScreen />);
      const mainContainer = container.firstChild as HTMLElement;

      expect(mainContainer).toHaveClass('bg-background');
      expect(screen.getByText('Apps').closest('div')).toHaveClass('border-border');
    });

    it('uses muted foreground for filter', () => {
      render(<AppsScreen />);
      const filterButton = screen.getByRole('button', { name: /All Apps/i });
      expect(filterButton).toHaveClass('text-muted-foreground');
    });
  });
});
