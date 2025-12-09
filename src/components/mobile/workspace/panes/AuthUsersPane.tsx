import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, Plus, Search, Mail, Shield, Trash2, MoreVertical, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  lastActive?: Date;
}

interface AuthUsersPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function AuthUsersPane({ projectId, onBack, className }: AuthUsersPaneProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'admin@example.com', role: 'admin', status: 'active', lastActive: new Date() },
    { id: '2', email: 'editor@example.com', role: 'editor', status: 'active', lastActive: new Date() },
    { id: '3', email: 'viewer@example.com', role: 'viewer', status: 'invited' },
  ]);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'editor': return 'bg-blue-500/20 text-blue-400';
      case 'viewer': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'invited': return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended': return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 -ml-2"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">Users & Authentication</h2>
        <div className="ml-auto">
          <HapticButton
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Invite user"
          >
            <Mail className="w-4 h-4 mr-1" />
            Invite User
          </HapticButton>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-muted border border-border text-sm"
          />
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-auto px-4 space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{user.email}</span>
                <span className={cn('px-2 py-0.5 text-xs rounded', getRoleColor(user.role))}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('px-2 py-0.5 text-xs rounded', getStatusColor(user.status))}>
                  {user.status}
                </span>
                {user.lastActive && (
                  <span className="text-xs text-muted-foreground">
                    Active {user.lastActive.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <HapticButton
              className="hover:bg-accent hover:text-accent-foreground"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </HapticButton>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">
        {users.length} users • {users.filter(u => u.status === 'active').length} active
      </div>
    </div>
  );
}

export default AuthUsersPane;
