
import { cn } from '@/lib/utils';
import { Github, Database, Cloud, Key, ExternalLink, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  category: 'auth' | 'database' | 'storage' | 'api';
}

interface IntegrationsPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function IntegrationsPane({ projectId: _projectId, onBack, className }: IntegrationsPaneProps) {
  const integrations: Integration[] = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect to GitHub repositories',
      icon: <Github className="w-5 h-5" />,
      connected: true,
      category: 'api',
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'PostgreSQL database with auth',
      icon: <Database className="w-5 h-5" />,
      connected: false,
      category: 'database',
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      description: 'CDN and edge functions',
      icon: <Cloud className="w-5 h-5" />,
      connected: false,
      category: 'storage',
    },
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Authentication provider',
      icon: <Key className="w-5 h-5" />,
      connected: false,
      category: 'auth',
    },
  ];

  const categories = [
    { id: 'api', name: 'APIs & Services' },
    { id: 'database', name: 'Databases' },
    { id: 'auth', name: 'Authentication' },
    { id: 'storage', name: 'Storage & CDN' },
  ];

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
        <h2 className="text-lg font-semibold">Integrations</h2>
      </header>

      {/* Integrations by category */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {categories.map((category) => {
          const categoryIntegrations = integrations.filter(
            i => i.category === category.id
          );

          if (categoryIntegrations.length === 0) return null;

          return (
            <div key={category.id}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {categoryIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex-shrink-0 p-2 rounded-md bg-muted">
                      {integration.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        {integration.connected && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {integration.description}
                      </p>
                    </div>
                    <HapticButton
                      className={integration.connected ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}
                      aria-label={integration.connected ? 'Configure' : 'Connect'}
                    >
                      {integration.connected ? 'Configure' : 'Connect'}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </HapticButton>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IntegrationsPane;
