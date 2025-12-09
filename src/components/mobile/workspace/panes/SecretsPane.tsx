import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Eye, EyeOff, Trash2, Lock, ChevronLeft } from 'lucide-react';
import { HapticButton } from '@/components/mobile/common/HapticButton';
import { Button } from '@/components/ui/button';

interface Secret {
  id: string;
  key: string;
  value: string;
  hidden: boolean;
}

interface SecretsPaneProps {
  projectId: string;
  onBack: () => void;
  className?: string;
}

export function SecretsPane({ projectId, onBack, className }: SecretsPaneProps) {
  const [secrets, setSecrets] = useState<Secret[]>([
    { id: '1', key: 'API_KEY', value: 'sk-***************', hidden: true },
    { id: '2', key: 'DATABASE_URL', value: 'postgres://...', hidden: true },
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addSecret = () => {
    if (newKey && newValue) {
      setSecrets([...secrets, {
        id: Date.now().toString(),
        key: newKey,
        value: newValue,
        hidden: true,
      }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const toggleVisibility = (id: string) => {
    setSecrets(secrets.map(s =>
      s.id === id ? { ...s, hidden: !s.hidden } : s
    ));
  };

  const deleteSecret = (id: string) => {
    setSecrets(secrets.filter(s => s.id !== id));
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
        <h2 className="text-lg font-semibold">Environment Variables</h2>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Add secrets and environment variables for your application.
          These are encrypted and only accessible in your app.
        </p>

        {/* Add new secret */}
        <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="KEY"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono"
        />
        <input
          type="password"
          placeholder="value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm"
        />
        <HapticButton
          className="px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={addSecret}
          aria-label="Add secret"
        >
          <Plus className="w-4 h-4" />
        </HapticButton>
        </div>

        {/* Secrets list */}
        <div className="flex-1 space-y-2 overflow-auto">
        {secrets.map((secret) => (
          <div
            key={secret.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
          >
            <span className="font-mono text-sm text-primary flex-shrink-0">
              {secret.key}
            </span>
            <span className="text-muted-foreground">=</span>
            <span className="flex-1 font-mono text-sm truncate">
              {secret.hidden ? '••••••••••••' : secret.value}
            </span>
            <HapticButton
              className="hover:bg-accent hover:text-accent-foreground"
              onClick={() => toggleVisibility(secret.id)}
              aria-label={secret.hidden ? 'Show value' : 'Hide value'}
            >
              {secret.hidden ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </HapticButton>
            <HapticButton
              className="hover:bg-accent hover:text-accent-foreground text-destructive"
              onClick={() => deleteSecret(secret.id)}
              aria-label="Delete secret"
            >
              <Trash2 className="w-4 h-4" />
            </HapticButton>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default SecretsPane;
