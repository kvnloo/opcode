import { Card } from '@/components/ui/card';

interface User {
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  isPro?: boolean;
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
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{user.name}</h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          {!user.isPro && (
            <p className="text-sm text-muted-foreground mt-1">You don't have a bio yet...</p>
          )}
        </div>
      </div>
    </Card>
  );
}
