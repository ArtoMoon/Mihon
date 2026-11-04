//! Discord Rich Presence (IPC Named Pipe) Entegrasyonu.
//!
//! Harici crate gerektirmeden doğrudan Windows `\\.\pipe\discord-ipc-0..9` üzerinden
//! kalıcı bağlantı kurar; şarkı adı, sanatçı, albüm kapağı, canlı ilerleme çubuğu (timestamps)
//! ve "Helios ile Dinle" butonunu Discord profilinde gösterir.

use serde_json::{Value, json};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::sync::{Mutex, OnceLock};
use std::time::{SystemTime, UNIX_EPOCH};

const DISCORD_CLIENT_ID: &str = "495666957501071390";

fn pipe_store() -> &'static Mutex<Option<File>> {
    static PIPE: OnceLock<Mutex<Option<File>>> = OnceLock::new();
    PIPE.get_or_init(|| Mutex::new(None))
}

fn write_frame(file: &mut File, opcode: u32, payload: &Value) -> Result<(), String> {
    let bytes = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
    let mut header = [0u8; 8];
    header[0..4].copy_from_slice(&opcode.to_le_bytes());
    header[4..8].copy_from_slice(&(bytes.len() as u32).to_le_bytes());
    file.write_all(&header).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;
    file.flush().map_err(|e| e.to_string())?;
    Ok(())
}

fn read_frame(file: &mut File) -> Result<(u32, Vec<u8>), String> {
    let mut header = [0u8; 8];
    file.read_exact(&mut header).map_err(|e| e.to_string())?;
    let opcode = u32::from_le_bytes([header[0], header[1], header[2], header[3]]);
    let len = u32::from_le_bytes([header[4], header[5], header[6], header[7]]) as usize;
    let mut buf = vec![0u8; len.min(65536)];
    file.read_exact(&mut buf).map_err(|e| e.to_string())?;
    Ok((opcode, buf))
}

fn connect_and_handshake() -> Result<File, String> {
    let client_id = std::env::var("DISCORD_CLIENT_ID")
        .ok()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| DISCORD_CLIENT_ID.to_string());

    for i in 0..10 {
        let path = format!(r"\\.\pipe\discord-ipc-{i}");
        if let Ok(mut file) = OpenOptions::new().read(true).write(true).open(&path) {
            let handshake = json!({
                "v": 1,
                "client_id": client_id
            });
            if write_frame(&mut file, 0, &handshake).is_ok() && read_frame(&mut file).is_ok() {
                return Ok(file);
            }
        }
    }
    Err("Discord açık değil veya IPC bağlantısı kurulamadı".into())
}

fn send_activity_payload(payload: &Value) -> Result<(), String> {
    let mut guard = pipe_store().lock().unwrap();

    if guard.is_none() {
        *guard = Some(connect_and_handshake()?);
    }

    if let Some(file) = guard.as_mut() {
        if write_frame(file, 1, payload).is_ok() && read_frame(file).is_ok() {
            return Ok(());
        }
    }

    // Bağlantı koptuysa yeniden bağlanıp bir kez daha dene
    *guard = None;
    let mut file = connect_and_handshake()?;
    write_frame(&mut file, 1, payload)?;
    let _ = read_frame(&mut file);
    *guard = Some(file);
    Ok(())
}

/// Çalan şarkıyı Discord Rich Presence olarak günceller.
pub fn set_presence(
    id: &str,
    title: &str,
    artist: &str,
    _album: &str,
    thumbnail: &str,
    current_sec: u64,
    duration_sec: u64,
    is_playing: bool,
) -> Result<(), String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let clean_title = if title.trim().is_empty() {
        "Mihon"
    } else {
        title.trim()
    };
    let clean_artist = if artist.trim().is_empty() {
        "Mihon"
    } else {
        artist.trim()
    };

    let state_text = if is_playing {
        clean_artist.to_string()
    } else {
        format!("{clean_artist} (Duraklatıldı)")
    };

    let large_image = if thumbnail.starts_with("http://") || thumbnail.starts_with("https://") {
        thumbnail.to_string()
    } else if id.len() == 11 && !id.starts_with("sp:") {
        format!("https://i.ytimg.com/vi/{id}/hqdefault.jpg")
    } else {
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80".to_string()
    };

    let large_text = "Mihon".to_string();

    let watch_url = if id.len() == 11 && !id.starts_with("sp:") {
        format!("https://music.youtube.com/watch?v={id}")
    } else {
        "https://music.youtube.com".to_string()
    };

    let mut activity = json!({
        "name": "Mihon",
        "type": 2,
        "details": clean_title,
        "state": state_text,
        "assets": {
            "large_image": large_image,
            "large_text": large_text
        },
        "buttons": [
            {
                "label": "Mihon ile Dinle",
                "url": watch_url
            }
        ]
    });

    if is_playing && duration_sec > 0 {
        let start = now.saturating_sub(current_sec);
        let end = start + duration_sec;
        activity["timestamps"] = json!({
            "start": start,
            "end": end
        });
    }

    let frame = json!({
        "cmd": "SET_ACTIVITY",
        "args": {
            "pid": std::process::id(),
            "activity": activity
        },
        "nonce": format!("helios-{}", now)
    });

    send_activity_payload(&frame)
}

/// Discord Rich Presence durumunu temizler.
pub fn clear_presence() -> Result<(), String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let frame = json!({
        "cmd": "SET_ACTIVITY",
        "args": {
            "pid": std::process::id(),
            "activity": Value::Null
        },
        "nonce": format!("helios-clear-{}", now)
    });

    send_activity_payload(&frame)
}

