import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyValueStorePane } from '@/components/mobile/workspace/panes/KeyValueStorePane';

describe('KeyValueStorePane', () => {
  it('renders key-value store header', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByText('Key-Value Store')).toBeInTheDocument();
  });

  it('displays existing key-value pairs', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByText('user:preferences')).toBeInTheDocument();
    expect(screen.getByText('session:count')).toBeInTheDocument();
    expect(screen.getByText('feature:enabled')).toBeInTheDocument();
  });

  it('displays values in table format', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows type badges for each item', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByText('json')).toBeInTheDocument();
    expect(screen.getByText('number')).toBeInTheDocument();
    expect(screen.getByText('boolean')).toBeInTheDocument();
  });

  it('can search keys', () => {
    render(<KeyValueStorePane />);
    const searchInput = screen.getByPlaceholderText('Search keys...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    expect(screen.getByText('user:preferences')).toBeInTheDocument();
  });

  it('filters keys based on search', () => {
    render(<KeyValueStorePane />);
    const searchInput = screen.getByPlaceholderText('Search keys...');
    fireEvent.change(searchInput, { target: { value: 'session' } });
    expect(screen.getByText('session:count')).toBeInTheDocument();
    expect(screen.queryByText('user:preferences')).not.toBeInTheDocument();
  });

  it('has add key button', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByLabelText('Add key')).toBeInTheDocument();
  });

  it('has edit buttons for each item', () => {
    render(<KeyValueStorePane />);
    const editButtons = screen.getAllByLabelText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('has delete buttons for each item', () => {
    render(<KeyValueStorePane />);
    const deleteButtons = screen.getAllByLabelText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('displays storage statistics', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByText(/keys/)).toBeInTheDocument();
    expect(screen.getByText(/KB used/)).toBeInTheDocument();
  });

  it('renders values in monospace font', () => {
    const { container } = render(<KeyValueStorePane />);
    const monospaceElements = container.querySelectorAll('.font-mono');
    expect(monospaceElements.length).toBeGreaterThan(0);
  });

  it('has accessible action buttons', () => {
    render(<KeyValueStorePane />);
    expect(screen.getByLabelText('Add key')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Edit').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Delete').length).toBeGreaterThan(0);
  });
});
