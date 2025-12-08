import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { ProjectList } from '@/components/mobile/apps/ProjectList';

describe('ProjectList', () => {
  const mockProjects = [
    {
      id: '1',
      name: 'Project 1',
      author: 'Author 1',
      isPublic: true,
      previewImage: 'https://example.com/1.jpg',
      status: 'running' as const,
    },
    {
      id: '2',
      name: 'Project 2',
      author: 'Author 2',
      isPublic: false,
      status: 'waiting' as const,
    },
    {
      id: '3',
      name: 'Project 3',
      author: 'Author 3',
      isPublic: true,
      status: 'stopped' as const,
    },
  ];

  it('renders empty state when no projects', () => {
    render(<ProjectList projects={[]} />);

    expect(screen.getByText('No apps yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first app to get started')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders all projects when provided', () => {
    render(<ProjectList projects={mockProjects} />);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    expect(screen.getByText('Project 3')).toBeInTheDocument();
  });

  it('renders project authors', () => {
    render(<ProjectList projects={mockProjects} />);

    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();
    expect(screen.getByText('Author 3')).toBeInTheDocument();
  });

  it('calls onProjectClick when a project is clicked', () => {
    const onProjectClick = vi.fn();
    render(<ProjectList projects={mockProjects} onProjectClick={onProjectClick} />);

    const projectCards = screen.getAllByText(/Project \d/);
    const card = projectCards[0].closest('.cursor-pointer');
    if (card) {
      fireEvent.click(card);
    }

    expect(onProjectClick).toHaveBeenCalledTimes(1);
    expect(onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('does not error when onProjectClick is not provided', () => {
    render(<ProjectList projects={mockProjects} />);

    const projectCards = screen.getAllByText(/Project \d/);
    const card = projectCards[0].closest('.cursor-pointer');

    if (card) {
      expect(() => fireEvent.click(card)).not.toThrow();
    }
  });

  it('renders projects with correct spacing', () => {
    const { container } = render(<ProjectList projects={mockProjects} />);

    const listContainer = container.querySelector('.space-y-4');
    expect(listContainer).toBeInTheDocument();
  });

  it('renders each project as a separate card', () => {
    render(<ProjectList projects={mockProjects} />);

    const cards = screen.getAllByText(/Project \d/).map(text => text.closest('.cursor-pointer'));
    expect(cards).toHaveLength(3);
  });

  it('handles single project correctly', () => {
    const singleProject = [mockProjects[0]];
    render(<ProjectList projects={singleProject} />);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.queryByText('Project 2')).not.toBeInTheDocument();
    expect(screen.queryByText('No apps yet')).not.toBeInTheDocument();
  });

  it('renders public/private indicators correctly', () => {
    render(<ProjectList projects={mockProjects} />);

    // Project 1 and 3 are public
    const publicLabels = screen.getAllByText('Public');
    expect(publicLabels).toHaveLength(2);

    // Project 2 is private
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders status badges correctly', () => {
    render(<ProjectList projects={mockProjects} />);

    // Only Project 2 has "waiting" status
    expect(screen.getByText('Waiting for you')).toBeInTheDocument();
  });

  it('handles clicks on different projects', () => {
    const onProjectClick = vi.fn();
    render(<ProjectList projects={mockProjects} onProjectClick={onProjectClick} />);

    const projectCards = screen.getAllByText(/Project \d/);

    const card1 = projectCards[0].closest('.cursor-pointer');
    const card2 = projectCards[1].closest('.cursor-pointer');
    const card3 = projectCards[2].closest('.cursor-pointer');

    if (card1) fireEvent.click(card1);
    if (card2) fireEvent.click(card2);
    if (card3) fireEvent.click(card3);

    expect(onProjectClick).toHaveBeenCalledTimes(3);
    expect(onProjectClick).toHaveBeenNthCalledWith(1, mockProjects[0]);
    expect(onProjectClick).toHaveBeenNthCalledWith(2, mockProjects[1]);
    expect(onProjectClick).toHaveBeenNthCalledWith(3, mockProjects[2]);
  });

  it('renders preview images when provided', () => {
    render(<ProjectList projects={mockProjects} />);

    const image = screen.getByAltText('Project 1');
    expect(image).toHaveAttribute('src', 'https://example.com/1.jpg');
  });

  it('renders placeholder for projects without images', () => {
    render(<ProjectList projects={mockProjects} />);

    // Projects 2 and 3 don't have images
    const placeholders = screen.getAllByText('📱');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
  });

  it('maintains project order', () => {
    const { container } = render(<ProjectList projects={mockProjects} />);

    const projectNames = Array.from(container.querySelectorAll('h3')).map(
      h3 => h3.textContent
    );

    expect(projectNames).toEqual(['Project 1', 'Project 2', 'Project 3']);
  });

  it('handles empty array same as no projects', () => {
    render(<ProjectList projects={[]} />);

    expect(screen.getByText('No apps yet')).toBeInTheDocument();
  });

  it('empty state has correct styling', () => {
    const { container } = render(<ProjectList projects={[]} />);

    const emptyState = container.querySelector('.flex.flex-col.items-center.justify-center');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('py-12', 'text-center');
  });

  it('renders large number of projects', () => {
    const manyProjects = Array.from({ length: 50 }, (_, i) => ({
      id: `project-${i}`,
      name: `Project ${i}`,
      author: `Author ${i}`,
      isPublic: i % 2 === 0,
    }));

    render(<ProjectList projects={manyProjects} />);

    expect(screen.getByText('Project 0')).toBeInTheDocument();
    expect(screen.getByText('Project 49')).toBeInTheDocument();
  });

  it('handles project with all optional fields undefined', () => {
    const minimalProject = [
      {
        id: '1',
        name: 'Minimal Project',
        author: 'Test Author',
        isPublic: true,
      },
    ];

    render(<ProjectList projects={minimalProject} />);

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders different status combinations', () => {
    const statusProjects = [
      { ...mockProjects[0], status: 'waiting' as const },
      { ...mockProjects[1], status: 'running' as const },
      { ...mockProjects[2], status: 'stopped' as const },
    ];

    render(<ProjectList projects={statusProjects} />);

    // Only "waiting" status shows badge
    const waitingBadges = screen.queryAllByText('Waiting for you');
    expect(waitingBadges).toHaveLength(1);
  });
});
