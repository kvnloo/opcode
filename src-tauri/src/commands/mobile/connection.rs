use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub mode: String,
    pub host: Option<String>,
    pub error: Option<String>,
}

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

/// Placeholder for Tailscale SSH connection
#[command]
pub async fn connect_tailscale_ssh(
    _host: String,
    _username: String,
    _port: u16,
) -> Result<ConnectionStatus, String> {
    // TODO: Implement WebSocket SSH bridge
    Ok(ConnectionStatus {
        connected: false,
        mode: "tailscale".to_string(),
        host: Some(_host),
        error: Some("Tailscale SSH not yet implemented".to_string()),
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
