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
      className="h-full flex flex-col mobile-safe-area-inset"
      style={{
        backgroundColor: 'var(--mobile-bg-primary)'
      }}
    >
      <ScrollArea className="flex-1 mobile-smooth-scroll">
        <div style={{ padding: 'var(--mobile-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--mobile-space-6)' }}>
          {/* Profile Card */}
          <ProfileCard user={user} />

          {/* Upgrade Banner */}
          {!user.isPro && (
            <button
              className="mobile-tap-highlight mobile-active-scale"
              style={{
                width: '100%',
                height: 'var(--mobile-button-height-lg)',
                padding: 'var(--mobile-button-padding-lg)',
                backgroundColor: 'var(--mobile-accent-primary)',
                color: 'var(--mobile-text-primary)',
                borderRadius: 'var(--mobile-button-radius)',
                fontWeight: 'var(--mobile-font-weight-semibold)',
                fontSize: 'var(--mobile-font-size-md)',
                fontFamily: 'var(--mobile-font-sans)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--mobile-space-2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color var(--mobile-transition-base) var(--mobile-transition-ease)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--mobile-accent-primary)'}
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
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Join Claudia Core</span>
            </button>
          )}

          {/* Settings List */}
          <SettingsList />
        </div>
      </ScrollArea>
    </div>
  );
}
