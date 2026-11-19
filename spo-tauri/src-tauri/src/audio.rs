//! Ses önbelleği ve hızlı akış: yt-dlp ile parçayı geçici (`.tmp`) dizine indirip
//! yalnızca indirme %100 başarıyla tamamlandığında atomik olarak önbelleğe taşır.
//! Böylece yarım inmiş / bozuk dosyalar asla önbelleğe girmez.

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Mutex, OnceLock};
use tokio::process::Command;

const AUDIO_EXTS: [&str; 6] = ["webm", "opus", "m4a", "mp3", "ogg", "mp4"];
static DOWNLOAD_NONCE: AtomicU64 = AtomicU64::new(1);

/// yt-dlp'nin nasıl çalıştırılacağı: (program, ön argümanlar)
type Launcher = (String, Vec<String>);

/// Aynı anda indirilen video ID'lerini takip eder (prefetch + tıklama çakışmasını önler)
fn inflight_set() -> &'static Mutex<HashSet<String>> {
    static INFLIGHT: OnceLock<Mutex<HashSet<String>>> = OnceLock::new();
    INFLIGHT.get_or_init(|| Mutex::new(HashSet::new()))
}

struct InflightGuard(String);
impl Drop for InflightGuard {
    fn drop(&mut self) {
        if let Ok(mut set) = inflight_set().lock() {
            set.remove(&self.0);
        }
    }
}

/// Video kimliği yalnızca güvenli karakterler içermelidir (argüman enjeksiyonunu önler).
pub fn is_valid_video_id(id: &str) -> bool {
    (6..=20).contains(&id.len())
        && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

fn command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(windows)]
    cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW: konsol penceresi açılmasın
    cmd.stdin(Stdio::null());
    cmd
}

async fn works(program: &str, pre: &[String]) -> bool {
    command(program)
        .args(pre)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .await
        .map(|s| s.success())
        .unwrap_or(false)
}

fn ytdlp_download_lock() -> &'static tokio::sync::Mutex<()> {
    static LOCK: OnceLock<tokio::sync::Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| tokio::sync::Mutex::new(()))
}

async fn ensure_managed_ytdlp(cache_dir: &Path) -> Result<PathBuf, String> {
    let bin_dir = cache_dir
        .parent()
        .unwrap_or(cache_dir)
        .join("bin");
    let exe_name = if cfg!(windows) { "yt-dlp.exe" } else { "yt-dlp" };
    let target = bin_dir.join(exe_name);

    if target.exists() && std::fs::metadata(&target).map(|m| m.len() > 2_000_000).unwrap_or(false) {
        return Ok(target);
    }

    let _guard = ytdlp_download_lock().lock().await;
    if target.exists() && std::fs::metadata(&target).map(|m| m.len() > 2_000_000).unwrap_or(false) {
        return Ok(target);
    }

    tokio::fs::create_dir_all(&bin_dir)
        .await
        .map_err(|e| format!("bin klasörü oluşturulamadı: {e}"))?;

    let url = if cfg!(windows) {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    } else {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(90))
        .user_agent("Mihon-Player/2.1.0")
        .build()
        .map_err(|e| format!("HTTP istemci hatası: {e}"))?;

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Ses motoru (yt-dlp) indirilemedi: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("Ses motoru indirme hatası: HTTP {}", resp.status()));
    }

    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Ses motoru okunamadı: {e}"))?;

    if bytes.len() < 2_000_000 {
        return Err("İndirilen ses motoru dosyası eksik".into());
    }

    let tmp = bin_dir.join(format!("{exe_name}.tmp"));
    tokio::fs::write(&tmp, &bytes)
        .await
        .map_err(|e| format!("Ses motoru yazılamadı: {e}"))?;

    tokio::fs::rename(&tmp, &target)
        .await
        .map_err(|e| format!("Ses motoru taşınamadı: {e}"))?;

    Ok(target)
}

/// Sırasıyla dener: SPO_YTDLP → yönetilen bin/yt-dlp.exe → PATH'teki yt-dlp → `python -m yt_dlp` → otomatik indirir
async fn launcher(cache_dir: &Path) -> Result<&'static Launcher, String> {
    static LAUNCHER: OnceLock<Launcher> = OnceLock::new();
    if let Some(l) = LAUNCHER.get() {
        return Ok(l);
    }

    let mut candidates: Vec<Launcher> = Vec::new();
    if let Ok(custom) = std::env::var("SPO_YTDLP") {
        candidates.push((custom, vec![]));
    }
    let managed_path = cache_dir
        .parent()
        .unwrap_or(cache_dir)
        .join("bin")
        .join(if cfg!(windows) { "yt-dlp.exe" } else { "yt-dlp" });
    if managed_path.exists() {
        candidates.push((managed_path.to_string_lossy().into_owned(), vec![]));
    }
    candidates.push(("yt-dlp".into(), vec![]));
    candidates.push(("python".into(), vec!["-m".into(), "yt_dlp".into()]));
    candidates.push(("py".into(), vec!["-m".into(), "yt_dlp".into()]));

    for (prog, pre) in candidates {
        if works(&prog, &pre).await {
            return Ok(LAUNCHER.get_or_init(|| (prog, pre)));
        }
    }

    // Hiçbir bilgisayarda Python/yt-dlp kurulu olmasa bile otomatik olarak resmi yt-dlp.exe indir!
    let downloaded = ensure_managed_ytdlp(cache_dir).await?;
    let prog = downloaded.to_string_lossy().into_owned();
    if works(&prog, &[]).await {
        return Ok(LAUNCHER.get_or_init(|| (prog, vec![])));
    }
    Err("Ses motoru (yt-dlp) başlatılamadı".into())
}

/// Uygulama açıldığında arka planda ses motorunu (yt-dlp) hazırlar.
pub async fn warmup_launcher(cache_dir: &Path) {
    let _ = launcher(cache_dir).await;
}

fn find_cached(dir: &Path, id: &str) -> Option<PathBuf> {
    if let Some(found) = AUDIO_EXTS
        .iter()
        .map(|ext| dir.join(format!("{id}.{ext}")))
        .find(|p| std::fs::metadata(p).map(|m| m.len() > 16_384).unwrap_or(false))
    {
        touch_file(&found);
        return Some(found);
    }

    // Herhangi bir uzantıyla tamamlanmış dosyayı da yakala ({id}.*), ancak .part/.ytdl/.tmp hariç
    let prefix = format!("{id}.");
    let found = std::fs::read_dir(dir)
        .ok()?
        .filter_map(Result::ok)
        .map(|e| e.path())
        .find(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|name| {
                    name.starts_with(&prefix)
                        && !name.ends_with(".part")
                        && !name.ends_with(".ytdl")
                        && !name.ends_with(".tmp")
                })
                .unwrap_or(false)
                && std::fs::metadata(p).map(|m| m.len() > 16_384).unwrap_or(false)
        });
    if let Some(ref p) = found {
        touch_file(p);
    }
    found
}

/// Bozuk veya yarım inmiş eski bir önbellek dosyasını diskten temizler.
pub fn invalidate_cached(dir: &Path, id: &str) {
    if !is_valid_video_id(id) {
        return;
    }
    let prefix = format!("{id}.");
    if let Ok(rd) = std::fs::read_dir(dir) {
        for entry in rd.filter_map(Result::ok) {
            let path = entry.path();
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.starts_with(&prefix) {
                    let _ = std::fs::remove_file(&path);
                }
            }
        }
    }
}

fn touch_file(path: &Path) {
    if let Ok(file) = std::fs::OpenOptions::new().write(true).open(path) {
        let _ = file.set_modified(std::time::SystemTime::now());
    }
}

/// Akıllı LRU (En Eski Kullanılanları ve Dev Video Dosyalarını Otomatik Temizleyen) Önbellek Yöneticisi
/// Maksimum 350 MB sınırını korur ve eskiden kalma >3.5 MB video/yüksek boyutlu dosyaları otomatik temizler.
const MAX_CACHE_BYTES: u64 = 350 * 1024 * 1024; // 350 MB tavan sınır
const OVERSIZED_FILE_BYTES: u64 = 3_500_000; // 3.5 MB üstü eski video/yüksek bitrate dosyaları

pub fn enforce_cache_limit(dir: &Path, keep_id: Option<&str>) {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return;
    };

    let active_ids: HashSet<String> = inflight_set()
        .lock()
        .map(|s| s.clone())
        .unwrap_or_default();

    // `.tmp` içindeki 5 dakikadan eski yarım kalmış geçici dosyaları güvenle temizle
    let tmp_dir = dir.join(".tmp");
    if let Ok(tmp_rd) = std::fs::read_dir(&tmp_dir) {
        let now = std::time::SystemTime::now();
        for entry in tmp_rd.filter_map(Result::ok) {
            let path = entry.path();
            if let Ok(meta) = entry.metadata() {
                let age = meta
                    .modified()
                    .ok()
                    .and_then(|m| now.duration_since(m).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0);
                if age > 300 {
                    let _ = std::fs::remove_file(&path);
                }
            }
        }
    }

    let keep_prefix = keep_id.map(|id| format!("{id}."));
    let mut entries: Vec<(PathBuf, u64, std::time::SystemTime)> = Vec::new();
    let mut total_bytes: u64 = 0;

    for entry in rd.filter_map(Result::ok) {
        let path = entry.path();
        let Ok(meta) = entry.metadata() else {
            continue;
        };
        if !meta.is_file() {
            continue;
        }
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default();
        let file_id = name.split('.').next().unwrap_or_default();
        let is_active = active_ids.contains(file_id);
        let is_kept = keep_prefix
            .as_ref()
            .is_some_and(|kp| name.starts_with(kp))
            || is_active;

        let len = meta.len();
        // Aktif olmayan yarım kalmış (.part/.ytdl) veya eski dev video (>3.5 MB) dosyalarını temizle
        if !is_kept
            && (len > OVERSIZED_FILE_BYTES
                || name.ends_with(".part")
                || name.ends_with(".ytdl"))
        {
            let _ = std::fs::remove_file(&path);
            continue;
        }

        let modified = meta.modified().unwrap_or(std::time::UNIX_EPOCH);
        total_bytes += len;
        entries.push((path, len, modified));
    }

    if total_bytes <= MAX_CACHE_BYTES {
        return;
    }

    // En eski dinlenen şarkılardan başlayarak sırala (LRU)
    entries.sort_by_key(|(_, _, modified)| *modified);

    for (path, len, _) in entries {
        if total_bytes <= MAX_CACHE_BYTES {
            break;
        }
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default();
        let file_id = name.split('.').next().unwrap_or_default();
        if active_ids.contains(file_id) {
            continue;
        }
        if let Some(ref kp) = keep_prefix {
            if name.starts_with(kp) {
                continue;
            }
        }
        if std::fs::remove_file(&path).is_ok() {
            total_bytes = total_bytes.saturating_sub(len);
        }
    }
}

/// Parçanın yerel dosya yolunu döndürür; önbellekte yoksa atomik olarak tam indirir.
pub async fn ensure_audio(cache_dir: &Path, id: &str) -> Result<PathBuf, String> {
    if !is_valid_video_id(id) {
        return Err("Geçersiz parça kimliği".into());
    }
    if let Some(p) = find_cached(cache_dir, id) {
        return Ok(p);
    }

    // Eğer aynı parça şu an arka planda (prefetch) indiriliyorsa, indirme %100 bitene kadar bekle
    let already_downloading = {
        let mut set = inflight_set().lock().unwrap();
        if set.contains(id) {
            true
        } else {
            set.insert(id.to_string());
            false
        }
    };

    if already_downloading {
        for _ in 0..400 {
            tokio::time::sleep(std::time::Duration::from_millis(150)).await;
            let still_running = inflight_set()
                .lock()
                .map(|s| s.contains(id))
                .unwrap_or(false);
            if !still_running {
                break;
            }
        }
        if let Some(p) = find_cached(cache_dir, id) {
            return Ok(p);
        }
        // Önceki indirme başarısız olduysa yeniden kendimiz devralalım
        let mut set = inflight_set().lock().unwrap();
        if !set.contains(id) {
            set.insert(id.to_string());
        } else {
            return Err("Parça indirilemedi, lütfen tekrar deneyin".into());
        }
    }

    let _guard = InflightGuard(id.to_string());
    download_audio_inner(cache_dir, id).await
}

fn cleanup_staging(tmp_dir: &Path, stem: &str) {
    let prefix = format!("{stem}.");
    if let Ok(rd) = std::fs::read_dir(tmp_dir) {
        for entry in rd.filter_map(Result::ok) {
            let p = entry.path();
            if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                if name.starts_with(&prefix) {
                    let _ = std::fs::remove_file(&p);
                }
            }
        }
    }
}

fn find_staged_complete(tmp_dir: &Path, stem: &str) -> Option<PathBuf> {
    let prefix = format!("{stem}.");
    std::fs::read_dir(tmp_dir)
        .ok()?
        .filter_map(Result::ok)
        .map(|e| e.path())
        .find(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|name| {
                    name.starts_with(&prefix)
                        && !name.ends_with(".part")
                        && !name.ends_with(".ytdl")
                })
                .unwrap_or(false)
                && std::fs::metadata(p).map(|m| m.len() > 16_384).unwrap_or(false)
        })
}

fn promote_staged_file(staged: &Path, cache_dir: &Path, id: &str) -> Result<PathBuf, String> {
    let ext = staged
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("webm");
    let final_path = cache_dir.join(format!("{id}.{ext}"));
    // Varsa eski bozuk/yarım dosyayı temizle
    invalidate_cached(cache_dir, id);
    match std::fs::rename(staged, &final_path) {
        Ok(()) => {
            touch_file(&final_path);
            Ok(final_path)
        }
        Err(_) => {
            // Farklı disk/kilit ihtimaline karşı kopyala + sil yedeklemesi
            std::fs::copy(staged, &final_path)
                .map_err(|e| format!("Dosya önbelleğe taşınamadı: {e}"))?;
            let _ = std::fs::remove_file(staged);
            touch_file(&final_path);
            Ok(final_path)
        }
    }
}

async fn download_audio_inner(cache_dir: &Path, id: &str) -> Result<PathBuf, String> {
    tokio::fs::create_dir_all(cache_dir)
        .await
        .map_err(|e| format!("Önbellek klasörü oluşturulamadı: {e}"))?;

    let tmp_dir = cache_dir.join(".tmp");
    tokio::fs::create_dir_all(&tmp_dir)
        .await
        .map_err(|e| format!("Geçici indirme klasörü oluşturulamadı: {e}"))?;

    let (prog, pre) = launcher(cache_dir).await?;
    let nonce = DOWNLOAD_NONCE.fetch_add(1, Ordering::Relaxed);
    let stem = format!("{id}_{nonce}");
    let out_tmpl = tmp_dir.join(format!("{stem}.%(ext)s"));
    let url = format!("https://www.youtube.com/watch?v={id}");

    // 1. Deneme: Atomik geçici klasörde, .part korumalı ve otomatik yeniden denemeli (retries) indirme
    // ASLA `--no-part` kullanılmaz; indirme %100 bitmeden ana önbelleğe taşınmaz!
    let output = command(prog)
        .args(pre)
        .args([
            "--extractor-args",
            "youtube:player_client=android,ios,web",
            "-f",
            "600/249/139/599/250/ba[abr<=70]/ba/b",
            "-S",
            "+size,+abr",
            "--concurrent-fragments",
            "4",
            "--retries",
            "6",
            "--fragment-retries",
            "6",
            "--retry-sleep",
            "1",
            "--no-continue",
            "--no-playlist",
            "--no-mtime",
            "--quiet",
            "--no-warnings",
            "-o",
        ])
        .arg(&out_tmpl)
        .arg(&url)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("yt-dlp çalıştırılamadı: {e}"))?;

    if output.status.success() {
        if let Some(staged) = find_staged_complete(&tmp_dir, &stem) {
            let final_path = promote_staged_file(&staged, cache_dir, id)?;
            cleanup_staging(&tmp_dir, &stem);
            enforce_cache_limit(cache_dir, Some(id));
            return Ok(final_path);
        }
    }
    cleanup_staging(&tmp_dir, &stem);

    // 2. Yedek Deneme: Tek iş parçacıklı kararlı ses akışı (parçalanma/fragment kopmalarını önler)
    let fallback_stem = format!("{id}_{nonce}_fb");
    let fallback_tmpl = tmp_dir.join(format!("{fallback_stem}.%(ext)s"));
    let fallback = command(prog)
        .args(pre)
        .args([
            "--extractor-args",
            "youtube:player_client=android,ios,web",
            "-f",
            "ba/worst",
            "-S",
            "+size",
            "--retries",
            "6",
            "--fragment-retries",
            "6",
            "--retry-sleep",
            "1",
            "--no-continue",
            "--no-playlist",
            "--no-mtime",
            "--quiet",
            "--no-warnings",
            "-o",
        ])
        .arg(&fallback_tmpl)
        .arg(&url)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("yt-dlp çalıştırılamadı: {e}"))?;

    if !fallback.status.success() {
        cleanup_staging(&tmp_dir, &fallback_stem);
        let err = String::from_utf8_lossy(&fallback.stderr);
        let last = err
            .lines()
            .rfind(|l| !l.trim().is_empty())
            .unwrap_or("bilinmeyen hata");
        return Err(format!("İndirme başarısız: {last}"));
    }

    let staged = find_staged_complete(&tmp_dir, &fallback_stem).ok_or_else(|| {
        cleanup_staging(&tmp_dir, &fallback_stem);
        "İndirilen dosya tamamlanamadı".to_string()
    })?;
    let final_path = promote_staged_file(&staged, cache_dir, id)?;
    cleanup_staging(&tmp_dir, &fallback_stem);
    enforce_cache_limit(cache_dir, Some(id));
    Ok(final_path)
}

/// Önbellek boyutu (bayt) ve dosya sayısı. Her sorguda otomatik olarak 350 MB sınırını ve dev video dosyalarını temizler.
pub fn cache_stats(dir: &Path) -> (u64, usize) {
    enforce_cache_limit(dir, None);
    std::fs::read_dir(dir)
        .map(|rd| {
            rd.filter_map(Result::ok)
                .filter_map(|e| e.metadata().ok())
                .filter(|m| m.is_file())
                .fold((0, 0), |(size, n), m| (size + m.len(), n + 1))
        })
        .unwrap_or((0, 0))
}
