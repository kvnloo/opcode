import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface TailscaleConnectProps {
  onConnect: (host: string, username: string) => void;
  isConnecting?: boolean;
}

export function TailscaleConnect({ onConnect, isConnecting }: TailscaleConnectProps) {
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (host && username) {
      onConnect(host, username);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Tailscale IP (e.g., 100.64.0.5)"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        disabled={isConnecting}
      />
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isConnecting}
      />
      <button
        type="submit"
        disabled={!host || !username || isConnecting}
        className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <span>Connect via Tailscale</span>
        )}
      </button>
    </form>
  );
}
