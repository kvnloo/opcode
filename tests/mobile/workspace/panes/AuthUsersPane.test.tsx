import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthUsersPane } from '@/components/mobile/workspace/panes/AuthUsersPane';

describe('AuthUsersPane', () => {
  it('renders auth users pane header', () => {
    render(<AuthUsersPane />);
    expect(screen.getByText('Users & Authentication')).toBeInTheDocument();
  });

  it('displays user list', () => {
    render(<AuthUsersPane />);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('editor@example.com')).toBeInTheDocument();
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument();
  });

  it('shows user roles', () => {
    render(<AuthUsersPane />);
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });

  it('shows user status badges', () => {
    render(<AuthUsersPane />);
    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    expect(screen.getByText('invited')).toBeInTheDocument();
  });

  it('can search users', () => {
    render(<AuthUsersPane />);
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('filters users based on search', () => {
    render(<AuthUsersPane />);
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'editor' } });
    expect(screen.getByText('editor@example.com')).toBeInTheDocument();
    expect(screen.queryByText('viewer@example.com')).not.toBeInTheDocument();
  });

  it('has invite user button', () => {
    render(<AuthUsersPane />);
    expect(screen.getByLabelText('Invite user')).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    render(<AuthUsersPane />);
    expect(screen.getByText(/users/)).toBeInTheDocument();
    const activeElements = screen.getAllByText(/active/i);
    expect(activeElements.length).toBeGreaterThan(0);
  });

  it('has more options button for each user', () => {
    render(<AuthUsersPane />);
    const moreButtons = screen.getAllByLabelText('More options');
    expect(moreButtons.length).toBeGreaterThan(0);
  });

  it('displays last active time for active users', () => {
    render(<AuthUsersPane />);
    const activeText = screen.getAllByText(/Active/);
    expect(activeText.length).toBeGreaterThan(0);
  });

  it('renders user avatars', () => {
    const { container } = render(<AuthUsersPane />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('has accessible buttons', () => {
    render(<AuthUsersPane />);
    expect(screen.getByLabelText('Invite user')).toBeInTheDocument();
    expect(screen.getAllByLabelText('More options').length).toBeGreaterThan(0);
  });
});
