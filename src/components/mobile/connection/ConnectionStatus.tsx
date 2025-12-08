import { WifiOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionState {
  mode: 'local' | 'tailscale' | 'web';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  host?: string;
  error?: string;
}

interface ConnectionStatusProps {
  connection: ConnectionState;
}

export function ConnectionStatus({ connection }: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (connection.status) {
      case 'connected':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'connecting':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <WifiOff className="text-muted-foreground" size={20} />;
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case 'connected':
        return `Connected${connection.host ? ` to ${connection.host}` : ''}`;
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return connection.error || 'Connection failed';
      default:
        return 'Disconnected';
    }
  };

  const getModeLabel = () => {
    switch (connection.mode) {
      case 'local':
        return 'Local';
      case 'tailscale':
        return 'Tailscale SSH';
      case 'web':
        return 'Claude Web';
    }
  };

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${
      connection.status === 'connected'
        ? 'bg-green-500/10'
        : connection.status === 'error'
          ? 'bg-red-500/10'
          : 'bg-muted'
    }`}>
      {getStatusIcon()}
      <div className="flex-1">
        <p className="font-medium">{getModeLabel()}</p>
        <p className="text-sm text-muted-foreground">{getStatusText()}</p>
      </div>
    </div>
  );
}
