export type ConnectionMode = 'local' | 'tailscale' | 'web';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  mode: ConnectionMode;
  status: ConnectionStatus;
  host?: string;
  username?: string;
  error?: string;
  connectedAt?: Date;
}

export interface TailscaleConfig {
  ip: string;
  username: string;
  port?: number;
}

export interface ClaudeWebConfig {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}
