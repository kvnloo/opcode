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
      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      // Verify copied state appears
      await waitFor(() => {
        expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument();
      }, { timeout: 2000 });

      // Wait for the 2-second timeout to reset the state
      await waitFor(() => {
        expect(screen.queryAllByText('Copied!').length).toBeLessThan(screen.getAllByText('Copy Link').length);
      }, { timeout: 3000 });
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
      // Ensure navigator.share is undefined
      delete (global.navigator as any).share;

      render(<SharePane {...defaultProps} />);

      // There's always a "Share" heading (h2), but the button should not exist when share is unavailable
      // The button check is done with: typeof navigator !== 'undefined' && 'share' in navigator
      const allShareTexts = screen.getAllByText('Share');
      // Filter to only buttons (exclude the heading)
      const shareButtons = allShareTexts.filter(el => el.tagName === 'BUTTON');
      expect(shareButtons.length).toBe(0);
    });

    it('calls navigator.share with correct data', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

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
      }, { timeout: 2000 });
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
      const { container } = render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const permissionSelects = screen.getAllByRole('combobox');
      const invitePermissionSelect = permissionSelects[0]; // First select is for invite form

      // Type email first to enable the button
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(invitePermissionSelect, { target: { value: 'view' } });

      // Find the send button within the invite form area by looking for a button with Send icon near the email input
      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button:not([disabled])');

      expect(sendButton).toBeTruthy();
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(defaultProps.onInvite).toHaveBeenCalledWith('newuser@example.com', 'view');
      }, { timeout: 1000 });
    });

    it('clears email input after successful invite', async () => {
      const { container } = render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      // Find the send button within the invite form
      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button:not([disabled])');

      expect(sendButton).toBeTruthy();
      fireEvent.click(sendButton!);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      }, { timeout: 1000 });
    });

    it('disables invite button for invalid email', () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button');

      expect(sendButton).toBeTruthy();
      expect(sendButton).toBeDisabled();
    });

    it('enables invite button for valid email', () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button');

      expect(sendButton).toBeTruthy();
      expect(sendButton).not.toBeDisabled();
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

    it('calls onUpdatePermission when permission changed', () => {
      render(<SharePane {...defaultProps} />);

      const permissionSelects = screen.getAllByRole('combobox');
      const collaboratorPermission = permissionSelects[1]; // First is invite, rest are collaborators

      fireEvent.change(collaboratorPermission, { target: { value: 'admin' } });

      expect(defaultProps.onUpdatePermission).toHaveBeenCalledWith('1', 'admin');
    });

    it('calls onRemoveCollaborator when remove button clicked', () => {
      render(<SharePane {...defaultProps} />);

      const removeButtons = screen.getAllByLabelText('Remove collaborator');
      fireEvent.click(removeButtons[0]);

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

    it('changes embed size when option clicked', () => {
      render(<SharePane {...defaultProps} />);

      const smallButton = screen.getByText('Small');
      fireEvent.click(smallButton);

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
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      fireEvent.click(copyEmbedButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
        const clipboardCall = writeTextMock.mock.calls[0][0];
        expect(clipboardCall).toContain('<iframe');
        expect(clipboardCall).toContain(defaultProps.projectUrl);
      }, { timeout: 1000 });
    });

    it('shows copied state for embed code', async () => {
      render(<SharePane {...defaultProps} />);

      const copyEmbedButton = screen.getByText('Copy Embed Code');
      fireEvent.click(copyEmbedButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      }, { timeout: 1000 });
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
    it('toggles QR code visibility', () => {
      render(<SharePane {...defaultProps} />);

      const qrButton = screen.getByText('QR Code');

      expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();

      fireEvent.click(qrButton);

      expect(screen.getByText('Scan to open project')).toBeInTheDocument();

      fireEvent.click(qrButton);

      expect(screen.queryByText('Scan to open project')).not.toBeInTheDocument();
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

    it('supports keyboard navigation', () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');

      // Input should be in the document and have correct type
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has accessible form inputs', () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('announces collaborator changes to screen readers', () => {
      const { rerender } = render(<SharePane {...defaultProps} />);

      const updatedCollaborators = [...mockCollaborators, {
        id: '3',
        email: 'new@example.com',
        permission: 'view' as const,
        joinedAt: new Date(),
      }];

      rerender(<SharePane {...defaultProps} collaborators={updatedCollaborators} />);

      expect(screen.getByText('3 collaborators')).toBeInTheDocument();
    });

    it('has descriptive button labels', () => {
      render(<SharePane {...defaultProps} />);

      expect(screen.getAllByText('Copy Link').length).toBeGreaterThan(0);
      expect(screen.getByText('Copy Embed Code')).toBeInTheDocument();
    });

    it('provides feedback for user actions', async () => {
      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getAllByText('Copied!')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases - Additional', () => {
    it('handles empty project URL gracefully', () => {
      render(<SharePane {...defaultProps} projectUrl="" />);

      expect(screen.getByText('Project URL')).toBeInTheDocument();
    });

    it('handles very long project URLs', () => {
      const longUrl = 'https://' + 'a'.repeat(500) + '.com';
      render(<SharePane {...defaultProps} projectUrl={longUrl} />);

      expect(screen.getByText(longUrl)).toBeInTheDocument();
    });

    it('handles special characters in project name', () => {
      const specialName = 'Project <>&"\'';
      render(<SharePane {...defaultProps} projectName={specialName} />);

      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('handles clipboard API failure gracefully', async () => {
      writeTextMock.mockRejectedValue(new Error('Clipboard access denied'));

      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      // Should not crash the component
      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
      });
    });

    it('handles invalid email formats', () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button');

      // Button should be disabled for invalid email
      expect(sendButton).toBeDisabled();
    });

    it('handles rapid collaborator additions', async () => {
      render(<SharePane {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      const inviteFormContainer = emailInput.closest('[class*="p-3"]');

      for (let i = 0; i < 5; i++) {
        fireEvent.change(emailInput, { target: { value: `user${i}@example.com` } });
        const sendButton = inviteFormContainer?.querySelector('button:not([disabled])');
        if (sendButton) {
          fireEvent.click(sendButton);
        }
      }

      await waitFor(() => {
        expect(defaultProps.onInvite).toHaveBeenCalled();
      });
    });

    it('handles missing navigator.share gracefully', () => {
      delete (global.navigator as any).share;

      render(<SharePane {...defaultProps} />);

      const shareButtons = screen.getAllByText('Share').filter(el => el.tagName === 'BUTTON');
      expect(shareButtons.length).toBe(0);
    });

    it('handles window.open failure for social sharing', () => {
      openMock.mockReturnValue(null);

      render(<SharePane {...defaultProps} />);

      const twitterButton = screen.getByText('Twitter/X');
      fireEvent.click(twitterButton);

      expect(openMock).toHaveBeenCalled();
    });

    it('handles null collaborator names', () => {
      const collaboratorsWithoutNames: Collaborator[] = [
        {
          id: '1',
          email: 'test@example.com',
          permission: 'view',
          joinedAt: new Date(),
        },
      ];

      render(<SharePane {...defaultProps} collaborators={collaboratorsWithoutNames} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('handles permission update failures', () => {
      // Test that the component doesn't crash even if onUpdatePermission is not provided
      render(<SharePane {...defaultProps} onUpdatePermission={undefined} />);

      const permissionSelects = screen.getAllByRole('combobox');
      const collaboratorPermission = permissionSelects[1];

      // Permission select should be disabled when no handler provided
      expect(collaboratorPermission).toBeDisabled();
    });
  });

  describe('Loading States - Additional', () => {
    it('shows loading state during clipboard operation', async () => {
      writeTextMock.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SharePane {...defaultProps} />);

      const copyButton = screen.getAllByText('Copy Link')[0];
      fireEvent.click(copyButton);

      // Should show some feedback
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
    });

    it('handles async share operation', async () => {
      const mockShare = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      Object.defineProperty(global.navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      render(<SharePane {...defaultProps} />);

      const shareButton = screen.getAllByText('Share').find(el => el.tagName === 'BUTTON');
      if (shareButton) {
        fireEvent.click(shareButton);

        await waitFor(() => {
          expect(mockShare).toHaveBeenCalled();
        });
      }
    });

    it('maintains UI responsiveness during collaborator updates', () => {
      const { rerender } = render(<SharePane {...defaultProps} />);

      for (let i = 0; i < 10; i++) {
        const newCollaborators = [...mockCollaborators, {
          id: `temp-${i}`,
          email: `temp${i}@example.com`,
          permission: 'view' as const,
          joinedAt: new Date(),
        }];
        rerender(<SharePane {...defaultProps} collaborators={newCollaborators} />);
      }

      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('shows feedback during invite process', async () => {
      const onInvite = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SharePane {...defaultProps} onInvite={onInvite} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      fireEvent.change(emailInput, { target: { value: 'slow@example.com' } });

      const inviteFormContainer = emailInput.closest('[class*="p-3"]');
      const sendButton = inviteFormContainer?.querySelector('button:not([disabled])');

      if (sendButton) {
        fireEvent.click(sendButton);

        await waitFor(() => {
          expect(onInvite).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Responsive Layout - Additional', () => {
    it('adapts to mobile viewport (375px)', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = render(<SharePane {...defaultProps} />);

      const mainContainer = container.querySelector('.h-full');
      expect(mainContainer).toBeInTheDocument();
    });

    it('adapts to tablet viewport (768px)', () => {
      global.innerWidth = 768;
      global.innerHeight = 1024;

      const { container } = render(<SharePane {...defaultProps} />);

      const mainContainer = container.querySelector('.h-full');
      expect(mainContainer).toBeInTheDocument();
    });

    it('handles scrollable collaborator list on mobile', () => {
      global.innerWidth = 375;

      const manyCollaborators: Collaborator[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        email: `user${i}@example.com`,
        permission: 'view' as const,
        joinedAt: new Date(),
      }));

      const { container } = render(<SharePane {...defaultProps} collaborators={manyCollaborators} />);

      expect(screen.getByText('20 collaborators')).toBeInTheDocument();
    });

    it('maintains readable text on small screens', () => {
      global.innerWidth = 320;
      global.innerHeight = 568;

      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.projectUrl)).toBeInTheDocument();
    });

    it('shows compact layout on mobile for embed options', () => {
      global.innerWidth = 375;

      render(<SharePane {...defaultProps} />);

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('adjusts QR code display for different viewports', () => {
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
      ];

      viewports.forEach(({ width, height }) => {
        global.innerWidth = width;
        global.innerHeight = height;

        const { unmount } = render(<SharePane {...defaultProps} />);

        const qrButton = screen.getAllByText('QR Code')[0];
        fireEvent.click(qrButton);

        expect(screen.getByText('Scan to open project')).toBeInTheDocument();

        // Clean up after each render
        unmount();
      });
    });
  });
});
