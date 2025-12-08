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
    expect(buildButton).toHaveClass('bg-background', 'text-foreground', 'shadow-sm');
    expect(designButton).not.toHaveClass('bg-background');
  });

  it('renders with design mode selected', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="design" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    const designButton = screen.getByRole('button', { name: /design/i });

    expect(buildButton).not.toHaveClass('bg-background');
    expect(designButton).toHaveClass('bg-background', 'text-foreground', 'shadow-sm');
  });

  it('shows beta badge on design button', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const betaBadge = screen.getByText('Beta');
    expect(betaBadge).toBeInTheDocument();
    expect(betaBadge).toHaveClass('text-xs', 'bg-primary/10', 'text-primary');
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

  it('applies hover styles correctly', () => {
    const onChange = vi.fn();
    render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    expect(designButton).toHaveClass('hover:text-foreground');
  });

  it('maintains state consistency', () => {
    const onChange = vi.fn();
    const { rerender } = render(<BuildDesignToggle value="build" onChange={onChange} />);

    const designButton = screen.getByRole('button', { name: /design/i });
    fireEvent.click(designButton);

    // Simulate parent component updating state
    rerender(<BuildDesignToggle value="design" onChange={onChange} />);

    const buildButton = screen.getByRole('button', { name: /build/i });
    expect(designButton).toHaveClass('bg-background');
    expect(buildButton).not.toHaveClass('bg-background');
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

    const wrapper = container.querySelector('.inline-flex.bg-muted.rounded-lg');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children).toHaveLength(2);
  });
});
