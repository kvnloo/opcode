//! Mobile platform-specific code
//!
//! This module contains platform-specific implementations for iOS and Android.

#[cfg(target_os = "ios")]
pub mod ios;

#[cfg(target_os = "android")]
pub mod android;

/// Check if running on a mobile platform
pub fn is_mobile() -> bool {
    cfg!(any(target_os = "ios", target_os = "android"))
}

/// Get the current mobile platform name
pub fn mobile_platform() -> Option<&'static str> {
    #[cfg(target_os = "ios")]
    return Some("ios");

    #[cfg(target_os = "android")]
    return Some("android");

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    None
}
