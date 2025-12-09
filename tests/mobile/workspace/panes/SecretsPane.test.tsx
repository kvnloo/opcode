import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecretsPane } from '@/components/mobile/workspace/panes/SecretsPane';

describe('SecretsPane', () => {
  it('renders secrets pane header', () => {
    render(<SecretsPane />);
    expect(screen.getByText('Environment Variables')).toBeInTheDocument();
  });

  it('displays existing secrets', () => {
    render(<SecretsPane />);
    expect(screen.getByText('API_KEY')).toBeInTheDocument();
    expect(screen.getByText('DATABASE_URL')).toBeInTheDocument();
  });

  it('hides secret values by default', () => {
    render(<SecretsPane />);
    const hiddenValues = screen.getAllByText('••••••••••••');
    expect(hiddenValues.length).toBeGreaterThan(0);
  });

  it('can toggle secret visibility', () => {
    render(<SecretsPane />);
    const showButtons = screen.getAllByLabelText('Show value');
    fireEvent.click(showButtons[0]);
    expect(screen.getByLabelText('Hide value')).toBeInTheDocument();
  });

  it('can add new secret', () => {
    render(<SecretsPane />);
    const keyInput = screen.getByPlaceholderText('KEY');
    const valueInput = screen.getByPlaceholderText('value');
    const addButton = screen.getByLabelText('Add secret');

    fireEvent.change(keyInput, { target: { value: 'NEW_KEY' } });
    fireEvent.change(valueInput, { target: { value: 'secret-value' } });
    fireEvent.click(addButton);

    expect(screen.getByText('NEW_KEY')).toBeInTheDocument();
  });

  it('converts key to uppercase', () => {
    render(<SecretsPane />);
    const keyInput = screen.getByPlaceholderText('KEY') as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: 'lowercase_key' } });
    expect(keyInput.value).toBe('LOWERCASE_KEY');
  });

  it('can delete secret', () => {
    render(<SecretsPane />);
    const deleteButtons = screen.getAllByLabelText('Delete secret');
    const initialCount = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);
    const remainingButtons = screen.getAllByLabelText('Delete secret');
    expect(remainingButtons.length).toBe(initialCount - 1);
  });

  it('clears input after adding secret', () => {
    render(<SecretsPane />);
    const keyInput = screen.getByPlaceholderText('KEY') as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText('value') as HTMLInputElement;
    const addButton = screen.getByLabelText('Add secret');

    fireEvent.change(keyInput, { target: { value: 'TEST_KEY' } });
    fireEvent.change(valueInput, { target: { value: 'test-value' } });
    fireEvent.click(addButton);

    expect(keyInput.value).toBe('');
    expect(valueInput.value).toBe('');
  });

  it('does not add secret with empty key or value', () => {
    render(<SecretsPane />);
    const addButton = screen.getByLabelText('Add secret');
    const initialSecrets = screen.getAllByLabelText('Delete secret').length;

    fireEvent.click(addButton);
    const finalSecrets = screen.getAllByLabelText('Delete secret').length;
    expect(finalSecrets).toBe(initialSecrets);
  });

  it('has accessible buttons', () => {
    render(<SecretsPane />);
    expect(screen.getByLabelText('Add secret')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Show value').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Delete secret').length).toBeGreaterThan(0);
  });

  it('renders informational text', () => {
    render(<SecretsPane />);
    expect(screen.getByText(/Add secrets and environment variables/)).toBeInTheDocument();
  });
});
