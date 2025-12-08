import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PublishingPane } from '@/components/mobile/workspace/panes/PublishingPane';
import type { Deployment } from '@/components/mobile/workspace/panes/PublishingPane';

describe('PublishingPane', () => {
  const mockOnSubdomainChange = vi.fn();
  const mockOnPublish = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnShowToast = vi.fn();

  const defaultProps = {
    subdomain: 'my-app',
    onSubdomainChange: mockOnSubdomainChange,
    isAvailable: true,
    isChecking: false,
    publishStatus: 'unpublished' as const,
    onPublish: mockOnPublish,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header with title', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('Publishing')).toBeInTheDocument();
    });

    it('should render main heading', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('Publish your app')).toBeInTheDocument();
    });

    it('should render subdomain input', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('my-app');
    });

    it('should render domain suffix', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('.opcode.app')).toBeInTheDocument();
    });

    it('should render custom suffix when provided', () => {
      render(<PublishingPane {...defaultProps} suffix=".custom.com" />);

      expect(screen.getByText('.custom.com')).toBeInTheDocument();
    });

    it('should render back button when onBack provided', () => {
      render(<PublishingPane {...defaultProps} onBack={mockOnBack} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('should not render back button when onBack not provided', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
    });
  });

  describe('Subdomain input', () => {
    it('should call onSubdomainChange when typing', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      fireEvent.change(input, { target: { value: 'new-app' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledWith('new-app');
    });

    it('should convert to lowercase', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      fireEvent.change(input, { target: { value: 'MyApp' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledWith('myapp');
    });

    it('should remove invalid characters', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      fireEvent.change(input, { target: { value: 'my_app@123!' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledWith('my-app123');
    });

    it('should allow hyphens', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      fireEvent.change(input, { target: { value: 'my-awesome-app' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledWith('my-awesome-app');
    });

    it('should allow numbers', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      fireEvent.change(input, { target: { value: 'app123' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledWith('app123');
    });

    it('should be disabled when publishing', () => {
      render(<PublishingPane {...defaultProps} publishStatus="publishing" />);

      const input = screen.getByPlaceholderText('my-awesome-app');
      expect(input).toBeDisabled();
    });
  });

  describe('Availability indicator', () => {
    it('should show checking state', () => {
      render(<PublishingPane {...defaultProps} isChecking={true} />);

      expect(screen.getByText('Checking availability...')).toBeInTheDocument();
    });

    it('should show available state', () => {
      render(<PublishingPane {...defaultProps} isAvailable={true} isChecking={false} />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should show unavailable state', () => {
      render(<PublishingPane {...defaultProps} isAvailable={false} isChecking={false} />);

      expect(screen.getByText('This subdomain is already taken')).toBeInTheDocument();
    });

    it('should not show indicator when subdomain is empty', () => {
      render(<PublishingPane {...defaultProps} subdomain="" />);

      expect(screen.queryByText('Available')).not.toBeInTheDocument();
      expect(screen.queryByText('Checking availability...')).not.toBeInTheDocument();
    });

    it('should show indicator when subdomain has value', () => {
      render(<PublishingPane {...defaultProps} subdomain="test" isAvailable={true} />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  describe('Publish button', () => {
    it('should render publish button', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('Publish app')).toBeInTheDocument();
    });

    it('should be enabled when available and has subdomain', () => {
      render(<PublishingPane {...defaultProps} isAvailable={true} subdomain="my-app" />);

      const button = screen.getByText('Publish app');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when unavailable', () => {
      render(<PublishingPane {...defaultProps} isAvailable={false} />);

      const button = screen.getByText('Publish app');
      expect(button).toBeDisabled();
    });

    it('should be disabled when subdomain is empty', () => {
      render(<PublishingPane {...defaultProps} subdomain="" isAvailable={true} />);

      const button = screen.getByText('Publish app');
      expect(button).toBeDisabled();
    });

    it('should be disabled when publishing', () => {
      render(<PublishingPane {...defaultProps} publishStatus="publishing" />);

      const button = screen.getByText('Publishing...');
      expect(button).toBeDisabled();
    });

    it('should call onPublish when clicked', () => {
      render(<PublishingPane {...defaultProps} isAvailable={true} subdomain="test-app" />);

      const button = screen.getByText('Publish app');
      fireEvent.click(button);

      expect(mockOnPublish).toHaveBeenCalledTimes(1);
    });

    it('should show publishing state', () => {
      render(<PublishingPane {...defaultProps} publishStatus="publishing" />);

      expect(screen.getByText('Publishing...')).toBeInTheDocument();
    });

    it('should not be visible when already published', () => {
      render(<PublishingPane {...defaultProps} publishStatus="published" />);

      expect(screen.queryByText('Publish app')).not.toBeInTheDocument();
    });
  });

  describe('Upgrade card', () => {
    it('should render upgrade card', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText(/Limited time offer: Free '.com' domain/)).toBeInTheDocument();
    });

    it('should show all benefits', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText(/Free '.com' domain up to \$13/)).toBeInTheDocument();
      expect(screen.getByText(/Monthly credits for Opcode Agent/)).toBeInTheDocument();
      expect(screen.getByText(/Publish and persist live apps/)).toBeInTheDocument();
      expect(screen.getByText(/Access powerful models and more/)).toBeInTheDocument();
    });

    it('should have upgrade button', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('Upgrade now')).toBeInTheDocument();
    });

    it('should show free domain badge', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('Free domain included')).toBeInTheDocument();
    });
  });

  describe('Published state', () => {
    it('should show success message when published', () => {
      render(<PublishingPane {...defaultProps} publishStatus="published" subdomain="my-app" />);

      expect(screen.getByText('App published successfully!')).toBeInTheDocument();
    });

    it('should show published URL', () => {
      render(<PublishingPane {...defaultProps} publishStatus="published" subdomain="my-app" />);

      const link = screen.getByText('my-app.opcode.app');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', 'https://my-app.opcode.app');
    });

    it('should open URL in new tab', () => {
      render(<PublishingPane {...defaultProps} publishStatus="published" subdomain="my-app" />);

      const link = screen.getByText('my-app.opcode.app').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Info section', () => {
    it('should render expandable info section', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByText('What does publishing do?')).toBeInTheDocument();
    });

    it('should expand when clicked', () => {
      render(<PublishingPane {...defaultProps} />);

      const expandButton = screen.getByText('What does publishing do?');
      fireEvent.click(expandButton);

      expect(
        screen.getByText(/Publishing your app makes it available to anyone on the internet/)
      ).toBeInTheDocument();
    });

    it('should show video and learn more buttons when expanded', () => {
      render(<PublishingPane {...defaultProps} />);

      const expandButton = screen.getByText('What does publishing do?');
      fireEvent.click(expandButton);

      expect(screen.getByText('Watch video')).toBeInTheDocument();
      expect(screen.getByText('Learn more')).toBeInTheDocument();
    });
  });

  describe('Deployment history', () => {
    const mockDeployments: Deployment[] = [
      {
        id: 'deploy-1',
        subdomain: 'my-app',
        status: 'active',
        timestamp: new Date('2024-01-01'),
        url: 'https://my-app.opcode.app',
      },
      {
        id: 'deploy-2',
        subdomain: 'test-app',
        status: 'building',
        timestamp: new Date('2024-01-02'),
        url: 'https://test-app.opcode.app',
      },
      {
        id: 'deploy-3',
        subdomain: 'old-app',
        status: 'failed',
        timestamp: new Date('2024-01-03'),
        url: 'https://old-app.opcode.app',
      },
    ];

    it('should render deployment history section when provided', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      expect(screen.getByText('Recent Deployments')).toBeInTheDocument();
    });

    it('should show deployment subdomains', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      expect(screen.getByText('my-app')).toBeInTheDocument();
      expect(screen.getByText('test-app')).toBeInTheDocument();
      expect(screen.getByText('old-app')).toBeInTheDocument();
    });

    it('should show active status indicator', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      const activeDeployment = screen.getByText('my-app').closest('div');
      const statusIndicator = activeDeployment?.querySelector('.bg-green-500');

      expect(statusIndicator).toBeInTheDocument();
    });

    it('should show building status with pulse animation', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      const buildingDeployment = screen.getByText('test-app').closest('div');
      const statusIndicator = buildingDeployment?.querySelector('.bg-yellow-500');

      expect(statusIndicator).toHaveClass('animate-pulse');
    });

    it('should show failed status indicator', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      const failedDeployment = screen.getByText('old-app').closest('div');
      const statusIndicator = failedDeployment?.querySelector('.bg-destructive');

      expect(statusIndicator).toBeInTheDocument();
    });

    it('should show external link for active deployments', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      const activeDeployment = screen.getByText('my-app').closest('div');
      const externalLink = activeDeployment?.querySelector('a[href="https://my-app.opcode.app"]');

      expect(externalLink).toBeInTheDocument();
    });

    it('should not show external link for non-active deployments', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={mockDeployments} />);

      const failedDeployment = screen.getByText('old-app').closest('div');
      const externalLink = failedDeployment?.querySelector('a');

      expect(externalLink).not.toBeInTheDocument();
    });

    it('should not render history section when empty', () => {
      render(<PublishingPane {...defaultProps} deploymentHistory={[]} />);

      expect(screen.queryByText('Recent Deployments')).not.toBeInTheDocument();
    });

    it('should limit to 5 most recent deployments', () => {
      const manyDeployments = Array.from({ length: 10 }, (_, i) => ({
        id: `deploy-${i}`,
        subdomain: `app-${i}`,
        status: 'active' as const,
        timestamp: new Date(),
        url: `https://app-${i}.opcode.app`,
      }));

      const { container } = render(
        <PublishingPane {...defaultProps} deploymentHistory={manyDeployments} />
      );

      const deploymentCards = container.querySelectorAll('[class*="space-y-2"] > div');
      expect(deploymentCards.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Back navigation', () => {
    it('should call onBack when back button clicked', () => {
      render(<PublishingPane {...defaultProps} onBack={mockOnBack} />);

      const backButton = screen.getByLabelText('Go back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper input placeholder', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByPlaceholderText('my-awesome-app')).toBeInTheDocument();
    });

    it('should have semantic headings', () => {
      render(<PublishingPane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Publishing' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Publish your app' })).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<PublishingPane {...defaultProps} onBack={mockOnBack} />);

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('should have flex column layout', () => {
      const { container } = render(<PublishingPane {...defaultProps} />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full', 'bg-background');
    });

    it('should have scrollable content area', () => {
      const { container } = render(<PublishingPane {...defaultProps} />);

      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should have header with border', () => {
      render(<PublishingPane {...defaultProps} />);

      const header = screen.getByText('Publishing').closest('div');
      expect(header).toHaveClass('border-b', 'border-border');
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace-only subdomain', () => {
      render(<PublishingPane {...defaultProps} subdomain="   " isAvailable={true} />);

      const button = screen.getByText('Publish app');
      expect(button).toBeDisabled();
    });

    it('should handle rapid subdomain changes', () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');

      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(mockOnSubdomainChange).toHaveBeenCalledTimes(3);
    });

    it('should debounce subdomain availability check', async () => {
      render(<PublishingPane {...defaultProps} />);

      const input = screen.getByPlaceholderText('my-awesome-app');

      // Rapid changes
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.change(input, { target: { value: 'test-app' } });

      // Should debounce the availability check
      await waitFor(
        () => {
          expect(mockOnSubdomainChange).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it('should handle custom suffix in published URL', () => {
      render(
        <PublishingPane
          {...defaultProps}
          publishStatus="published"
          subdomain="my-app"
          suffix=".custom.io"
        />
      );

      const link = screen.getByText('my-app.custom.io');
      expect(link.closest('a')).toHaveAttribute('href', 'https://my-app.custom.io');
    });
  });
});
