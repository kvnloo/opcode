use tauri::command;
use serde::{Deserialize, Serialize};
use super::ssh::SshClient;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub mode: String,
    pub host: Option<String>,
    pub error: Option<String>,
}

// Global SSH client state
pub struct SshState(pub Arc<Mutex<Option<SshClient>>>);

/// Check if mobile connection features are available
#[command]
pub fn check_mobile_connection() -> ConnectionStatus {
    ConnectionStatus {
        connected: false,
        mode: "local".to_string(),
        host: None,
        error: None,
    }
}

/// Get current connection mode (local, tailscale, web)
#[command]
pub fn get_connection_mode() -> String {
    "local".to_string()
}

/// Connect to a remote host via Tailscale SSH
#[command]
pub async fn connect_tailscale_ssh(
    host: String,
    username: String,
    port: u16,
    key_path: Option<String>,
    ssh_state: State<'_, SshState>,
    app_handle: tauri::AppHandle,
) -> Result<ConnectionStatus, String> {
    let mut client = SshClient::new();

    client.connect(&host, port, &username, key_path.as_deref()).await?;

    // Store the connected client
    let mut state = ssh_state.0.lock().await;
    *state = Some(client);

    // Emit connection success event
    app_handle.emit("tailscale-connected", &host).ok();

    Ok(ConnectionStatus {
        connected: true,
        mode: "tailscale".to_string(),
        host: Some(host),
        error: None,
    })
}

/// Disconnect from Tailscale SSH
#[command]
pub async fn disconnect_tailscale(
    ssh_state: State<'_, SshState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut state = ssh_state.0.lock().await;
    if let Some(mut client) = state.take() {
        client.disconnect().await?;
    }
    app_handle.emit("tailscale-disconnected", ()).ok();
    Ok(())
}

/// Send input to the remote terminal
#[command]
pub async fn send_terminal_input(
    data: String,
    ssh_state: State<'_, SshState>,
) -> Result<(), String> {
    let state = ssh_state.0.lock().await;
    if let Some(client) = state.as_ref() {
        client.send_data(data.as_bytes()).await?;
    } else {
        return Err("Not connected".to_string());
    }
    Ok(())
}

/// Get current connection status
#[command]
pub async fn get_connection_status(
    ssh_state: State<'_, SshState>,
) -> Result<ConnectionStatus, String> {
    let state = ssh_state.0.lock().await;
    let connected = state.as_ref().map(|c| c.is_connected()).unwrap_or(false);

    Ok(ConnectionStatus {
        connected,
        mode: if connected { "tailscale".to_string() } else { "disconnected".to_string() },
        host: None,
        error: None,
    })
}

/// Placeholder for Claude Web API connection
#[command]
pub async fn connect_claude_web() -> Result<ConnectionStatus, String> {
    // TODO: Implement Claude Web API authentication
    Ok(ConnectionStatus {
        connected: false,
        mode: "web".to_string(),
        host: None,
        error: Some("Claude Web API not yet implemented".to_string()),
    })
}
