mod audio;
mod discord;
mod music;
mod spotify;

use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use tauri::{AppHandle, Manager};

fn sp_id_cache() -> &'static Mutex<HashMap<String, String>> {
    static CACHE: OnceLock<Mutex<HashMap<String, String>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn audio_cache_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_cache_dir()
        .map(|d| d.join("audio"))
        .map_err(|e| format!("Önbellek dizini alınamadı: {e}"))
}

#[tauri::command]
async fn search(query: String) -> Result<Vec<music::Track>, String> {
    let q = query.trim();
    if q.is_empty() {
        return Ok(vec![]);
    }
    music::search(q).await
}

/// Parçayı önbelleğe alır ve yerel dosya yolunu döndürür (frontend convertFileSrc ile çalar).
#[tauri::command]
async fn prepare_track(app: AppHandle, id: String) -> Result<String, String> {
    let dir = audio_cache_dir(&app)?;
    let resolved_id = if let Some(sp_query) = id.strip_prefix("sp:") {
        let clean = sp_query.trim().to_string();
        let cached = sp_id_cache().lock().unwrap().get(&clean).cloned();
        if let Some(vid) = cached {
            vid
        } else {
            let results = music::search(&clean).await?;
            let vid = results
                .into_iter()
                .find(|t| audio::is_valid_video_id(&t.id))
                .map(|t| t.id)
                .ok_or_else(|| format!("Parça eşleştirilemedi: {clean}"))?;
            sp_id_cache().lock().unwrap().insert(clean, vid.clone());
            vid
        }
    } else {
        id
    };
    let path = audio::ensure_audio(&dir, &resolved_id).await?;
    Ok(path.to_string_lossy().into_owned())
}

#[derive(Serialize)]
struct CacheInfo {
    bytes: u64,
    files: usize,
    path: String,
}

#[tauri::command]
fn cache_info(app: AppHandle) -> Result<CacheInfo, String> {
    let dir = audio_cache_dir(&app)?;
    let (bytes, files) = audio::cache_stats(&dir);
    Ok(CacheInfo { bytes, files, path: dir.to_string_lossy().into_owned() })
}

#[tauri::command]
fn clear_cache(app: AppHandle) -> Result<(), String> {
    let dir = audio_cache_dir(&app)?;
    if dir.exists() {
        std::fs::remove_dir_all(&dir).map_err(|e| format!("Önbellek silinemedi: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize(window: tauri::Window) {
    if let Ok(maximized) = window.is_maximized() {
        if maximized {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    }
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
async fn import_spotify(input: String) -> Result<Vec<spotify::ImportedPlaylist>, String> {
    spotify::import_from_spotify(&input).await
}

#[tauri::command]
async fn recommend_similar(
    seed_id: String,
    seed_title: String,
    seed_artist: String,
    seed_duration_sec: u32,
    exclude_ids: Option<Vec<String>>,
) -> Result<music::RecommendationResult, String> {
    let excluded = exclude_ids.unwrap_or_default();
    music::recommend_similar(
        &seed_id,
        &seed_title,
        &seed_artist,
        seed_duration_sec,
        &excluded,
    )
    .await
}

#[tauri::command]
async fn update_discord_presence(
    id: String,
    title: String,
    artist: String,
    album: String,
    thumbnail: String,
    current_sec: u64,
    duration_sec: u64,
    is_playing: bool,
) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        discord::set_presence(
            &id,
            &title,
            &artist,
            &album,
            &thumbnail,
            current_sec,
            duration_sec,
            is_playing,
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn clear_discord_presence() -> Result<(), String> {
    tokio::task::spawn_blocking(discord::clear_presence)
        .await
        .map_err(|e| e.to_string())?
}

fn library_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Kütüphane dizini alınamadı: {e}"))?;
    let _ = std::fs::create_dir_all(&dir);
    Ok(dir.join("library.json"))
}

/// Chromium LevelDB (`EBWebView/Default/Local Storage/leveldb`) içerisindeki önceki localhost:4789
/// kayıtlarından UTF-8 veya UTF-16LE JSON dizisini kurtarır.
fn extract_json_array_after_key(bytes: &[u8], key: &[u8]) -> Option<serde_json::Value> {
    let mut pos = bytes.len();
    while pos > key.len() {
        let Some(found) = bytes[..pos].windows(key.len()).rposition(|w| w == key) else {
            break;
        };
        let after = &bytes[found + key.len()..];
        pos = found;

        // 1) UTF-8 JSON dizisi kontrolü (`[{"id":...}]`)
        for offset in 0..after.len().min(40) {
            if after[offset] == b'[' {
                let slice = &after[offset..];
                let mut depth = 0i32;
                let mut in_str = false;
                let mut esc = false;
                for (i, &b) in slice.iter().enumerate() {
                    if in_str {
                        if esc {
                            esc = false;
                        } else if b == b'\\' {
                            esc = true;
                        } else if b == b'"' {
                            in_str = false;
                        }
                    } else if b == b'"' {
                        in_str = true;
                    } else if b == b'[' {
                        depth += 1;
                    } else if b == b']' {
                        depth -= 1;
                        if depth == 0 {
                            if let Ok(val) =
                                serde_json::from_slice::<serde_json::Value>(&slice[..=i])
                            {
                                if val.as_array().is_some_and(|a| !a.is_empty()) {
                                    return Some(val);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        // 2) UTF-16LE JSON dizisi kontrolü (`[\x00{\x00"...`)
        for offset in 0..after.len().min(40) {
            if offset + 3 < after.len() && after[offset] == b'[' && after[offset + 1] == 0 {
                let slice = &after[offset..];
                let mut u16s = Vec::new();
                let mut depth = 0i32;
                let mut in_str = false;
                let mut esc = false;
                for chunk in slice.chunks_exact(2) {
                    let ch = u16::from_le_bytes([chunk[0], chunk[1]]);
                    u16s.push(ch);
                    if in_str {
                        if esc {
                            esc = false;
                        } else if ch == b'\\' as u16 {
                            esc = true;
                        } else if ch == b'"' as u16 {
                            in_str = false;
                        }
                    } else if ch == b'"' as u16 {
                        in_str = true;
                    } else if ch == b'[' as u16 {
                        depth += 1;
                    } else if ch == b']' as u16 {
                        depth -= 1;
                        if depth == 0 {
                            if let Ok(s) = String::from_utf16(&u16s) {
                                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&s) {
                                    if val.as_array().is_some_and(|a| !a.is_empty()) {
                                        return Some(val);
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
    None
}

fn recover_from_webview_leveldb(app: &AppHandle) -> serde_json::Value {
    let mut custom_playlists = serde_json::json!([]);
    let mut liked = serde_json::json!([]);
    let mut recent = serde_json::json!([]);

    if let Ok(local_data) = app.path().app_local_data_dir() {
        let leveldb_dir = local_data
            .join("EBWebView")
            .join("Default")
            .join("Local Storage")
            .join("leveldb");
        if let Ok(entries) = std::fs::read_dir(&leveldb_dir) {
            let mut files: Vec<PathBuf> = entries
                .filter_map(|e| e.ok().map(|d| d.path()))
                .filter(|p| {
                    p.extension()
                        .and_then(|x| x.to_str())
                        .is_some_and(|ext| ext.eq_ignore_ascii_case("log") || ext.eq_ignore_ascii_case("ldb"))
                })
                .collect();
            files.sort();
            files.reverse();

            for file_path in files {
                if let Ok(bytes) = std::fs::read(&file_path) {
                    if custom_playlists.as_array().is_some_and(|a| a.is_empty()) {
                        if let Some(v) = extract_json_array_after_key(&bytes, b"custom_playlists") {
                            custom_playlists = v;
                        }
                    }
                    if liked.as_array().is_some_and(|a| a.is_empty()) {
                        if let Some(v) = extract_json_array_after_key(&bytes, b"liked") {
                            liked = v;
                        }
                    }
                    if recent.as_array().is_some_and(|a| a.is_empty()) {
                        if let Some(v) = extract_json_array_after_key(&bytes, b"recent") {
                            recent = v;
                        }
                    }
                }
            }
        }
    }

    serde_json::json!({
        "custom_playlists": custom_playlists,
        "liked": liked,
        "recent": recent
    })
}

#[tauri::command]
fn load_library(app: AppHandle) -> Result<serde_json::Value, String> {
    let path = library_file_path(&app)?;
    if path.exists() {
        if let Ok(content) = std::fs::read_to_string(&path) {
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
                return Ok(val);
            }
        }
    }
    let recovered = recover_from_webview_leveldb(&app);
    if let Ok(serialized) = serde_json::to_string(&recovered) {
        let _ = std::fs::write(&path, serialized);
    }
    Ok(recovered)
}

#[tauri::command]
fn save_library(app: AppHandle, data: serde_json::Value) -> Result<(), String> {
    let path = library_file_path(&app)?;
    let serialized = serde_json::to_string(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, serialized).map_err(|e| format!("Kütüphane kaydedilemedi: {e}"))?;
    Ok(())
}

const DEFAULT_GITHUB_REPO: &str = "ArtoMoon/Mihon";
const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Serialize)]
struct UpdateInfo {
    current_version: String,
    latest_version: String,
    has_update: bool,
    download_url: String,
    release_url: String,
    notes: String,
    repo: String,
}

fn parse_semver_tuple(v: &str) -> (u32, u32, u32) {
    let clean = v.trim().trim_start_matches(['v', 'V']);
    let mut parts = clean
        .split(['.', '-', '+'])
        .filter_map(|p| p.parse::<u32>().ok());
    (
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
    )
}

fn is_newer_version(current: &str, latest: &str) -> bool {
    parse_semver_tuple(latest) > parse_semver_tuple(current)
}

#[tauri::command]
async fn check_for_updates(repo: Option<String>) -> Result<UpdateInfo, String> {
    let target_repo = repo
        .map(|r| r.trim().to_string())
        .filter(|r| !r.is_empty())
        .unwrap_or_else(|| DEFAULT_GITHUB_REPO.to_string());

    let client = reqwest::Client::builder()
        .user_agent("Mihon-Updater/2.0")
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    // 1. Önce GitHub Releases API (`releases/latest`) kontrol et
    let releases_api = format!("https://api.github.com/repos/{target_repo}/releases/latest");
    if let Ok(resp) = client.get(&releases_api).send().await {
        if resp.status().is_success() {
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                let tag = json
                    .get("tag_name")
                    .or_else(|| json.get("name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or(APP_VERSION)
                    .trim_start_matches(['v', 'V'])
                    .to_string();

                let notes = json
                    .get("body")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();

                let release_url = json
                    .get("html_url")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();

                let mut download_url = String::new();
                if let Some(assets) = json.get("assets").and_then(|v| v.as_array()) {
                    for asset in assets {
                        let name = asset
                            .get("name")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_lowercase();
                        if name.ends_with(".exe") {
                            if let Some(url) =
                                asset.get("browser_download_url").and_then(|v| v.as_str())
                            {
                                download_url = url.to_string();
                                break;
                            }
                        }
                    }
                }
                if download_url.is_empty() {
                    download_url = format!(
                        "https://github.com/{target_repo}/releases/latest/download/Mihon.exe"
                    );
                }

                let has_update = is_newer_version(APP_VERSION, &tag);
                return Ok(UpdateInfo {
                    current_version: APP_VERSION.to_string(),
                    latest_version: tag,
                    has_update,
                    download_url,
                    release_url,
                    notes,
                    repo: target_repo,
                });
            }
        }
    }

    // 2. Yedek olarak repo kökündeki `version.json` dosyasını kontrol et (main veya master dalı)
    for branch in ["main", "master"] {
        let raw_url =
            format!("https://raw.githubusercontent.com/{target_repo}/{branch}/version.json");
        if let Ok(resp) = client.get(&raw_url).send().await {
            if resp.status().is_success() {
                if let Ok(json) = resp.json::<serde_json::Value>().await {
                    let latest = json
                        .get("version")
                        .and_then(|v| v.as_str())
                        .unwrap_or(APP_VERSION)
                        .trim_start_matches(['v', 'V'])
                        .to_string();
                    let download_url = json
                        .get("download_url")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    let release_url = json
                        .get("release_url")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    let notes = json
                        .get("notes")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();

                    let has_update = is_newer_version(APP_VERSION, &latest);
                    return Ok(UpdateInfo {
                        current_version: APP_VERSION.to_string(),
                        latest_version: latest,
                        has_update,
                        download_url,
                        release_url,
                        notes,
                        repo: target_repo,
                    });
                }
            }
        }
    }

    Ok(UpdateInfo {
        current_version: APP_VERSION.to_string(),
        latest_version: APP_VERSION.to_string(),
        has_update: false,
        download_url: format!(
            "https://github.com/{target_repo}/releases/latest/download/Mihon.exe"
        ),
        release_url: format!("https://github.com/{target_repo}"),
        notes: String::new(),
        repo: target_repo,
    })
}

#[derive(Serialize, Clone)]
struct LyricsResult {
    synced_lyrics: String,
    plain_lyrics: String,
    track_name: String,
    artist_name: String,
    source: String,
}

fn clean_lyrics_term(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut depth = 0usize;
    for ch in s.chars() {
        match ch {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth = depth.saturating_sub(1),
            _ if depth == 0 => out.push(ch),
            _ => {}
        }
    }
    let lower = out.to_lowercase();
    let mut cleaned = out;
    for noise in [
        "official video",
        "official audio",
        "official music video",
        "lyric video",
        "lyrics",
        "visualizer",
        "resmi video",
        "klip",
        "prod.",
        "feat.",
        "ft.",
    ] {
        if let Some(pos) = lower.find(noise) {
            cleaned = cleaned.chars().take(pos).collect();
            break;
        }
    }
    cleaned
        .replace('"', " ")
        .replace('|', " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

#[tauri::command]
async fn fetch_lyrics(
    title: String,
    artist: String,
    duration_sec: Option<u32>,
) -> Result<LyricsResult, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mihon-Desktop/2.1.0 (https://github.com/ArtoMoon/Mihon)")
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let raw_title = title.trim();
    let raw_artist = artist
        .split([',', '&', '×', ';', '/'])
        .next()
        .unwrap_or(&artist)
        .trim();

    let clean_title = clean_lyrics_term(raw_title);
    let clean_artist = clean_lyrics_term(raw_artist);

    // Eğer başlıkta "Sanatçı - Şarkı" formatı varsa parçala
    let (parsed_artist, parsed_title) = if let Some((a, t)) = clean_title.split_once(" - ") {
        (a.trim().to_string(), t.trim().to_string())
    } else if let Some((a, t)) = clean_title.split_once(" – ") {
        (a.trim().to_string(), t.trim().to_string())
    } else {
        (clean_artist.clone(), clean_title.clone())
    };

    let queries = vec![
        format!("{parsed_artist} {parsed_title}"),
        format!("{clean_artist} {clean_title}"),
        parsed_title.clone(),
        raw_title.to_string(),
    ];

    let target_dur = duration_sec.unwrap_or(0) as i64;

    for q in queries {
        let q_trim = q.trim();
        if q_trim.is_empty() {
            continue;
        }
        let resp = client
            .get("https://lrclib.net/api/search")
            .query(&[("q", q_trim)])
            .send()
            .await;

        if let Ok(r) = resp {
            if r.status().is_success() {
                if let Ok(items) = r.json::<Vec<serde_json::Value>>().await {
                    let mut best: Option<(i64, LyricsResult)> = None;

                    for item in items {
                        let synced = item
                            .get("syncedLyrics")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .trim()
                            .to_string();
                        let plain = item
                            .get("plainLyrics")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .trim()
                            .to_string();

                        if synced.is_empty() && plain.is_empty() {
                            continue;
                        }

                        let t_name = item
                            .get("trackName")
                            .and_then(|v| v.as_str())
                            .unwrap_or(raw_title)
                            .to_string();
                        let a_name = item
                            .get("artistName")
                            .and_then(|v| v.as_str())
                            .unwrap_or(raw_artist)
                            .to_string();
                        let item_dur = item
                            .get("duration")
                            .and_then(|v| v.as_f64())
                            .unwrap_or(0.0) as i64;

                        let mut score: i64 = 0;
                        if !synced.is_empty() {
                            score += 100;
                        }
                        let a_low = a_name.to_lowercase();
                        if !parsed_artist.is_empty()
                            && (a_low.contains(&parsed_artist.to_lowercase())
                                || parsed_artist.to_lowercase().contains(&a_low))
                        {
                            score += 50;
                        }
                        let t_low = t_name.to_lowercase();
                        if !parsed_title.is_empty()
                            && (t_low.contains(&parsed_title.to_lowercase())
                                || parsed_title.to_lowercase().contains(&t_low))
                        {
                            score += 40;
                        }
                        if target_dur > 0 && item_dur > 0 {
                            let diff = (target_dur - item_dur).abs();
                            if diff <= 4 {
                                score += 35;
                            } else if diff <= 12 {
                                score += 15;
                            } else if diff > 45 {
                                score -= 25;
                            }
                        }

                        let candidate = LyricsResult {
                            synced_lyrics: synced,
                            plain_lyrics: plain,
                            track_name: t_name,
                            artist_name: a_name,
                            source: "LRCLIB".to_string(),
                        };

                        if best.as_ref().map(|(s, _)| score > *s).unwrap_or(true) {
                            best = Some((score, candidate));
                        }
                    }

                    if let Some((_, winner)) = best {
                        return Ok(winner);
                    }
                }
            }
        }
    }

    Err("Bu parça için şarkı sözü bulunamadı.".to_string())
}

#[tauri::command]
async fn install_update(app: AppHandle, download_url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    let url = if download_url.trim().is_empty() {
        format!("https://github.com/{DEFAULT_GITHUB_REPO}/releases/latest")
    } else {
        download_url.trim().to_string()
    };
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| format!("Güncelleme sayfası açılamadı: {e}"))?;
    Ok(())
}

#[cfg(target_os = "windows")]
fn start_windows_media_key_poller(app: AppHandle) {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetAsyncKeyState(vkey: i32) -> i16;
    }

    const VK_MEDIA_NEXT_TRACK: i32 = 0xB0;
    const VK_MEDIA_PREV_TRACK: i32 = 0xB1;
    const VK_MEDIA_STOP: i32 = 0xB2;
    const VK_MEDIA_PLAY_PAUSE: i32 = 0xB3;

    std::thread::spawn(move || {
        let mut prev_next = false;
        let mut prev_prev = false;
        let mut prev_stop = false;
        let mut prev_play = false;

        loop {
            std::thread::sleep(std::time::Duration::from_millis(45));
            unsafe {
                let is_next = (GetAsyncKeyState(VK_MEDIA_NEXT_TRACK) as u16 & 0x8000) != 0;
                let is_prev = (GetAsyncKeyState(VK_MEDIA_PREV_TRACK) as u16 & 0x8000) != 0;
                let is_stop = (GetAsyncKeyState(VK_MEDIA_STOP) as u16 & 0x8000) != 0;
                let is_play = (GetAsyncKeyState(VK_MEDIA_PLAY_PAUSE) as u16 & 0x8000) != 0;

                if is_next && !prev_next {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval(
                            "window.__mihonMediaKey && window.__mihonMediaKey('next')",
                        );
                    }
                }
                if is_prev && !prev_prev {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval(
                            "window.__mihonMediaKey && window.__mihonMediaKey('prev')",
                        );
                    }
                }
                if is_stop && !prev_stop {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval(
                            "window.__mihonMediaKey && window.__mihonMediaKey('stop')",
                        );
                    }
                }
                if is_play && !prev_play {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval(
                            "window.__mihonMediaKey && window.__mihonMediaKey('playpause')",
                        );
                    }
                }

                prev_next = is_next;
                prev_prev = is_prev;
                prev_stop = is_stop;
                prev_play = is_play;
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    eprintln!("[Helios] Starting...");
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            eprintln!("[Helios] Single-instance: another instance tried to start");
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.unminimize();
                let _ = w.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            eprintln!("[Mihon] Setup started");
            #[cfg(target_os = "windows")]
            start_windows_media_key_poller(app.handle().clone());

            if let Ok(exe) = std::env::current_exe() {
                if let Some(dir) = exe.parent() {
                    let _ = std::fs::remove_file(dir.join("Mihon.old.exe"));
                }
            }
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            search,
            prepare_track,
            cache_info,
            clear_cache,
            minimize_window,
            toggle_maximize,
            close_window,
            import_spotify,
            recommend_similar,
            update_discord_presence,
            clear_discord_presence,
            load_library,
            save_library,
            check_for_updates,
            install_update,
            fetch_lyrics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    eprintln!("[Helios] App exited normally");
}
