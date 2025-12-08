import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { ConnectionMode, ConnectionStatus, TailscaleConfig, ClaudeWebConfig } from '@/lib/mobile/connection/types';

interface ConnectionConfig {
  mode: ConnectionMode;
  tailscale?: {
    host: string;
    username: string;
    port: number;
  };
  web?: {
    apiToken: string;
    baseUrl: string;
  };
}

interface ConnectionState {
  // Connection state
  mode: ConnectionMode;
  status: ConnectionStatus;
  error: string | null;
  config: ConnectionConfig;
  connectedAt: Date | null;

  // Tailscale specific
  tailscaleHost: string | null;
  tailscaleUsername: string | null;
  tailscalePort: number;

  // Web specific
  webApiToken: string | null;
  webBaseUrl: string;

  // Actions
  setMode: (mode: ConnectionMode) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateConfig: (config: Partial<ConnectionConfig>) => void;
  updateTailscaleConfig: (config: Partial<TailscaleConfig>) => void;
  updateWebConfig: (config: Partial<ClaudeWebConfig>) => void;
  clearError: () => void;
  resetConnection: () => void;
}

const connectionStore: StateCreator<
  ConnectionState,
  [],
  [['zustand/subscribeWithSelector', never], ['zustand/persist', Partial<ConnectionState>]],
  ConnectionState
> = (set, get) => ({
  // Initial state
  mode: 'local',
  status: 'disconnected',
  error: null,
  config: { mode: 'local' },
  connectedAt: null,
  tailscaleHost: null,
  tailscaleUsername: null,
  tailscalePort: 22,
  webApiToken: null,
  webBaseUrl: 'https://api.claude.ai',

  // Set connection mode
  setMode: (mode: ConnectionMode) => {
    const currentMode = get().mode;

    // If switching modes, disconnect first
    if (currentMode !== mode && get().status === 'connected') {
      get().disconnect();
    }

    set({
      mode,
      config: { ...get().config, mode },
      error: null
    });
  },

  // Connect based on current mode
  connect: async () => {
    const { mode, config, tailscaleHost, tailscaleUsername, tailscalePort, webApiToken } = get();

    set({ status: 'connecting', error: null });

    try {
      if (mode === 'local') {
        // Local mode - always connected
        set({
          status: 'connected',
          connectedAt: new Date(),
          error: null
        });
        return;
      }

      if (mode === 'tailscale') {
        // Validate Tailscale config
        if (!tailscaleHost || !tailscaleUsername) {
          throw new Error('Tailscale configuration incomplete. Please provide host and username.');
        }

        // Call Rust backend to establish SSH connection
        const result = await invoke<{ connected: boolean; error?: string }>(
          'connect_tailscale_ssh',
          {
            host: tailscaleHost,
            username: tailscaleUsername,
            port: tailscalePort
          }
        );

        if (result.connected) {
          set({
            status: 'connected',
            connectedAt: new Date(),
            error: null
          });
        } else {
          throw new Error(result.error || 'Tailscale connection failed');
        }
        return;
      }

      if (mode === 'web') {
        // Validate web config
        if (!webApiToken) {
          throw new Error('Claude Web API token required. Please configure in settings.');
        }

        // Call Rust backend to connect to Claude Web
        const result = await invoke<{ connected: boolean; error?: string }>(
          'connect_claude_web',
          {
            apiToken: webApiToken
          }
        );

        if (result.connected) {
          set({
            status: 'connected',
            connectedAt: new Date(),
            error: null
          });
        } else {
          throw new Error(result.error || 'Claude Web connection failed');
        }
        return;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      set({
        status: 'error',
        error: errorMessage,
        connectedAt: null
      });
      throw error;
    }
  },

  // Disconnect current connection
  disconnect: async () => {
    const { mode } = get();

    try {
      // Call Rust backend to close connection
      if (mode === 'tailscale' || mode === 'web') {
        await invoke('disconnect');
      }

      set({
        status: 'disconnected',
        error: null,
        connectedAt: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Disconnect failed';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update connection config
  updateConfig: (newConfig: Partial<ConnectionConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig }
    }));
  },

  // Update Tailscale config
  updateTailscaleConfig: (tailscaleConfig: Partial<TailscaleConfig>) => {
    set((state) => ({
      tailscaleHost: tailscaleConfig.ip ?? state.tailscaleHost,
      tailscaleUsername: tailscaleConfig.username ?? state.tailscaleUsername,
      tailscalePort: tailscaleConfig.port ?? state.tailscalePort,
      config: {
        ...state.config,
        tailscale: {
          host: tailscaleConfig.ip ?? state.tailscaleHost ?? '',
          username: tailscaleConfig.username ?? state.tailscaleUsername ?? '',
          port: tailscaleConfig.port ?? state.tailscalePort
        }
      }
    }));
  },

  // Update Claude Web config
  updateWebConfig: (webConfig: Partial<ClaudeWebConfig>) => {
    set((state) => ({
      webApiToken: webConfig.accessToken ?? state.webApiToken,
      config: {
        ...state.config,
        web: {
          apiToken: webConfig.accessToken ?? state.webApiToken ?? '',
          baseUrl: state.webBaseUrl
        }
      }
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset connection to defaults
  resetConnection: () => {
    const { disconnect } = get();

    // Disconnect first if connected
    if (get().status === 'connected') {
      disconnect();
    }

    set({
      mode: 'local',
      status: 'disconnected',
      error: null,
      config: { mode: 'local' },
      connectedAt: null,
      tailscaleHost: null,
      tailscaleUsername: null,
      tailscalePort: 22,
      webApiToken: null,
      webBaseUrl: 'https://api.claude.ai'
    });
  }
});

export const useConnectionStore = create<ConnectionState>()(
  subscribeWithSelector(
    persist(connectionStore, {
      name: 'connection-storage',
      partialize: (state) => ({
        mode: state.mode,
        tailscaleHost: state.tailscaleHost,
        tailscaleUsername: state.tailscaleUsername,
        tailscalePort: state.tailscalePort,
        webApiToken: state.webApiToken,
        webBaseUrl: state.webBaseUrl,
        config: state.config
      })
    })
  )
);

// Selector hooks for commonly used state
export const useConnectionMode = () => useConnectionStore((state) => state.mode);
export const useConnectionStatus = () => useConnectionStore((state) => state.status);
export const useConnectionError = () => useConnectionStore((state) => state.error);
export const useIsConnected = () => useConnectionStore((state) => state.status === 'connected');
export const useTailscaleConfig = () => useConnectionStore((state) => ({
  host: state.tailscaleHost,
  username: state.tailscaleUsername,
  port: state.tailscalePort
}));
export const useWebConfig = () => useConnectionStore((state) => ({
  apiToken: state.webApiToken,
  baseUrl: state.webBaseUrl
}));
