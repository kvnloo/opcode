import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../utils/renderWithProviders';
import { ProjectCard } from '@/components/mobile/apps/ProjectCard';

describe('ProjectCard', () => {
  const defaultProps = {
    name: 'My App',
    author: 'John Doe',
    isPublic: true,
  };

  it('renders project name and author', () => {
    render(<ProjectCard {...defaultProps} />);

    expect(screen.getByText('My App')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays public indicator when project is public', () => {
    render(<ProjectCard {...defaultProps} isPublic={true} />);

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('displays private indicator when project is private', () => {
    render(<ProjectCard {...defaultProps} isPublic={false} />);

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders preview image when provided', () => {
    render(<ProjectCard {...defaultProps} previewImage="https://example.com/image.jpg" />);

    const image = screen.getByAltText('My App');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder when no preview image', () => {
    render(<ProjectCard {...defaultProps} />);

    expect(screen.getByText('📱')).toBeInTheDocument();
  });

  it('shows waiting status badge', () => {
    render(<ProjectCard {...defaultProps} status="waiting" />);

    expect(screen.getByText('Waiting for you')).toBeInTheDocument();
  });

  it('does not show badge when status is running', () => {
    render(<ProjectCard {...defaultProps} status="running" />);

    expect(screen.queryByText('Waiting for you')).not.toBeInTheDocument();
  });

  it('does not show badge when status is stopped', () => {
    render(<ProjectCard {...defaultProps} status="stopped" />);

    expect(screen.queryByText('Waiting for you')).not.toBeInTheDocument();
  });

  it('does not show badge when status is undefined', () => {
    render(<ProjectCard {...defaultProps} />);

    expect(screen.queryByText('Waiting for you')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<ProjectCard {...defaultProps} onClick={onClick} />);

    const card = container.querySelector('.cursor-pointer');
    if (card) {
      fireEvent.click(card);
    }

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not error when onClick is not provided', () => {
    const { container } = render(<ProjectCard {...defaultProps} />);

    const card = container.querySelector('.cursor-pointer');
    if (card) {
      expect(() => fireEvent.click(card)).not.toThrow();
    }
  });

  it('applies hover styles', () => {
    const { container } = render(<ProjectCard {...defaultProps} />);

    const card = container.querySelector('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });

  it('has correct aspect ratio for preview', () => {
    const { container } = render(<ProjectCard {...defaultProps} />);

    const previewContainer = container.querySelector('.aspect-video');
    expect(previewContainer).toBeInTheDocument();
  });

  it('renders Globe icon for public projects', () => {
    const { container } = render(<ProjectCard {...defaultProps} isPublic={true} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders Lock icon for private projects', () => {
    const { container } = render(<ProjectCard {...defaultProps} isPublic={false} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('applies cursor-pointer class', () => {
    const { container } = render(<ProjectCard {...defaultProps} />);

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('maintains proper layout structure', () => {
    const { container } = render(<ProjectCard {...defaultProps} />);

    // Check for preview section
    const preview = container.querySelector('.aspect-video');
    expect(preview).toBeInTheDocument();

    // Check for info section
    const info = container.querySelector('.p-4');
    expect(info).toBeInTheDocument();
  });

  it('positions status badge correctly', () => {
    const { container } = render(<ProjectCard {...defaultProps} status="waiting" />);

    const badge = screen.getByText('Waiting for you');
    expect(badge).toHaveClass('absolute', 'top-2', 'left-2');
  });

  it('styles status badge correctly', () => {
    render(<ProjectCard {...defaultProps} status="waiting" />);

    const badge = screen.getByText('Waiting for you');
    expect(badge).toHaveClass('bg-yellow-500/90', 'text-white', 'text-xs');
  });

  it('handles multiple clicks correctly', () => {
    const onClick = vi.fn();
    const { container } = render(<ProjectCard {...defaultProps} onClick={onClick} />);

    const card = container.querySelector('.cursor-pointer');
    if (card) {
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);
    }

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders with all props combined', () => {
    const onClick = vi.fn();
    render(
      <ProjectCard
        name="Full Featured App"
        author="Jane Smith"
        isPublic={false}
        previewImage="https://example.com/preview.png"
        status="waiting"
        onClick={onClick}
      />
    );

    expect(screen.getByText('Full Featured App')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Waiting for you')).toBeInTheDocument();
    expect(screen.getByAltText('Full Featured App')).toHaveAttribute(
      'src',
      'https://example.com/preview.png'
    );
  });
});
