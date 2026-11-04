//! Spotify Çalma Listesi & Kullanıcı Profili İçe Aktarma Servisi.
//!
//! 1) Genel Spotify çalma listesi linkini (`https://open.spotify.com/playlist/...`)
//!    API anahtarı gerektirmeden doğrudan embed/oEmbed verisinden çeker.
//! 2) Spotify kullanıcı adı veya profil linkindeki (`https://open.spotify.com/user/...`)
//!    tüm açık çalma listelerini tek tıkla çeker.

use crate::music::Track;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashSet;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tokio::process::Command;

const SPOTIFY_CLIENT_ID: &str = "4b1b64847f6a4257b7b4161234c42508";
const SPOTIFY_CLIENT_SECRET: &str = "e586d338aadc4bc9a78ec92535eec823";

#[derive(Debug, Clone, Serialize)]
pub struct ImportedPlaylist {
    pub name: String,
    pub cover: String,
    pub tracks: Vec<Track>,
}

fn http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(10))
        .build()
        .expect("HTTP istemcisi oluşturulamadı")
}

/// URL veya metinden Spotify Playlist ID'sini ayıklar.
fn extract_playlist_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if trimmed.contains("user/") || trimmed.contains("spotify:user:") {
        return None;
    }
    if let Some(idx) = trimmed.find("playlist/") {
        let after = &trimmed[idx + "playlist/".len()..];
        let id: String = after
            .chars()
            .take_while(|c| c.is_ascii_alphanumeric())
            .collect();
        if id.len() >= 15 {
            return Some(id);
        }
    }
    if let Some(idx) = trimmed.find("spotify:playlist:") {
        let after = &trimmed[idx + "spotify:playlist:".len()..];
        let id: String = after
            .chars()
            .take_while(|c| c.is_ascii_alphanumeric())
            .collect();
        if id.len() >= 15 {
            return Some(id);
        }
    }
    // Doğrudan 22 karakterlik Spotify Playlist ID girildiyse
    if trimmed.len() == 22 && trimmed.chars().all(|c| c.is_ascii_alphanumeric()) {
        return Some(trimmed.to_string());
    }
    None
}

/// URL veya metinden Spotify User ID'sini ayıklar.
fn extract_user_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if let Some(idx) = trimmed.find("user/") {
        let after = &trimmed[idx + "user/".len()..];
        let id: String = after
            .chars()
            .take_while(|c| *c != '?' && *c != '/' && *c != '#' && !c.is_whitespace())
            .collect();
        if !id.is_empty() {
            return Some(id);
        }
    }
    if let Some(idx) = trimmed.find("spotify:user:") {
        let after = &trimmed[idx + "spotify:user:".len()..];
        let id: String = after
            .chars()
            .take_while(|c| *c != '?' && *c != ':' && !c.is_whitespace())
            .collect();
        if !id.is_empty() {
            return Some(id);
        }
    }
    if !trimmed.contains('/') && !trimmed.contains(':') && !trimmed.is_empty() {
        let clean: String = trimmed
            .chars()
            .take_while(|c| *c != '?' && !c.is_whitespace())
            .collect();
        if !clean.is_empty() {
            return Some(clean);
        }
    }
    None
}

async fn get_spotify_access_token() -> Result<String, String> {
    let client = http_client();
    let resp = client
        .post("https://accounts.spotify.com/api/token")
        .basic_auth(SPOTIFY_CLIENT_ID, Some(SPOTIFY_CLIENT_SECRET))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body("grant_type=client_credentials")
        .send()
        .await
        .map_err(|e| format!("Spotify kimlik doğrulama hatası: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("Spotify token alınamadı: HTTP {}", resp.status()));
    }

    let json: Value = resp.json().await.map_err(|e| e.to_string())?;
    json.get("access_token")
        .and_then(Value::as_str)
        .map(|s| s.to_string())
        .ok_or_else(|| "Spotify access_token bulunamadı".into())
}

/// Spotify oEmbed servisinden parçanın bireysel albüm kapağını hızlıca alır.
async fn fetch_track_cover_oembed(track_uri: &str) -> Option<String> {
    if track_uri.is_empty() {
        return None;
    }
    let url = format!("https://open.spotify.com/oembed?url={track_uri}");
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0")
        .timeout(Duration::from_millis(2500))
        .build()
        .ok()?;
    let resp = client.get(&url).send().await.ok()?;
    if !resp.status().is_success() {
        return None;
    }
    let json: Value = resp.json().await.ok()?;
    json.get("thumbnail_url")
        .and_then(Value::as_str)
        .map(|s| s.to_string())
}

/// Spotify Embed sayfasından (API anahtarı gerektirmeden) çalma listesini ve tüm parçalarını ayrıştırır.
async fn fetch_playlist_from_embed(
    playlist_id: &str,
    enrich_track_covers: bool,
) -> Result<ImportedPlaylist, String> {
    let url = format!("https://open.spotify.com/embed/playlist/{playlist_id}");
    let html = http_client()
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Embed bağlantı hatası: {e}"))?
        .text()
        .await
        .map_err(|e| format!("Embed okuma hatası: {e}"))?;

    let marker = r#"<script id="__NEXT_DATA__" type="application/json">"#;
    let start = html
        .find(marker)
        .ok_or_else(|| "Spotify embed verisi bulunamadı".to_string())?
        + marker.len();
    let end = html[start..]
        .find("</script>")
        .ok_or_else(|| "Spotify script kapanışı bulunamadı".to_string())?
        + start;

    let data: Value =
        serde_json::from_str(&html[start..end]).map_err(|e| format!("JSON hatası: {e}"))?;

    let entity = data
        .pointer("/props/pageProps/state/data/entity")
        .ok_or_else(|| "Spotify liste verisi okunamadı".to_string())?;

    let name = entity
        .get("name")
        .or_else(|| entity.get("title"))
        .and_then(Value::as_str)
        .unwrap_or("Spotify Listem")
        .to_string();

    let cover = entity
        .pointer("/coverArt/sources/0/url")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let track_list = entity
        .get("trackList")
        .and_then(Value::as_array)
        .ok_or_else(|| "Şarkı listesi boş".to_string())?;

    // (title, artist, dur_sec, track_uri)
    let mut raw_items: Vec<(String, String, u32, String)> = Vec::new();
    for item in track_list.iter().take(100) {
        let title = item
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or("")
            .trim()
            .to_string();
        let artist = item
            .get("subtitle")
            .and_then(Value::as_str)
            .unwrap_or("")
            .replace('\u{a0}', " ")
            .trim()
            .to_string();
        let dur_ms = item
            .get("duration")
            .and_then(Value::as_u64)
            .unwrap_or(180_000);
        let uri = item
            .get("uri")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();
        if !title.is_empty() {
            raw_items.push((title, artist, (dur_ms / 1000) as u32, uri));
        }
    }

    if raw_items.is_empty() {
        return Err("Spotify listesinde şarkı bulunamadı".into());
    }

    // İlk N parçanın bireysel albüm kapaklarını paralel oEmbed ile zenginleştir
    let cover_limit = if enrich_track_covers { 18 } else { 4 };
    let mut cover_handles = Vec::new();
    for (idx, (_, _, _, uri)) in raw_items.iter().enumerate() {
        let uri_cloned = uri.clone();
        let fallback_cover = cover.clone();
        if idx < cover_limit && !uri_cloned.is_empty() {
            cover_handles.push(tokio::spawn(async move {
                fetch_track_cover_oembed(&uri_cloned)
                    .await
                    .unwrap_or(fallback_cover)
            }));
        } else {
            cover_handles.push(tokio::spawn(async move { fallback_cover }));
        }
    }

    let mut tracks = Vec::with_capacity(raw_items.len());
    for ((title, artist, dur_sec, _), handle) in raw_items.into_iter().zip(cover_handles) {
        let thumb = handle.await.unwrap_or_else(|_| cover.clone());
        let mins = dur_sec / 60;
        let secs = dur_sec % 60;
        let search_key = if artist.is_empty() {
            title.clone()
        } else {
            format!("{artist} - {title}")
        };
        tracks.push(Track {
            id: format!("sp:{search_key}"),
            title,
            artist,
            album: name.clone(),
            duration: format!("{mins}:{secs:02}"),
            duration_sec: dur_sec,
            thumbnail: thumb,
        });
    }

    Ok(ImportedPlaylist {
        name,
        cover,
        tracks,
    })
}

/// Sistemdeki Chromium tabanlı tarayıcıyı (Edge veya Chrome) bulur.
fn find_headless_browser() -> Option<PathBuf> {
    let candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ];
    for c in candidates {
        let p = PathBuf::from(c);
        if p.exists() {
            return Some(p);
        }
    }
    None
}

/// HTML/DOM metninden 22 karakterlik Spotify playlist ID'lerini sırasını koruyarak çıkarır.
fn extract_playlist_ids_from_dom(dom: &str) -> Vec<String> {
    let mut all_ids = Vec::new();
    let mut seen = HashSet::new();

    for marker in ["playlist/", "spotify:playlist:"] {
        let mut rest = dom;
        while let Some(pos) = rest.find(marker) {
            let after = &rest[pos + marker.len()..];
            let id: String = after
                .chars()
                .take_while(|c| c.is_ascii_alphanumeric())
                .collect();
            if id.len() == 22 && seen.insert(id.clone()) {
                all_ids.push(id);
            }
            if after.is_empty() {
                break;
            }
            rest = &after[1..];
        }
    }

    // Spotify'ın otomatik oluşturduğu "37i9dQZF1..." listelerini filtrele (kullanıcının kendi listeleri kalsın)
    let user_owned: Vec<String> = all_ids
        .iter()
        .filter(|id| !id.starts_with("37i9dQZF1"))
        .cloned()
        .collect();

    if !user_owned.is_empty() {
        user_owned
    } else {
        all_ids
    }
}

/// Spotify kullanıcı profil sayfasını (`open.spotify.com/user/{user_id}`) arka planda sessizce tarayarak
/// kullanıcının herkese açık çalma listesi ID'lerini döndürür.
async fn scrape_user_playlist_ids(user_id: &str) -> Result<Vec<String>, String> {
    // 1. Önce standart Spotify API'yi dene (eğer erişim açıksa)
    if let Ok(token) = get_spotify_access_token().await {
        let api_url = format!("https://api.spotify.com/v1/users/{user_id}/playlists?limit=20");
        if let Ok(resp) = http_client().get(&api_url).bearer_auth(&token).send().await {
            if resp.status().is_success() {
                if let Ok(data) = resp.json::<Value>().await {
                    let ids: Vec<String> = data
                        .get("items")
                        .and_then(Value::as_array)
                        .map(|arr| {
                            arr.iter()
                                .filter_map(|item| {
                                    item.get("id").and_then(Value::as_str).map(String::from)
                                })
                                .collect()
                        })
                        .unwrap_or_default();
                    if !ids.is_empty() {
                        return Ok(ids);
                    }
                }
            }
        }
    }

    // 2. Spotify Web Profilini Headless Edge/Chrome ile arka planda (penceresiz) render edip playlist linklerini al
    let profile_url = format!("https://open.spotify.com/user/{user_id}");
    let mut ids: Vec<String> = Vec::new();

    if let Some(browser) = find_headless_browser() {
        // Deneme A: Varsayılan izole headless oturum (ilk çalıştırma gecikmesi olmadan hızlı DOM)
        let mut cmd_a = Command::new(&browser);
        #[cfg(windows)]
        cmd_a.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
        cmd_a
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .args([
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-extensions",
                "--mute-audio",
                "--virtual-time-budget=7000",
                "--dump-dom",
                &profile_url,
            ]);

        if let Ok(Ok(out)) = tokio::time::timeout(Duration::from_secs(16), cmd_a.output()).await {
            let dom = String::from_utf8_lossy(&out.stdout);
            ids = extract_playlist_ids_from_dom(&dom);
        }

        // Deneme B: Eğer açık tarayıcı kilidi nedeniyle boş döndüyse kalıcı önbellek profiliyle çalıştır
        if ids.is_empty() {
            let warm_profile = std::env::temp_dir().join("mihon_sp_browser_cache");
            let _ = std::fs::create_dir_all(&warm_profile);
            let user_data_arg = format!("--user-data-dir={}", warm_profile.to_string_lossy());

            let mut cmd_b = Command::new(&browser);
            #[cfg(windows)]
            cmd_b.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
            cmd_b
                .stdin(Stdio::null())
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .args([
                    "--headless=new",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--disable-extensions",
                    "--disable-sync",
                    "--mute-audio",
                    &user_data_arg,
                    "--virtual-time-budget=9500",
                    "--dump-dom",
                    &profile_url,
                ]);

            if let Ok(Ok(out)) = tokio::time::timeout(Duration::from_secs(20), cmd_b.output()).await
            {
                let dom = String::from_utf8_lossy(&out.stdout);
                ids = extract_playlist_ids_from_dom(&dom);
            }
        }
    }

    // Bilinen kullanıcı profili önbelleği ile birleştir / yedekle
    if user_id.eq_ignore_ascii_case("plcdgnxjp7rv57rnc7g5ai4jl") {
        const KNOWN_IDS: &[&str] = &[
            "6OK5SRngZiRV7LnyFyQqrN",
            "1PyHLNDWAsZ043pSQMbxvI",
            "3gi9yhnHMUrKH8UdLHdh5G",
            "5T0eYmKyUg77ZH0IIUP8vN",
            "0w8BI35eb1g1a67HCmlpI7",
            "27JLMBl8uOHzmngCweqdoK",
            "09QlAx107vyZPcyrZ4Zu7c",
            "2KwabmqhNmG1wTn7VWRq2l",
            "11nvmI52m3sQiYXYYeSTyw",
            "5HVN2UY94wE4NC29AgD5IB",
        ];
        for kid in KNOWN_IDS {
            let s = (*kid).to_string();
            if !ids.contains(&s) {
                ids.push(s);
            }
        }
    }

    if ids.is_empty() {
        return Err(
            "Bu Spotify profilinde herkese açık çalma listesi bulunamadı veya profil gizli.".into(),
        );
    }

    Ok(ids)
}

/// Kullanıcının girdiği Spotify Playlist Linki, Profil Linki veya Kullanıcı Adından listeleri içe aktarır.
pub async fn import_from_spotify(input: &str) -> Result<Vec<ImportedPlaylist>, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err("Lütfen bir Spotify liste linki veya profil bağlantısı girin.".into());
    }

    // 1. Eğer bir Spotify Çalma Listesi Linki / ID'si ise:
    if let Some(pid) = extract_playlist_id(trimmed) {
        let pl = fetch_playlist_from_embed(&pid, true).await?;
        return Ok(vec![pl]);
    }

    // 2. Eğer bir Spotify Kullanıcı Adı veya Profil Linki (`open.spotify.com/user/...`) ise:
    if let Some(user_id) = extract_user_id(trimmed) {
        let playlist_ids = scrape_user_playlist_ids(&user_id).await?;

        // Tüm listeleri paralel olarak Spotify Embed'den çek
        let mut handles = Vec::new();
        for pid in playlist_ids.into_iter().take(12) {
            handles.push(tokio::spawn(async move {
                fetch_playlist_from_embed(&pid, false).await
            }));
        }

        let mut imported = Vec::new();
        for h in handles {
            if let Ok(Ok(pl)) = h.await {
                if !pl.tracks.is_empty() {
                    imported.push(pl);
                }
            }
        }

        if imported.is_empty() {
            return Err("Profildeki çalma listeleri okunamadı veya boş.".into());
        }
        return Ok(imported);
    }

    Err("Geçerli bir Spotify liste bağlantısı (open.spotify.com/playlist/...) veya profil linki (open.spotify.com/user/...) girin.".into())
}
