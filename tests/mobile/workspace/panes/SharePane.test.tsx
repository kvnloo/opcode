import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SharePane, SharePaneProps, Collaborator } from '@/components/mobile/workspace/panes/SharePane';

// Mock useHaptics hook
vi.mock('@/hooks/mobile/useHaptics', () => ({
  useHaptics: () => ({
    trigger: vi.fn(),
    isSupported: true,
  }),
}));

describe('SharePane', () => {
  const mockCollaborators: Collaborator[] = [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      permission: 'edit',
      joinedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      email: 'jane@example.com',
      permission: 'view',
      joinedAt: new Date('2024-01-15'),
    },
  ];

  const defaultProps: SharePaneProps = {
    projectUrl: 'https://my-app.opcode.app',
    projectName: 'My Awesome App',
    collaborators: mockCollaborators,
    onInvite: vi.fn(),
    onShare: vi.fn(),
    onCopyLink: vi.fn(),
    onRemoveCollaborator: vi.fn(),
    onUpdatePermission: vi.fn(),
  };

  let writeTextMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh mock functions
    writeTextMock = vi.fn().mockResolvedValue(undefined);

    // Setup clipboard mock with proper vi.fn() mocks
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
        readText: vi.fn().mockResolvedValue(''),
      },
      writable: true,
      configurable: true,
    });

    // Remove share so we can test when it's undefined
    if ('share' in navigator) {
      delete (navigator as any).share;
    }

    // Setup window.open mock
    openMock = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(openMock);
  });

  describe('Rendering', () => {
    it('renders header', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('displays project URL', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Project URL')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.projectUrl)).toBeInTheDocument();
    });

    it('renders copy link button', () => {
      render(<SharePane {...defaultProps} />);

      // There are two Copy Link buttons (one in main section, one in social)
      const copyButtons = screen.getAllByText('Copy Link');
      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders invite collaborators section', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText(/invite collaborators/i)).toBeInTheDocument();
    });

    it('renders embed section', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Embed')).toBeInTheDocument();
    });

    it('renders social sharing section', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Share on social')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  describe('Copy Link', () => {
    it('copies URL to clipboard when clicked', async () => {
      render(<SharePane {...defaultProps} />);

      // Get the first Copy Link button (in Share your app section)
      const copyButtons = screen.getAllByText('Copy Link');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(defaultProps.projectUrl);
        expect(defaultProps.onCopyLink).toHaveBeenCalled();
      });
    });

    it('shows copied state after clicking', async () => {
      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument();
      });
    });

    it('resets copied state after 2 seconds', async () => {
      vi.useFakeTimers();

      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument();

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('System Share', () => {
    it('renders share button when navigator.share is available', () => {
      (global.navigator as any).share = vi.fn().mockResolvedValue(undefined);

      render(<SharePane {...defaultProps} />);

      // Find the Share button (not the heading)
      const shareButton = screen.getAllByText('Share').find(el => el.tagName === 'BUTTON');
      expect(shareButton).toBeInTheDocument();
    });

    it('does not render share button when navigator.share is unavailable', () => {
      (global.navigator as any).share = undefined;

      render(<SharePane {...defaultProps} />);

      // Find buttons with "Share" text
      const shareButtons = screen.getAllByText('Share').filter(el => el.tagName === 'BUTTON');
      // Should not find the system share button
      expect(shareButtons.length).toBe(0);
    });

    it('calls navigator.share with correct data', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      (global.navigator as any).share = mockShare;

      render(<SharePane {...defaultProps} />);

      const shareButton = screen.getAllByText('Share').find(el => el.tagName === 'BUTTON');
      expect(shareButton).toBeDefined();
      fireEvent.click(shareButton!);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: defaultProps.projectName,
          text: `Check out my project: ${defaultProps.projectName}`,
          url: defaultProps.projectUrl,
        });
        expect(defaultProps.onShare).toHaveBeenCalledWith('system');
      });
    });
  });

  describe('Collaborator Invitations', () => {
    it('renders email input', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    });

    it('renders permission selector', () => {
      render(<SharePane {...defaultProps} />);

      // There are multiple comboboxes (one for invite form, others for collaborators)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
      expect(selects[0]).toBeInTheDocument();
    });

    it('calls onInvite with email and permission', async () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const permissionSelects = screen.getAllByRole('combobox');
      const invitePermissionSelect = permissionSelects[0]; // First select is for invite form
      const inviteButtons = document.querySelectorAll('button');
      // Find the Send button (icon button in invite form)
      const inviteButton = Array.from(inviteButtons).find(btn =>
        btn.querySelector('svg') && btn.parentElement?.querySelector('input[type="email"]')
      );

      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(invitePermissionSelect, { target: { value: 'view' } });
      fireEvent.click(inviteButton!);

      await waitFor(() => {
        expect(defaultProps.onInvite).toHaveBeenCalledWith('newuser@example.com', 'view');
      });
    });

    it('clears email input after successful invite', async () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com') as HTMLInputElement;
      const inviteButtons = document.querySelectorAll('button');
      const inviteButton = Array.from(inviteButtons).find(btn =>
        btn.querySelector('svg') && btn.parentElement?.querySelector('input[type="email"]')
      );

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(inviteButton!);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });

    it('disables invite button for invalid email', () => {
      render(<SharePane {...defaultProps} />);

      const inviteButtons = document.querySelectorAll('button');
      const inviteButton = Array.from(inviteButtons).find(btn =>
        btn.querySelector('svg') && btn.parentElement?.querySelector('input[type="email"]')
      );
      expect(inviteButton).toBeDisabled();
    });

    it('enables invite button for valid email', async () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

      await waitFor(() => {
        const inviteButtons = document.querySelectorAll('button');
        const inviteButton = Array.from(inviteButtons).find(btn =>
          btn.querySelector('svg') && btn.parentElement?.querySelector('input[type="email"]')
        );
        expect(inviteButton).not.toBeDisabled();
      });
    });
  });

  describe('Collaborator List', () => {
    it('displays all collaborators', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('shows collaborator count', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('2 collaborators')).toBeInTheDocument();
    });

    it('shows singular collaborator text', () => {
      render(<SharePane {...defaultProps} collaborators={[mockCollaborators[0]]} />);

      expect(screen.getByText('1 collaborator')).toBeInTheDocument();
    });

    it('displays avatar with initial', () => {
      render(<SharePane {...defaultProps} />);

      const avatars = screen.getAllByText('J');
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('calls onUpdatePermission when permission changed', async () => {
      render(<SharePane {...defaultProps} />);

      const permissionSelects = screen.getAllByRole('combobox');
      const collaboratorPermission = permissionSelects[1]; // First is invite, rest are collaborators

      fireEvent.change(collaboratorPermission, { target: { value: 'admin' } });

      await waitFor(() => {
        expect(defaultProps.onUpdatePermission).toHaveBeenCalledWith('1', 'admin');
      });
    });

    it('calls onRemoveCollaborator when remove button clicked', async () => {
      render(<SharePane {...defaultProps} />);

      const removeButtons = screen.getAllByLabelText('Remove collaborator');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(defaultProps.onRemoveCollaborator).toHaveBeenCalledWith('1');
      });
    });

    it('does not show remove button when handler not provided', () => {
      render(<SharePane {...defaultProps} onRemoveCollaborator={undefined} />);

      expect(screen.queryByLabelText('Remove collaborator')).not.toBeInTheDocument();
    });

    it('disables permission select when handler not provided', () => {
      render(<SharePane {...defaultProps} onUpdatePermission={undefined} />);

      const permissionSelects = screen.getAllByRole('combobox');
      const collaboratorPermission = permissionSelects[1];

      expect(collaboratorPermission).toBeDisabled();
    });
  });

  describe('Embed Code', () => {
    it('renders embed size options', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('changes embed size when option clicked', async () => {
      render(<SharePane {...defaultProps} />);

      const smallButton = screen.getByText('Small');
      fireEvent.click(smallButton);

      // Check that dimensions updated
      await waitFor(() => {
        expect(screen.getByText('400 × 300')).toBeInTheDocument();
      });
    });

    it('generates correct embed code for medium size', () => {
      render(<SharePane {...defaultProps} />);

      const embedCode = screen.getByText(/iframe src=/);
      expect(embedCode.textContent).toContain('width="800"');
      expect(embedCode.textContent).toContain('height="600"');
    });

    it('copies embed code to clipboard', async () => {
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      fireEvent.click(copyEmbedButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
      const clipboardCall = writeTextMock.mock.calls[0][0];
      expect(clipboardCall).toContain('<iframe');
      expect(clipboardCall).toContain(defaultProps.projectUrl);
    });

    it('shows copied state for embed code', async () => {
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      fireEvent.click(copyEmbedButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Social Sharing', () => {
    it('opens Twitter share dialog', () => {
      render(<SharePane {...defaultProps} />);

      const twitterButton = screen.getByText('Twitter/X');
      fireEvent.click(twitterButton);

      expect(openMock).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      );
      expect(defaultProps.onShare).toHaveBeenCalledWith('twitter');
    });

    it('opens LinkedIn share dialog', () => {
      render(<SharePane {...defaultProps} />);

      const linkedinButton = screen.getByText('LinkedIn');
      fireEvent.click(linkedinButton);

      expect(openMock).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing'),
        '_blank',
        'width=600,height=400'
      );
      expect(defaultProps.onShare).toHaveBeenCalledWith('linkedin');
    });
  });

  describe('QR Code', () => {
    it('toggles QR code visibility', async () => {
      render(<SharePane {...defaultProps} />);

      const qrButton = screen.getByText('QR Code');

      expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();

      fireEvent.click(qrButton);

      await waitFor(() => {
        expect(screen.getByText('Scan to open project')).toBeInTheDocument();
      });

      fireEvent.click(qrButton);

      await waitFor(() => {
        expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('handles empty collaborators list', () => {
      render(<SharePane {...defaultProps} collaborators={[]} />);

      // When no collaborators, the count text should not appear
      // (The "Invite collaborators" header still shows)
      expect(screen.queryByText(/\d+ collaborator/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<SharePane {...defaultProps} />);

      // There are multiple collaborators, so there are multiple remove buttons
      const removeButtons = screen.getAllByLabelText('Remove collaborator');
      expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('has semantic structure', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Share' })).toBeInTheDocument();
    });
  });
});
