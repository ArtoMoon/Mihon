//! Ses önbelleği ve hızlı akış: yt-dlp ile parçayı yerel diske en hızlı şekilde indirir,
//! aynı parçaya eşzamanlı yapılan istekleri tek bir indirmede birleştirir (in-flight deduplication).

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::{Mutex, OnceLock};
use tokio::process::Command;

const AUDIO_EXTS: [&str; 6] = ["webm", "opus", "m4a", "mp3", "ogg", "mp4"];

/// yt-dlp'nin nasıl çalıştırılacağı: (program, ön argümanlar)
type Launcher = (String, Vec<String>);

/// Aynı anda indirilen video ID'lerini takip eder (prefetch + tıklama çakışmasını önler)
fn inflight_set() -> &'static Mutex<HashSet<String>> {
    static INFLIGHT: OnceLock<Mutex<HashSet<String>>> = OnceLock::new();
    INFLIGHT.get_or_init(|| Mutex::new(HashSet::new()))
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

/// Sırasıyla dener: SPO_YTDLP ortam değişkeni → PATH'teki yt-dlp → `python -m yt_dlp`
async fn launcher() -> Result<&'static Launcher, String> {
    static LAUNCHER: OnceLock<Launcher> = OnceLock::new();
    if let Some(l) = LAUNCHER.get() {
        return Ok(l);
    }

    let mut candidates: Vec<Launcher> = Vec::new();
    if let Ok(custom) = std::env::var("SPO_YTDLP") {
        candidates.push((custom, vec![]));
    }
    candidates.push(("yt-dlp".into(), vec![]));
    candidates.push(("python".into(), vec!["-m".into(), "yt_dlp".into()]));
    candidates.push(("py".into(), vec!["-m".into(), "yt_dlp".into()]));

    for (prog, pre) in candidates {
        if works(&prog, &pre).await {
            return Ok(LAUNCHER.get_or_init(|| (prog, pre)));
        }
    }
    Err("yt-dlp bulunamadı. Kurulum: pip install yt-dlp".into())
}

fn find_cached(dir: &Path, id: &str) -> Option<PathBuf> {
    if let Some(found) = AUDIO_EXTS
        .iter()
        .map(|ext| dir.join(format!("{id}.{ext}")))
        .find(|p| std::fs::metadata(p).map(|m| m.len() > 10_000).unwrap_or(false))
    {
        return Some(found);
    }

    // Herhangi bir uzantıyla indirilmiş dosyayı da yakala ({id}.*)
    let prefix = format!("{id}.");
    std::fs::read_dir(dir)
        .ok()?
        .filter_map(Result::ok)
        .map(|e| e.path())
        .find(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|name| name.starts_with(&prefix) && !name.ends_with(".part"))
                .unwrap_or(false)
                && std::fs::metadata(p).map(|m| m.len() > 10_000).unwrap_or(false)
        })
}

/// Parçanın yerel dosya yolunu döndürür; önbellekte yoksa en hızlı ses akışını indirir.
pub async fn ensure_audio(cache_dir: &Path, id: &str) -> Result<PathBuf, String> {
    if !is_valid_video_id(id) {
        return Err("Geçersiz parça kimliği".into());
    }
    if let Some(p) = find_cached(cache_dir, id) {
        return Ok(p);
    }

    // Eğer aynı parça şu an arka planda (prefetch) indiriliyorsa bitmesini bekle
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
        for _ in 0..120 {
            tokio::time::sleep(std::time::Duration::from_millis(150)).await;
            if let Some(p) = find_cached(cache_dir, id) {
                return Ok(p);
            }
            if !inflight_set().lock().unwrap().contains(id) {
                break;
            }
        }
        if let Some(p) = find_cached(cache_dir, id) {
            return Ok(p);
        }
    }

    let result = download_audio_inner(cache_dir, id).await;
    inflight_set().lock().unwrap().remove(id);
    result
}

async fn download_audio_inner(cache_dir: &Path, id: &str) -> Result<PathBuf, String> {
    tokio::fs::create_dir_all(cache_dir)
        .await
        .map_err(|e| format!("Önbellek klasörü oluşturulamadı: {e}"))?;

    let (prog, pre) = launcher().await?;
    let out_tmpl = cache_dir.join(format!("{id}.%(ext)s"));
    let url = format!("https://www.youtube.com/watch?v={id}");

    // 1. Deneme: Yüksek ses dengeli m4a/webm akışı (format 140/251 öncelikli)
    let output = command(prog)
        .args(pre)
        .args([
            "-f",
            "140/251/ba[ext=m4a]/ba[ext=webm]/ba/b",
            "--concurrent-fragments",
            "4",
            "--no-playlist",
            "--no-part",
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
        if let Some(p) = find_cached(cache_dir, id) {
            return Ok(p);
        }
    }

    // 2. Yedek Deneme: Hiçbir format kısıtlaması olmadan (bazı kısıtlı/yeni yüklenen parçalar için)
    let fallback = command(prog)
        .args(pre)
        .args([
            "--no-playlist",
            "--no-part",
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

    if !fallback.status.success() {
        let err = String::from_utf8_lossy(&fallback.stderr);
        let last = err
            .lines()
            .rfind(|l| !l.trim().is_empty())
            .unwrap_or("bilinmeyen hata");
        return Err(format!("İndirme başarısız: {last}"));
    }

    find_cached(cache_dir, id).ok_or_else(|| "İndirilen dosya bulunamadı".into())
}

/// Önbellek boyutu (bayt) ve dosya sayısı.
pub fn cache_stats(dir: &Path) -> (u64, usize) {
    std::fs::read_dir(dir)
        .map(|rd| {
            rd.filter_map(Result::ok)
                .filter_map(|e| e.metadata().ok())
                .filter(|m| m.is_file())
                .fold((0, 0), |(size, n), m| (size + m.len(), n + 1))
        })
        .unwrap_or((0, 0))
}
