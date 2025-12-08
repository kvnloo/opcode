import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { BuildDesignToggle } from '@/components/mobile/create/BuildDesignToggle';

describe('BuildDesignToggle', () => {
  it('renders with build mode selected by default', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    const designButton = screen.getByRole('button', { name: /design/i });

    expect(buildButton).toBeInTheDocument();
    expect(designButton).toBeInTheDocument();
    // Check inline styles for active/inactive states
    expect(buildButton).toHaveStyle({ backgroundColor: 'var(--mobile-accent-primary)' });
    expect(designButton).toHaveStyle({ backgroundColor: 'var(--mobile-bg-secondary)' });
  });

  it('renders with design mode selected', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="design" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    const designButton = screen.getByRole('button', { name: /design/i });

    expect(buildButton).toHaveStyle({ backgroundColor: 'var(--mobile-bg-secondary)' });
    expect(designButton).toHaveStyle({ backgroundColor: 'var(--mobile-accent-primary)' });
  });

  it('shows beta badge on design button', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const betaBadge = screen.getByText('Beta');
    expect(betaBadge).toBeInTheDocument();
    // Check inline styles instead of classes
    expect(betaBadge).toHaveStyle({ backgroundColor: 'var(--mobile-accent-primary)', color: '#FFFFFF' });
  });

  it('calls onChange when build button is clicked', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="design" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    fireEvent.click(buildButton);

    expect(onChange).toHaveBeenCalledWith('build');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when design button is clicked', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    fireEvent.click(designButton);

    expect(onChange).toHaveBeenCalledWith('design');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays correct icons', () => {
    const onChange = vi.fn();
    const { container } = render(<BuildDesignToggle value="build" onChange={onChange} />);

    // Check for Wrench and Paintbrush icons (lucide-react renders as SVG)
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
  });

  it('applies transition styles correctly', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    expect(designButton).toHaveClass('transition-all', 'mobile-active-scale');
  });

  it('maintains state consistency', () => {
    const onChange = vi.fn();
    const { rerender } = render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    fireEvent.click(designButton);

    // Simulate parent component updating state
    rerender(<BuildDesignToggle value="design" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    expect(designButton).toHaveStyle({ backgroundColor: 'var(--mobile-accent-primary)' });
    expect(buildButton).toHaveStyle({ backgroundColor: 'var(--mobile-bg-secondary)' });
  });

  it('handles rapid toggle clicks', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    const buildButton = screen.getByRole('button', { name: /build/i });

    fireEvent.click(designButton);
    fireEvent.click(buildButton);
    fireEvent.click(designButton);

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'design');
    expect(onChange).toHaveBeenNthCalledWith(2, 'build');
    expect(onChange).toHaveBeenNthCalledWith(3, 'design');
  });

  it('renders with correct container structure', () => {
    const onChange = vi.fn();
    const { container } = render(<BuildDesignToggle value="build" onChange={onChange} />);

    const wrapper = container.querySelector('.inline-flex');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children).toHaveLength(2);
  });
});
