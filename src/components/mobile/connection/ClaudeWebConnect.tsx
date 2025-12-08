import { Github, Loader2 } from 'lucide-react';

interface ClaudeWebConnectProps {
  onConnect: () => void;
  isConnecting?: boolean;
}

export function ClaudeWebConnect({ onConnect, isConnecting }: ClaudeWebConnectProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sign in with your GitHub account to use Claude Code Web API.
        Requires Claude Pro or Max subscription.
      </p>

      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Github size={16} />
            <span>Connect with GitHub</span>
          </>
        )}
      </button>
    </div>
  );
}
