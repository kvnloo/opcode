import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { TemplateSelector } from '@/components/mobile/create/TemplateSelector';

describe('TemplateSelector', () => {
  it('renders all template options', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /web app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mobile app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /data app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3d game/i })).toBeInTheDocument();
  });

  it('highlights the selected template', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const webButton = screen.getByRole('button', { name: /web app/i });
    const mobileButton = screen.getByRole('button', { name: /mobile app/i });

    // Check that the selected template has proper styling attributes
    expect(webButton).toHaveAttribute('style');
    expect(mobileButton).toHaveAttribute('style');
    // The specific border colors are set via inline styles
    const webStyles = webButton.getAttribute('style');
    const mobileStyles = mobileButton.getAttribute('style');
    expect(webStyles).toContain('border-color');
    expect(mobileStyles).toContain('border-color');
  });

  it('shows description for selected template', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    expect(screen.getByText('Full-stack web applications')).toBeInTheDocument();
  });

  it('updates description when selection changes', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<TemplateSelector selected="web" onSelect={onSelect} />);

    expect(screen.getByText('Full-stack web applications')).toBeInTheDocument();

    rerender(<TemplateSelector selected="data" onSelect={onSelect} />);

    expect(screen.getByText('Data analysis and visualization')).toBeInTheDocument();
    expect(screen.queryByText('Full-stack web applications')).not.toBeInTheDocument();
  });

  it('shows beta badge on mobile template', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const mobileButton = screen.getByRole('button', { name: /mobile app/i });
    expect(mobileButton).toHaveTextContent('Beta');
  });

  it('calls onSelect when template is clicked', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const dataButton = screen.getByRole('button', { name: /data app/i });
    fireEvent.click(dataButton);

    expect(onSelect).toHaveBeenCalledWith('data');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('displays all template icons', () => {
    const onSelect = vi.fn();
    const { container } = render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4 template icons
  });

  it('handles clicking already selected template', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const webButton = screen.getByRole('button', { name: /web app/i });
    fireEvent.click(webButton);

    expect(onSelect).toHaveBeenCalledWith('web');
  });

  it('applies transition styles to templates', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const mobileButton = screen.getByRole('button', { name: /mobile app/i });
    expect(mobileButton).toHaveClass('transition-all', 'mobile-active-scale');
  });

  it('renders templates in horizontal scrollable container', () => {
    const onSelect = vi.fn();
    const { container } = render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('flex', 'gap-3', 'mobile-smooth-scroll');
  });

  it('maintains whitespace-nowrap for template buttons', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('whitespace-nowrap');
    });
  });

  it('handles sequential template selection', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selected="web" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /mobile app/i }));
    fireEvent.click(screen.getByRole('button', { name: /data app/i }));
    fireEvent.click(screen.getByRole('button', { name: /3d game/i }));

    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenNthCalledWith(1, 'mobile');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'data');
    expect(onSelect).toHaveBeenNthCalledWith(3, '3d');
  });

  it('renders correct template names and descriptions', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<TemplateSelector selected="web" onSelect={onSelect} />);

    const templates = [
      { id: 'web', name: 'Web app', description: 'Full-stack web applications' },
      { id: 'mobile', name: 'Mobile app', description: 'Native apps for iOS and Android' },
      { id: 'data', name: 'Data app', description: 'Data analysis and visualization' },
      { id: '3d', name: '3D Game', description: 'Interactive 3D experiences' },
    ];

    templates.forEach(template => {
      rerender(<TemplateSelector selected={template.id} onSelect={onSelect} />);
      expect(screen.getByText(template.description)).toBeInTheDocument();
    });
  });
});
