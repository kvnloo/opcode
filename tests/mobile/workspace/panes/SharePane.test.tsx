import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SharePane, SharePaneProps, Collaborator } from '@/components/mobile/workspace/panes/SharePane';
import userEvent from '@testing-library/user-event';

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

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      share: undefined,
    });
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

      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('renders invite collaborators section', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Invite collaborators')).toBeInTheDocument();
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
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.projectUrl);
      expect(defaultProps.onCopyLink).toHaveBeenCalled();
    });

    it('shows copied state after clicking', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument();
      });
    });

    it('resets copied state after 2 seconds', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      await user.click(copyButton);

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
      Object.assign(navigator, { share: vi.fn() });

      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('does not render share button when navigator.share is unavailable', () => {
      Object.assign(navigator, { share: undefined });

      render(<SharePane {...defaultProps} />);

      const shareButtons = screen.queryAllByText('Share');
      // Should only be the "Share on social" heading, not a button
      expect(shareButtons.length).toBe(1);
    });

    it('calls navigator.share with correct data', async () => {
      const user = userEvent.setup();
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share: mockShare });

      render(<SharePane {...defaultProps} />);

      const shareButton = screen.getByText('Share');
      await user.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: defaultProps.projectName,
        text: `Check out my project: ${defaultProps.projectName}`,
        url: defaultProps.projectUrl,
      });
      expect(defaultProps.onShare).toHaveBeenCalledWith('system');
    });
  });

  describe('Collaborator Invitations', () => {
    it('renders email input', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    });

    it('renders permission selector', () => {
      render(<SharePane {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('calls onInvite with email and permission', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const permissionSelect = screen.getByRole('combobox');
      const inviteButton = screen.getByRole('button', { name: '' }); // Send icon button

      await user.type(emailInput, 'newuser@example.com');
      await user.selectOptions(permissionSelect, 'view');
      await user.click(inviteButton);

      expect(defaultProps.onInvite).toHaveBeenCalledWith('newuser@example.com', 'view');
    });

    it('clears email input after successful invite', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com') as HTMLInputElement;
      const inviteButton = screen.getByRole('button', { name: '' });

      await user.type(emailInput, 'user@example.com');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });

    it('disables invite button for invalid email', () => {
      render(<SharePane {...defaultProps} />);

      const inviteButton = screen.getByRole('button', { name: '' });
      expect(inviteButton).toBeDisabled();
    });

    it('enables invite button for valid email', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const inviteButton = screen.getByRole('button', { name: '' });

      await user.type(emailInput, 'valid@example.com');

      await waitFor(() => {
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
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const permissionSelects = screen.getAllByRole('combobox');
      const collaboratorPermission = permissionSelects[1]; // First is invite, rest are collaborators

      await user.selectOptions(collaboratorPermission, 'admin');

      expect(defaultProps.onUpdatePermission).toHaveBeenCalledWith('1', 'admin');
    });

    it('calls onRemoveCollaborator when remove button clicked', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const removeButtons = screen.getAllByLabelText('Remove collaborator');
      await user.click(removeButtons[0]);

      expect(defaultProps.onRemoveCollaborator).toHaveBeenCalledWith('1');
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
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const smallButton = screen.getByText('Small');
      await user.click(smallButton);

      // Check that dimensions updated
      expect(screen.getByText('400 × 300')).toBeInTheDocument();
    });

    it('generates correct embed code for medium size', () => {
      render(<SharePane {...defaultProps} />);

      const embedCode = screen.getByText(/iframe src=/);
      expect(embedCode.textContent).toContain('width="800"');
      expect(embedCode.textContent).toContain('height="600"');
    });

    it('copies embed code to clipboard', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      await user.click(copyEmbedButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const clipboardCall = (navigator.clipboard.writeText as any).mock.calls[0][0];
      expect(clipboardCall).toContain('<iframe');
      expect(clipboardCall).toContain(defaultProps.projectUrl);
    });

    it('shows copied state for embed code', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      await user.click(copyEmbedButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Social Sharing', () => {
    it('opens Twitter share dialog', async () => {
      const user = userEvent.setup();
      const windowOpen = vi.fn();
      (global as any).window = { open: windowOpen };

      render(<SharePane {...defaultProps} />);

      const twitterButton = screen.getByText('Twitter/X');
      await user.click(twitterButton);

      expect(windowOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      );
      expect(defaultProps.onShare).toHaveBeenCalledWith('twitter');
    });

    it('opens LinkedIn share dialog', async () => {
      const user = userEvent.setup();
      const windowOpen = vi.fn();
      (global as any).window = { open: windowOpen };

      render(<SharePane {...defaultProps} />);

      const linkedinButton = screen.getByText('LinkedIn');
      await user.click(linkedinButton);

      expect(windowOpen).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing'),
        '_blank',
        'width=600,height=400'
      );
      expect(defaultProps.onShare).toHaveBeenCalledWith('linkedin');
    });
  });

  describe('QR Code', () => {
    it('toggles QR code visibility', async () => {
      const user = userEvent.setup();
      render(<SharePane {...defaultProps} />);

      const qrButton = screen.getByText('QR Code');

      expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();

      await user.click(qrButton);

      await waitFor(() => {
        expect(screen.getByText('Scan to open project')).toBeInTheDocument();
      });

      await user.click(qrButton);

      await waitFor(() => {
        expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('handles empty collaborators list', () => {
      render(<SharePane {...defaultProps} collaborators={[]} />);

      expect(screen.queryByText(/collaborator/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByLabelText('Remove collaborator')).toBeInTheDocument();
    });

    it('has semantic structure', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Share' })).toBeInTheDocument();
    });
  });
});
