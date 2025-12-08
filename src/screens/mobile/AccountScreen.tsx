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
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Card */}
          <ProfileCard user={user} />

          {/* Upgrade Banner */}
          {!user.isPro && (
            <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2">
              <span>✨</span>
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
