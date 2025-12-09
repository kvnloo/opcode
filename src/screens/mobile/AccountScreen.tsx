import { ProfileCard } from '@/components/mobile/account/ProfileCard';
import { SettingsList } from '@/components/mobile/account/SettingsList';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AccountScreen() {
  // TODO: Get actual user data from auth context
  const user = {
    name: 'User',
    username: 'user',
    email: 'user@example.com',
    avatar: null,
    isPro: false,
    bio: null, // Bio can be added by user
  };

  return (
    <div
      data-testid="screen-account"
      className="h-full flex flex-col mobile-safe-area-inset pb-20"
      style={{
        backgroundColor: 'var(--mobile-bg-primary)'
      }}
    >
      <ScrollArea className="flex-1 mobile-smooth-scroll">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Profile Card - No outer padding, handled internally */}
          <ProfileCard user={user} />

          {/* Upgrade Banner - 16px horizontal margin, 24px bottom margin per Replit */}
          {!user.isPro && (
            <button
              className="mobile-tap-highlight mobile-active-scale"
              style={{
                width: 'calc(100% - 32px)', // Full width minus 32px padding (16px each side)
                height: 'var(--mobile-button-height-lg)', // 48px
                padding: 'var(--mobile-button-padding-lg)', // 12px 24px
                marginLeft: 'var(--mobile-space-4)', // 16px
                marginRight: 'var(--mobile-space-4)', // 16px
                marginBottom: 'var(--mobile-space-6)', // 24px
                backgroundColor: 'var(--mobile-accent-primary)', // #0969DA
                color: 'var(--mobile-text-primary)',
                borderRadius: 'var(--mobile-button-radius)', // 8px
                fontWeight: 'var(--mobile-font-weight-medium)', // 500
                fontSize: 'var(--mobile-font-size-xl)', // 16px
                fontFamily: 'var(--mobile-font-sans)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--mobile-space-2)', // 8px
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color var(--mobile-transition-fast) var(--mobile-transition-ease)', // 150ms
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary)'}
              aria-label="Join Claudia Core"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Join Claudia Core</span>
            </button>
          )}

          {/* Settings List - No outer padding */}
          <SettingsList />
        </div>
      </ScrollArea>
    </div>
  );
}
