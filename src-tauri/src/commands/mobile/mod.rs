//! Mobile-specific Tauri commands
//!
//! This module contains commands that are specific to mobile platforms,
//! including SSH bridge, connection management, and mobile-specific features.

pub mod connection;
pub mod ssh;
pub mod websocket_bridge;

// Re-export all mobile commands
pub use connection::*;
