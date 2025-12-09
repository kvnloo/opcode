use tokio::sync::mpsc;
use tauri::Manager;

pub struct TerminalBridge {
    tx: mpsc::Sender<Vec<u8>>,
}

impl TerminalBridge {
    pub fn new(app_handle: tauri::AppHandle) -> (Self, mpsc::Receiver<Vec<u8>>) {
        let (tx, rx) = mpsc::channel(100);

        // Spawn task to forward data to frontend
        let tx_clone = tx.clone();
        let app_handle_clone = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            // This will receive data from SSH and emit to frontend
            // The actual implementation will depend on the frontend WebSocket setup
            log::debug!("Terminal bridge initialized");
        });

        (Self { tx }, rx)
    }

    pub async fn send_to_terminal(&self, data: Vec<u8>) -> Result<(), String> {
        self.tx.send(data)
            .await
            .map_err(|e| format!("Failed to send to terminal: {}", e))
    }
}
