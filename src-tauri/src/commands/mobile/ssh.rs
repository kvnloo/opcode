use russh::*;
use russh_keys::*;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SshClient {
    session: Option<Arc<Mutex<client::Handle<SshHandler>>>>,
    channel: Option<Arc<Mutex<Channel<client::Msg>>>>,
}

struct SshHandler;

#[async_trait::async_trait]
impl client::Handler for SshHandler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &key::PublicKey,
    ) -> Result<bool, Self::Error> {
        // In production, verify against known hosts
        // For now, accept all keys (INSECURE - should be configurable)
        Ok(true)
    }

    async fn data(
        &mut self,
        _channel: ChannelId,
        data: &[u8],
        _session: &mut client::Session,
    ) -> Result<(), Self::Error> {
        // Handle incoming data - emit to frontend
        let text = String::from_utf8_lossy(data);
        log::debug!("SSH data received: {}", text);
        Ok(())
    }
}

impl SshClient {
    pub fn new() -> Self {
        Self {
            session: None,
            channel: None,
        }
    }

    pub async fn connect(
        &mut self,
        host: &str,
        port: u16,
        username: &str,
        key_path: Option<&str>,
    ) -> Result<(), String> {
        let config = client::Config::default();
        let config = Arc::new(config);

        let addr = format!("{}:{}", host, port);

        let mut session = client::connect(config, addr, SshHandler)
            .await
            .map_err(|e| format!("Connection failed: {}", e))?;

        // Try key-based auth - key_path is required for now
        // SSH agent auth would require additional implementation
        let key_path = key_path.ok_or_else(|| {
            "SSH key path required. SSH agent authentication not yet supported.".to_string()
        })?;

        let key_pair = russh_keys::load_secret_key(key_path, None)
            .map_err(|e| format!("Failed to load key: {}", e))?;
        let auth_result = session.authenticate_publickey(username, Arc::new(key_pair)).await;

        if !auth_result.map_err(|e| format!("Auth failed: {}", e))? {
            return Err("Authentication failed".to_string());
        }

        // Open a shell channel
        let channel = session.channel_open_session()
            .await
            .map_err(|e| format!("Failed to open channel: {}", e))?;

        channel.request_pty(false, "xterm-256color", 80, 24, 0, 0, &[])
            .await
            .map_err(|e| format!("PTY request failed: {}", e))?;

        channel.request_shell(false)
            .await
            .map_err(|e| format!("Shell request failed: {}", e))?;

        self.session = Some(Arc::new(Mutex::new(session)));
        self.channel = Some(Arc::new(Mutex::new(channel)));

        log::info!("SSH connection established to {}:{}", host, port);
        Ok(())
    }

    pub async fn send_data(&self, data: &[u8]) -> Result<(), String> {
        if let Some(channel) = &self.channel {
            let mut ch = channel.lock().await;
            ch.data(data)
                .await
                .map_err(|e| format!("Failed to send data: {}", e))?;
        } else {
            return Err("Not connected".to_string());
        }
        Ok(())
    }

    pub async fn disconnect(&mut self) -> Result<(), String> {
        if let Some(channel) = self.channel.take() {
            let ch = channel.lock().await;
            ch.eof().await.ok();
        }
        if let Some(session) = self.session.take() {
            let mut s = session.lock().await;
            s.disconnect(Disconnect::ByApplication, "", "en").await.ok();
        }
        log::info!("SSH connection disconnected");
        Ok(())
    }

    pub fn is_connected(&self) -> bool {
        self.session.is_some() && self.channel.is_some()
    }
}

impl Default for SshClient {
    fn default() -> Self {
        Self::new()
    }
}
