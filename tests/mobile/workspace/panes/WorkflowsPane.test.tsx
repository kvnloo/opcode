import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowsPane } from '@/components/mobile/workspace/panes/WorkflowsPane';

describe('WorkflowsPane', () => {
  it('renders workflow list', () => {
    render(<WorkflowsPane />);
    expect(screen.getByText('Agent Workflows')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<WorkflowsPane />);
    const searchInput = screen.getByPlaceholderText('Search for a workflow...');
    expect(searchInput).toBeInTheDocument();
  });

  it('can search workflows', () => {
    render(<WorkflowsPane />);
    const searchInput = screen.getByPlaceholderText('Search for a workflow...');
    fireEvent.change(searchInput, { target: { value: 'Project' } });
    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  it('filters workflows based on search', () => {
    render(<WorkflowsPane />);
    const searchInput = screen.getByPlaceholderText('Search for a workflow...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.queryByText('Project')).not.toBeInTheDocument();
  });

  it('can expand/collapse sections', () => {
    render(<WorkflowsPane />);
    const sectionButton = screen.getByText('Agent Workflows').closest('button');
    expect(sectionButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(sectionButton!);
    expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has accessible buttons', () => {
    render(<WorkflowsPane />);
    expect(screen.getByLabelText('New Workflow')).toBeInTheDocument();
  });

  it('displays workflow items with correct badges', () => {
    render(<WorkflowsPane />);
    expect(screen.getAllByText('Run Button').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Generated').length).toBeGreaterThan(0);
  });

  it('can expand individual workflow items', () => {
    render(<WorkflowsPane />);
    const workflowButtons = screen.getAllByRole('button');
    const firstWorkflow = workflowButtons.find(btn => btn.textContent?.includes('Project'));
    if (firstWorkflow) {
      fireEvent.click(firstWorkflow);
      expect(screen.getByText('Workflow configuration details...')).toBeInTheDocument();
    }
  });

  it('renders learn more link', () => {
    render(<WorkflowsPane />);
    expect(screen.getByText('Learn more about configuring Workflows')).toBeInTheDocument();
  });

  it('maintains workflow state during search', () => {
    render(<WorkflowsPane />);
    const searchInput = screen.getByPlaceholderText('Search for a workflow...');
    fireEvent.change(searchInput, { target: { value: 'Start' } });
    expect(screen.getByText('Start Game')).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
  });
});
