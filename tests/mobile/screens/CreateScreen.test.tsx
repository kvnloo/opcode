import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateScreen } from '@/screens/mobile/CreateScreen';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd, args) => {
    if (cmd === 'analyze_project_description') {
      return Promise.resolve(['nextjs', 'fullstack']);
    }
    if (cmd === 'create_ai_project') {
      return Promise.resolve({
        id: 'test-id',
        name: args?.name || 'test-project',
        path: '/test/path',
        template: args?.template || 'nextjs',
      });
    }
    return Promise.resolve();
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CreateScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders description input on initial load', () => {
    render(<CreateScreen />);

    expect(screen.getByText('What do you want to make?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\., A task management app/i)).toBeInTheDocument();
  });

  it('enables continue button when description is entered', () => {
    render(<CreateScreen />);

    const textarea = screen.getByPlaceholderText(/e\.g\., A task management app/i);
    const continueButton = screen.getByLabelText('Continue to template selection');

    expect(continueButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'A todo app with authentication' } });

    expect(continueButton).not.toBeDisabled();
  });

  it('shows templates after clicking continue', async () => {
    render(<CreateScreen />);

    const textarea = screen.getByPlaceholderText(/e\.g\., A task management app/i);
    fireEvent.change(textarea, { target: { value: 'A todo app' } });

    const continueButton = screen.getByLabelText('Continue to template selection');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Choose a template')).toBeInTheDocument();
    });
  });

  it('can select a template', async () => {
    render(<CreateScreen />);

    // Enter description and continue
    const textarea = screen.getByPlaceholderText(/e\.g\., A task management app/i);
    fireEvent.change(textarea, { target: { value: 'A todo app' } });
    fireEvent.click(screen.getByLabelText('Continue to template selection'));

    await waitFor(() => {
      expect(screen.getByText('Next.js App')).toBeInTheDocument();
    });

    // Select template
    fireEvent.click(screen.getByText('Next.js App'));

    // Project name input should appear
    expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument();
  });

  it('creates project when form is submitted', async () => {
    const { invoke } = await import('@tauri-apps/api/core');

    render(<CreateScreen />);

    // Enter description
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., A task management app/i), {
      target: { value: 'A todo app' }
    });
    fireEvent.click(screen.getByLabelText('Continue to template selection'));

    await waitFor(() => {
      expect(screen.getByText('Next.js App')).toBeInTheDocument();
    });

    // Select template
    fireEvent.click(screen.getByText('Next.js App'));

    // Enter project name
    fireEvent.change(screen.getByPlaceholderText('Project name'), {
      target: { value: 'my-todo-app' }
    });

    // Create project
    fireEvent.click(screen.getByLabelText('Create project'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('create_ai_project', expect.objectContaining({
        name: 'my-todo-app',
      }));
    });
  });

  it('shows success state after project creation', async () => {
    render(<CreateScreen />);

    // Fast forward through the flow
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., A task management app/i), {
      target: { value: 'A todo app' }
    });
    fireEvent.click(screen.getByLabelText('Continue to template selection'));

    await waitFor(() => screen.getByText('Next.js App'));
    fireEvent.click(screen.getByText('Next.js App'));
    fireEvent.change(screen.getByPlaceholderText('Project name'), {
      target: { value: 'my-app' }
    });
    fireEvent.click(screen.getByLabelText('Create project'));

    await waitFor(() => {
      expect(screen.getByText('Project created!')).toBeInTheDocument();
    });
  });

  it('has accessible form elements', () => {
    render(<CreateScreen />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Continue to template selection')).toBeInTheDocument();
  });
});
