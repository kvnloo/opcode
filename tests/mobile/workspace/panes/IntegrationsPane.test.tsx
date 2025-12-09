import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntegrationsPane } from '@/components/mobile/workspace/panes/IntegrationsPane';

describe('IntegrationsPane', () => {
  it('renders integrations pane header', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('Integrations')).toBeInTheDocument();
  });

  it('displays integration categories', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('APIs & Services')).toBeInTheDocument();
    expect(screen.getByText('Databases')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Storage & CDN')).toBeInTheDocument();
  });

  it('displays integration items', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Supabase')).toBeInTheDocument();
    expect(screen.getByText('Cloudflare')).toBeInTheDocument();
    expect(screen.getByText('Auth0')).toBeInTheDocument();
  });

  it('shows connection status for connected integrations', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays integration descriptions', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('Connect to GitHub repositories')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL database with auth')).toBeInTheDocument();
  });

  it('shows correct action buttons', () => {
    render(<IntegrationsPane />);
    expect(screen.getByText('Configure')).toBeInTheDocument(); // For connected
    expect(screen.getAllByText('Connect').length).toBeGreaterThan(0); // For disconnected
  });

  it('renders integration icons', () => {
    const { container } = render(<IntegrationsPane />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('groups integrations by category', () => {
    const { container } = render(<IntegrationsPane />);
    const categories = container.querySelectorAll('h3');
    expect(categories.length).toBeGreaterThan(0);
  });

  it('has accessible buttons for each integration', () => {
    render(<IntegrationsPane />);
    expect(screen.getByLabelText('Configure')).toBeInTheDocument();
    const connectButtons = screen.getAllByLabelText('Connect');
    expect(connectButtons.length).toBeGreaterThan(0);
  });

  it('displays integration cards with proper styling', () => {
    const { container } = render(<IntegrationsPane />);
    const integrationCards = container.querySelectorAll('.bg-card');
    expect(integrationCards.length).toBeGreaterThan(0);
  });
});
