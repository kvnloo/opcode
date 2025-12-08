interface User {
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  isPro?: boolean;
  bio?: string | null;
}

interface ProfileCardProps {
  user: User;
  onEdit?: () => void;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'var(--mobile-space-8)', // 32px top padding per Replit
        paddingBottom: 'var(--mobile-space-6)',
        paddingLeft: 'var(--mobile-space-4)',
        paddingRight: 'var(--mobile-space-4)',
        gap: 'var(--mobile-space-2)', // 8px between elements
      }}
    >
      {/* Avatar - 96x96px, full circle */}
      <div
        style={{
          width: 'var(--mobile-avatar-xl)', // 96px
          height: 'var(--mobile-avatar-xl)', // 96px
          borderRadius: 'var(--mobile-radius-full)',
          backgroundColor: 'var(--mobile-bg-tertiary)', // #2D3748 per Replit
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--mobile-text-primary)',
          fontSize: 'var(--mobile-font-size-5xl)', // 32px for initials
          fontWeight: 'var(--mobile-font-weight-medium)', // 500
          fontFamily: 'var(--mobile-font-sans)',
          flexShrink: 0,
          marginBottom: 'var(--mobile-space-4)', // 16px margin below avatar
        }}
        aria-label={`User avatar, ${initials}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 'var(--mobile-radius-full)',
              objectFit: 'cover',
            }}
          />
        ) : (
          initials
        )}
      </div>

      {/* User Info - Centered with exact spacing */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0, // Manual spacing per Replit spec
          width: '100%',
        }}
      >
        {/* Username - 20px, medium weight */}
        <h2
          style={{
            fontSize: 'var(--mobile-font-size-3xl)', // 20px
            fontWeight: 'var(--mobile-font-weight-medium)', // 500
            fontFamily: 'var(--mobile-font-sans)',
            color: 'var(--mobile-text-primary)',
            margin: 0,
            marginBottom: 'var(--mobile-space-2)', // 8px below
            textAlign: 'center',
          }}
        >
          {user.username}
        </h2>

        {/* Handle - 14px, tertiary color */}
        <p
          style={{
            fontSize: 'var(--mobile-font-size-md)', // 14px
            fontFamily: 'var(--mobile-font-sans)',
            color: 'var(--mobile-text-tertiary)', // #6E7681
            margin: 0,
            marginBottom: 'var(--mobile-space-1)', // 4px below
            textAlign: 'center',
          }}
        >
          @{user.username}
        </p>

        {/* Email - 14px with icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--mobile-space-2)', // 8px gap
            marginBottom: 'var(--mobile-space-1)', // 4px below
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--mobile-text-tertiary)' }}
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <p
            style={{
              fontSize: 'var(--mobile-font-size-md)', // 14px
              fontFamily: 'var(--mobile-font-sans)',
              color: 'var(--mobile-text-tertiary)',
              margin: 0,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {user.email}
          </p>
        </div>

        {/* Bio placeholder - 14px, muted, 24px margin below */}
        {!user.bio && (
          <p
            style={{
              fontSize: 'var(--mobile-font-size-md)', // 14px per Replit
              fontFamily: 'var(--mobile-font-sans)',
              color: 'var(--mobile-text-tertiary)', // #6E7681
              margin: 0,
              marginTop: 0,
              marginBottom: 'var(--mobile-space-6)', // 24px below per Replit
              textAlign: 'center',
            }}
          >
            You don't have a bio yet...
          </p>
        )}
      </div>
    </div>
  );
}
