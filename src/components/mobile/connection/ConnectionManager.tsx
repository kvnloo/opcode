import { useState } from 'react';
import { TailscaleConnect } from './TailscaleConnect';
import { ClaudeWebConnect } from './ClaudeWebConnect';
import { ConnectionStatus } from './ConnectionStatus';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Wifi, Cloud, Server } from 'lucide-react';

export type ConnectionMode = 'local' | 'tailscale' | 'web';

interface ConnectionState {
  mode: ConnectionMode;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  host?: string;
  error?: string;
}

export function ConnectionManager() {
  const [connection, setConnection] = useState<ConnectionState>({
    mode: 'local',
    status: 'connected', // Local is always "connected"
  });
  const [selectedMode, setSelectedMode] = useState<ConnectionMode>('local');

  const handleConnect = (mode: ConnectionMode, host?: string) => {
    setConnection({
      mode,
      status: 'connecting',
      host,
    });

    // Simulate connection (will be replaced with actual logic)
    setTimeout(() => {
      setConnection({
        mode,
        status: 'connected',
        host,
      });
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-semibold">Connection Mode</h2>

          {/* Current Status */}
          <ConnectionStatus connection={connection} />

          {/* Mode Selection */}
          <div className="space-y-4">
            {/* Local Mode */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedMode === 'local' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMode('local')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Server className="text-green-500" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Local</h3>
                  <p className="text-sm text-muted-foreground">
                    Run Claude Code on this device
                  </p>
                </div>
                {connection.mode === 'local' && connection.status === 'connected' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
            </Card>

            {/* Tailscale Mode */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedMode === 'tailscale' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMode('tailscale')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Wifi className="text-blue-500" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Tailscale SSH</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to your dev machine via VPN
                  </p>
                </div>
                {connection.mode === 'tailscale' && connection.status === 'connected' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>

              {selectedMode === 'tailscale' && (
                <TailscaleConnect
                  onConnect={(host, _username) => handleConnect('tailscale', host)}
                  isConnecting={connection.mode === 'tailscale' && connection.status === 'connecting'}
                />
              )}
            </Card>

            {/* Claude Web Mode */}
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedMode === 'web' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMode('web')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Cloud className="text-purple-500" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Claude Code Web</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct API connection (Pro/Max)
                  </p>
                </div>
                {connection.mode === 'web' && connection.status === 'connected' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>

              {selectedMode === 'web' && (
                <ClaudeWebConnect
                  onConnect={() => handleConnect('web')}
                  isConnecting={connection.mode === 'web' && connection.status === 'connecting'}
                />
              )}
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
