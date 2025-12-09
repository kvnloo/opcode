import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevToolsPane } from '@/components/mobile/workspace/panes/DevToolsPane';

describe('DevToolsPane', () => {
  it('renders dev tools header', () => {
    render(<DevToolsPane />);
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
  });

  it('displays tab navigation', () => {
    render(<DevToolsPane />);
    expect(screen.getByText('Console')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('defaults to console tab', () => {
    render(<DevToolsPane />);
    expect(screen.getByText('Server started on port 3000')).toBeInTheDocument();
  });

  it('can switch to network tab', () => {
    render(<DevToolsPane />);
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('can switch to performance tab', () => {
    render(<DevToolsPane />);
    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);
    expect(screen.getByText(/FCP/)).toBeInTheDocument();
    expect(screen.getByText(/LCP/)).toBeInTheDocument();
  });

  it('displays console logs with different levels', () => {
    render(<DevToolsPane />);
    expect(screen.getByText('Server started on port 3000')).toBeInTheDocument();
    expect(screen.getByText('Connected to database')).toBeInTheDocument();
    expect(screen.getByText('Deprecated API usage detected')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch user data')).toBeInTheDocument();
  });

  it('displays log timestamps', () => {
    const { container } = render(<DevToolsPane />);
    const timestamps = container.querySelectorAll('.text-muted-foreground');
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it('displays network requests in table', () => {
    render(<DevToolsPane />);
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);
    expect(screen.getByText('api/users')).toBeInTheDocument();
    expect(screen.getByText('api/posts')).toBeInTheDocument();
  });

  it('shows network status codes', () => {
    render(<DevToolsPane />);
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);
    expect(screen.getAllByText('200').length).toBeGreaterThan(0);
    expect(screen.getByText('401')).toBeInTheDocument();
  });

  it('displays performance metrics', () => {
    render(<DevToolsPane />);
    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);
    expect(screen.getByText(/First Contentful Paint/)).toBeInTheDocument();
    expect(screen.getByText(/Largest Contentful Paint/)).toBeInTheDocument();
    expect(screen.getByText(/Cumulative Layout Shift/)).toBeInTheDocument();
  });

  it('has clear button', () => {
    render(<DevToolsPane />);
    expect(screen.getByText('Clear Console')).toBeInTheDocument();
  });

  it('updates clear button text based on active tab', () => {
    render(<DevToolsPane />);
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);
    expect(screen.getByText('Clear Network')).toBeInTheDocument();
  });

  it('renders log level icons', () => {
    const { container } = render(<DevToolsPane />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
