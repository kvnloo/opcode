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
        padding: 'var(--mobile-space-6)',
        gap: 'var(--mobile-space-4)',
      }}
    >
      {/* Avatar - Large, centered */}
      <div
        style={{
          width: 'var(--mobile-avatar-xl)',
          height: 'var(--mobile-avatar-xl)',
          borderRadius: 'var(--mobile-radius-full)',
          backgroundColor: 'var(--mobile-accent-agent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--mobile-text-primary)',
          fontSize: 'var(--mobile-font-size-4xl)',
          fontWeight: 'var(--mobile-font-weight-bold)',
          fontFamily: 'var(--mobile-font-sans)',
          flexShrink: 0,
        }}
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

      {/* User Info - Centered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--mobile-space-1)',
          width: '100%',
        }}
      >
        {/* Name */}
        <h2
          style={{
            fontSize: 'var(--mobile-font-size-3xl)',
            fontWeight: 'var(--mobile-font-weight-bold)',
            fontFamily: 'var(--mobile-font-sans)',
            color: 'var(--mobile-text-primary)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {user.name}
        </h2>

        {/* Username (handle) */}
        <p
          style={{
            fontSize: 'var(--mobile-font-size-md)',
            fontFamily: 'var(--mobile-font-sans)',
            color: 'var(--mobile-text-secondary)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          @{user.username}
        </p>

        {/* Email */}
        <p
          style={{
            fontSize: 'var(--mobile-font-size-sm)',
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

        {/* Bio placeholder */}
        {!user.bio && (
          <p
            style={{
              fontSize: 'var(--mobile-font-size-sm)',
              fontFamily: 'var(--mobile-font-sans)',
              color: 'var(--mobile-text-muted)',
              margin: 0,
              marginTop: 'var(--mobile-space-2)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            You don't have a bio yet...
          </p>
        )}
      </div>
    </div>
  );
}
