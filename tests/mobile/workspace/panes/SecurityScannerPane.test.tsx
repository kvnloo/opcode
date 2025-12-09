import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SecurityScannerPane } from '@/components/mobile/workspace/panes/SecurityScannerPane';

describe('SecurityScannerPane', () => {
  it('renders security scanner header', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('Security Scanner')).toBeInTheDocument();
  });

  it('displays vulnerability summary', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('shows correct vulnerability counts', () => {
    const { container } = render(<SecurityScannerPane />);
    const counts = container.querySelectorAll('.text-2xl.font-bold');
    expect(counts[0]).toHaveTextContent('3'); // Total
    expect(counts[1]).toHaveTextContent('1'); // Critical
  });

  it('displays vulnerability list', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('SQL Injection vulnerability')).toBeInTheDocument();
    expect(screen.getByText(/Outdated dependency/)).toBeInTheDocument();
    expect(screen.getByText('Weak password policy')).toBeInTheDocument();
  });

  it('shows severity badges', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('displays vulnerability descriptions', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('Unsanitized user input in database query')).toBeInTheDocument();
  });

  it('shows file locations for code vulnerabilities', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText('src/api/users.ts:45')).toBeInTheDocument();
    expect(screen.getByText('src/auth/password.ts:23')).toBeInTheDocument();
  });

  it('displays recommendations', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText(/Use parameterized queries/)).toBeInTheDocument();
    expect(screen.getByText(/Update to express/)).toBeInTheDocument();
  });

  it('has scan now button', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByLabelText('Scan now')).toBeInTheDocument();
  });

  it('shows scanning state when clicked', () => {
    render(<SecurityScannerPane />);
    const scanButton = screen.getByLabelText('Scan now');

    fireEvent.click(scanButton);
    expect(screen.getByText('Scanning...')).toBeInTheDocument();
    expect(scanButton).toBeDisabled();
  });

  it('displays last scan time', () => {
    render(<SecurityScannerPane />);
    expect(screen.getByText(/Last scan:/)).toBeInTheDocument();
  });

  it('renders severity icons', () => {
    const { container } = render(<SecurityScannerPane />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('uses correct color coding for severity levels', () => {
    const { container } = render(<SecurityScannerPane />);
    const criticalBadge = screen.getByText('critical');
    expect(criticalBadge).toHaveClass('text-red-400');
  });
});
