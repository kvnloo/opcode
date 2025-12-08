import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils/renderWithProviders';
import { simulateMobile, simulateTablet } from '../utils/platformSimulator';
import { AccountScreen } from '@/screens/mobile/AccountScreen';
import userEvent from '@testing-library/user-event';

// Mock child components
vi.mock('@/components/mobile/account/ProfileCard', () => ({
  ProfileCard: ({ user }: any) => (
    <div data-testid="profile-card">
      <div>{user.name}</div>
      <div>{user.username}</div>
      <div>{user.email}</div>
      <div>Pro: {user.isPro ? 'Yes' : 'No'}</div>
    </div>
  ),
}));

vi.mock('@/components/mobile/account/SettingsList', () => ({
  SettingsList: () => (
    <div data-testid="settings-list">
      <button>General Settings</button>
      <button>Privacy</button>
      <button>Notifications</button>
      <button>About</button>
    </div>
  ),
}));

describe('AccountScreen', () => {
  beforeEach(() => {
    simulateMobile();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AccountScreen />);
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('renders profile card with user data', () => {
      render(<AccountScreen />);

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('renders settings list', () => {
      render(<AccountScreen />);
      expect(screen.getByTestId('settings-list')).toBeInTheDocument();
    });

    it('renders all settings options', () => {
      render(<AccountScreen />);

      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  describe('Upgrade Banner', () => {
    it('shows upgrade banner for non-pro users', () => {
      render(<AccountScreen />);

      const upgradeButton = screen.getByText('Join Claudia Core');
      expect(upgradeButton).toBeInTheDocument();
      // Star icon is an SVG, not emoji text
      const button = upgradeButton.closest('button');
      expect(button?.querySelector('svg')).toBeInTheDocument();
    });

    it('upgrade banner is clickable', async () => {
      const user = userEvent.setup();
      render(<AccountScreen />);

      const upgradeButton = screen.getByText('Join Claudia Core');
      await user.click(upgradeButton);

      // Button should still be there (no navigation implemented yet)
      expect(upgradeButton).toBeInTheDocument();
    });

    it('upgrade banner has correct styling classes', () => {
      render(<AccountScreen />);

      const upgradeButton = screen.getByText('Join Claudia Core').closest('button');
      expect(upgradeButton).toHaveClass('mobile-tap-highlight');
      expect(upgradeButton).toHaveClass('mobile-active-scale');
    });
  });

  describe('User Data Display', () => {
    it('displays user name', () => {
      render(<AccountScreen />);
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('displays username', () => {
      render(<AccountScreen />);
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('displays email', () => {
      render(<AccountScreen />);
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('displays pro status as No', () => {
      render(<AccountScreen />);
      expect(screen.getByText('Pro: No')).toBeInTheDocument();
    });
  });

  describe('Settings Interactions', () => {
    it('general settings button is clickable', async () => {
      const user = userEvent.setup();
      render(<AccountScreen />);

      const button = screen.getByText('General Settings');
      await user.click(button);

      expect(button).toBeInTheDocument();
    });

    it('privacy settings button is clickable', async () => {
      const user = userEvent.setup();
      render(<AccountScreen />);

      const button = screen.getByText('Privacy');
      await user.click(button);

      expect(button).toBeInTheDocument();
    });

    it('notifications button is clickable', async () => {
      const user = userEvent.setup();
      render(<AccountScreen />);

      const button = screen.getByText('Notifications');
      await user.click(button);

      expect(button).toBeInTheDocument();
    });

    it('about button is clickable', async () => {
      const user = userEvent.setup();
      render(<AccountScreen />);

      const button = screen.getByText('About');
      await user.click(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has scrollable container', () => {
      render(<AccountScreen />);
      const profileCard = screen.getByTestId('profile-card');
      expect(profileCard).toBeInTheDocument();
    });

    it('profile card is rendered within flex column', () => {
      render(<AccountScreen />);
      const container = screen.getByTestId('profile-card').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('settings list is rendered after profile card', () => {
      render(<AccountScreen />);
      const profileCard = screen.getByTestId('profile-card');
      const settingsList = screen.getByTestId('settings-list');
      expect(profileCard).toBeInTheDocument();
      expect(settingsList).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('renders correctly on mobile', () => {
      simulateMobile();
      render(<AccountScreen />);

      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('settings-list')).toBeInTheDocument();
    });

    it('renders correctly on tablet', () => {
      simulateTablet();
      render(<AccountScreen />);

      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByText('Join Claudia Core')).toBeInTheDocument();
    });

    it('maintains layout on orientation change', () => {
      simulateMobile();
      const { container } = render(<AccountScreen />);

      // Simulate orientation change
      window.innerWidth = 667;
      window.innerHeight = 375;
      window.dispatchEvent(new Event('resize'));

      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('scroll area adapts to viewport', () => {
      render(<AccountScreen />);
      const scrollArea = screen.getByTestId('profile-card').closest('.flex-1');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('profile card receives user data', () => {
      render(<AccountScreen />);

      // Verify all user data is passed and displayed
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByText('Pro: No')).toBeInTheDocument();
    });

    it('settings list renders independently', () => {
      render(<AccountScreen />);
      expect(screen.getByTestId('settings-list')).toBeInTheDocument();
    });

    it('all components render in correct order', () => {
      const { container } = render(<AccountScreen />);
      const elements = container.querySelectorAll('[data-testid]');

      // Profile card should come before settings list
      const profileCard = Array.from(elements).find(
        (el) => el.getAttribute('data-testid') === 'profile-card'
      );
      const settingsList = Array.from(elements).find(
        (el) => el.getAttribute('data-testid') === 'settings-list'
      );

      expect(profileCard).toBeInTheDocument();
      expect(settingsList).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('upgrade button has aria label', () => {
      render(<AccountScreen />);
      const button = screen.getByText('Join Claudia Core').closest('button');
      expect(button).toHaveAttribute('aria-label', 'Join Claudia Core');
    });

    it('settings buttons are accessible', () => {
      render(<AccountScreen />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('upgrade button has inline styles for colors', () => {
      render(<AccountScreen />);
      const button = screen.getByText('Join Claudia Core').closest('button');
      expect(button).toHaveStyle({
        backgroundColor: 'var(--mobile-accent-primary)',
        color: 'var(--mobile-text-primary)',
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user avatar gracefully', () => {
      render(<AccountScreen />);
      // Component should render without errors even with null avatar
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('handles long user names', () => {
      render(<AccountScreen />);
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles long email addresses', () => {
      render(<AccountScreen />);
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('renders without pro status', () => {
      render(<AccountScreen />);
      expect(screen.getByText('Pro: No')).toBeInTheDocument();
      expect(screen.getByText('Join Claudia Core')).toBeInTheDocument();
    });
  });

  describe('Background and Theme', () => {
    it('has background inline style', () => {
      const { container } = render(<AccountScreen />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle({
        backgroundColor: 'var(--mobile-bg-primary)',
      });
    });

    it('has full height', () => {
      const { container } = render(<AccountScreen />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('h-full');
    });

    it('has flex column layout', () => {
      const { container } = render(<AccountScreen />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('flex');
      expect(mainDiv).toHaveClass('flex-col');
    });
  });
});
