import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { PromptInput } from '@/components/mobile/create/PromptInput';

describe('PromptInput', () => {
  it('renders with default placeholder', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    expect(screen.getByPlaceholderText('Describe what you want to build...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <PromptInput
        value=""
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <PromptInput value="Build a todo app" onChange={onChange} onSubmit={onSubmit} />
    );

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    expect(textarea).toHaveValue('Build a todo app');
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('renders attachment button', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const attachButton = screen.getByLabelText('Attach file');
    expect(attachButton).toBeInTheDocument();
  });

  it('renders voice input button', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const voiceButton = screen.getByLabelText('Voice input');
    expect(voiceButton).toBeInTheDocument();
  });

  it('disables submit button when value is empty', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('cursor-not-allowed');
  });

  it('disables submit button when value is only whitespace', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="   " onChange={onChange} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when value is valid', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass('bg-primary');
  });

  it('calls onSubmit when submit button is clicked', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Enter key is pressed', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit when Shift+Enter is pressed', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} isLoading />
    );

    expect(screen.getByText('Creating App...')).toBeInTheDocument();
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  it('disables textarea when loading', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} isLoading />
    );

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    expect(textarea).toBeDisabled();
  });

  it('disables submit button when loading', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} isLoading />
    );

    const submitButton = screen.getByRole('button', { name: /creating app/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading spinner when loading', async () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <PromptInput value="Build something" onChange={onChange} onSubmit={onSubmit} isLoading />
    );

    await waitFor(() => {
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('renders action bar with correct styling', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <PromptInput value="" onChange={onChange} onSubmit={onSubmit} />
    );

    const actionBar = container.querySelector('.border-t.border-border');
    expect(actionBar).toBeInTheDocument();
  });

  it('renders textarea with minimum height', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');
    expect(textarea).toHaveClass('min-h-[120px]');
  });

  it('prevents default on Enter key and submits', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="Test" onChange={onChange} onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Describe what you want to build...');

    // Fire keyDown event with Enter key
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      shiftKey: false
    });

    // Should have called onSubmit since Enter was pressed without Shift
    expect(onSubmit).toHaveBeenCalled();
  });

  it('does not submit when button is disabled', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<PromptInput value="" onChange={onChange} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create/i });

    // Try to click the disabled button
    fireEvent.click(submitButton);

    // onSubmit should not be called because button is disabled
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('displays correct icons in action buttons', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <PromptInput value="" onChange={onChange} onSubmit={onSubmit} />
    );

    // Should have icons for attach, mic, and send
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });
});
