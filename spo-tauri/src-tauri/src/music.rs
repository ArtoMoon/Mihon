//! YouTube Music arama ve Akıllı Benzer Şarkı Radyo (RDAMVM) Servisi.

use serde::Serialize;
use serde_json::{Value, json};
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

const SEARCH_URL: &str = "https://music.youtube.com/youtubei/v1/search?alt=json&prettyPrint=false";
const NEXT_URL: &str = "https://music.youtube.com/youtubei/v1/next?alt=json&prettyPrint=false";
const CLIENT_VERSION: &str = "1.20241023.01.00";
const SONGS_FILTER: &str = "EgWKAQIIAWoMEA4QChADEAQQCRAF";

#[derive(Debug, Clone, Serialize)]
pub struct Track {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: String,
    pub duration_sec: u32,
    pub thumbnail: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct RecommendationResult {
    pub seed_title: String,
    pub seed_artist: String,
    pub detected_genre: String,
    pub algorithm_summary: String,
    pub tracks: Vec<Track>,
}

fn client() -> &'static reqwest::Client {
    static CLIENT: OnceLock<reqwest::Client> = OnceLock::new();
    CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36")
            .build()
            .expect("HTTP istemcisi olusturulamadi")
    })
}

pub async fn search(query: &str) -> Result<Vec<Track>, String> {
    let body = json!({
        "context": { "client": { "clientName": "WEB_REMIX", "clientVersion": CLIENT_VERSION, "hl": "tr", "gl": "TR" } },
        "query": query,
        "params": SONGS_FILTER,
    });

    let resp = client()
        .post(SEARCH_URL)
        .header("Origin", "https://music.youtube.com")
        .header("Referer", "https://music.youtube.com/")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ağ hatası: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("YouTube Music HTTP {}", resp.status()));
    }

    let data: Value = resp.json().await.map_err(|e| format!("Yanıt çözümlenemedi: {e}"))?;
    Ok(parse_results(&data))
}

/// YouTube Music `RDAMVM{video_id}` Akustik & İşbirlikçi Filtreleme Radyo Grafiğini çeker.
async fn fetch_radio_candidates(video_id: &str) -> Result<Vec<Track>, String> {
    let body = json!({
        "context": {
            "client": {
                "clientName": "WEB_REMIX",
                "clientVersion": CLIENT_VERSION,
                "hl": "tr",
                "gl": "TR"
            }
        },
        "videoId": video_id,
        "playlistId": format!("RDAMVM{video_id}"),
        "isAudioOnly": true
    });

    let resp = client()
        .post(NEXT_URL)
        .header("Origin", "https://music.youtube.com")
        .header("Referer", "https://music.youtube.com/")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Radyo ağ hatası: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("YouTube Music Next HTTP {}", resp.status()));
    }

    let data: Value = resp.json().await.map_err(|e| format!("Radyo yanıtı çözümlenemedi: {e}"))?;
    Ok(parse_radio_results(&data))
}

fn parse_radio_results(data: &Value) -> Vec<Track> {
    let contents = data
        .pointer("/contents/singleColumnMusicWatchNextResultsRenderer/tabbedRenderer/watchNextTabbedResultsRenderer/tabs/0/tabRenderer/content/musicQueueRenderer/content/playlistPanelRenderer/contents")
        .and_then(Value::as_array);

    let mut tracks = Vec::new();
    for item in contents.into_iter().flatten() {
        let Some(r) = item.get("playlistPanelVideoRenderer") else {
            continue;
        };
        let Some(id) = r.get("videoId").and_then(Value::as_str).map(String::from) else {
            continue;
        };
        let title = r
            .pointer("/title/runs")
            .and_then(Value::as_array)
            .map(|runs| {
                runs.iter()
                    .filter_map(|x| x.get("text").and_then(Value::as_str))
                    .collect::<Vec<_>>()
                    .concat()
            })
            .unwrap_or_default();
        if title.is_empty() {
            continue;
        }

        let byline = r
            .pointer("/longBylineText/runs")
            .or_else(|| r.pointer("/shortBylineText/runs"))
            .and_then(Value::as_array)
            .map(|runs| {
                runs.iter()
                    .filter_map(|x| x.get("text").and_then(Value::as_str))
                    .collect::<Vec<_>>()
                    .concat()
            })
            .unwrap_or_default();

        let parts: Vec<String> = byline.split(" • ").map(|s| s.trim().to_string()).collect();
        let artist = parts.first().cloned().unwrap_or_default();
        let album = if parts.len() >= 2 {
            parts[1].clone()
        } else {
            String::new()
        };

        let duration = r
            .pointer("/lengthText/runs/0/text")
            .and_then(Value::as_str)
            .unwrap_or("")
            .trim()
            .to_string();
        let duration_sec = parse_duration(&duration).unwrap_or(180);

        let thumbnail = r
            .pointer("/thumbnail/thumbnails")
            .and_then(Value::as_array)
            .and_then(|a| a.last())
            .and_then(|t| t.get("url"))
            .and_then(Value::as_str)
            .map(upscale_thumbnail)
            .filter(|u| !u.is_empty())
            .unwrap_or_else(|| format!("https://i.ytimg.com/vi/{id}/hqdefault.jpg"));

        tracks.push(Track {
            id,
            title,
            artist,
            album,
            duration,
            duration_sec,
            thumbnail,
        });
    }
    tracks
}

fn normalize_title_key(s: &str) -> String {
    s.to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric())
        .collect()
}

fn primary_artist_key(artist: &str) -> String {
    artist
        .split([',', '&', '•', '/'])
        .next()
        .unwrap_or(artist)
        .trim()
        .to_lowercase()
}

/// Aday parçaları RDAMVM akustik sırasını bozmadan sanatçı çeşitliliği (MMR) ile filtreler.
fn filter_and_diversify(
    seed_id: &str,
    seed_title: &str,
    exclude_ids: &[String],
    primary_radio: Vec<Track>,
    secondary_radio: Vec<Track>,
) -> Vec<Track> {
    let seed_title_norm = normalize_title_key(seed_title);

    let mut seen_ids = HashSet::new();
    let mut seen_titles = HashSet::new();
    if !seed_id.is_empty() {
        seen_ids.insert(seed_id.to_string());
    }
    if !seed_title_norm.is_empty() {
        seen_titles.insert(seed_title_norm);
    }
    for ex in exclude_ids {
        if !ex.is_empty() {
            seen_ids.insert(ex.clone());
            let norm = normalize_title_key(ex);
            if !norm.is_empty() {
                seen_titles.insert(norm);
            }
        }
    }

    let mut pool = Vec::new();
    for t in primary_radio.into_iter().chain(secondary_radio) {
        let t_norm = normalize_title_key(&t.title);
        if t.id.is_empty() || !seen_ids.insert(t.id.clone()) || !seen_titles.insert(t_norm) {
            continue;
        }
        if t.duration_sec > 0 && (t.duration_sec < 45 || t.duration_sec > 540) {
            continue;
        }
        pool.push(t);
    }

    // RDAMVM sırasını koruyarak aynı sanatçının arka arkaya gelmesini ve 2'den fazla tekrar etmesini önle
    let mut artist_counts: HashMap<String, usize> = HashMap::new();
    let mut result: Vec<Track> = Vec::with_capacity(30);
    let mut deferred: Vec<Track> = Vec::new();

    for t in pool {
        let a_key = primary_artist_key(&t.artist);
        let count = *artist_counts.get(&a_key).unwrap_or(&0);
        let same_as_last = result
            .last()
            .map(|last| primary_artist_key(&last.artist) == a_key)
            .unwrap_or(false);

        if count < 2 && !same_as_last {
            *artist_counts.entry(a_key).or_insert(0) += 1;
            result.push(t);
            if result.len() >= 30 {
                break;
            }
        } else if count < 3 {
            deferred.push(t);
        }
    }

    for t in deferred {
        if result.len() >= 30 {
            break;
        }
        result.push(t);
    }

    result
}

/// Tohum şarkıya (seed) göre aynı türde ve aynı atmosferde kesintisiz şarkılar önerir.
pub async fn recommend_similar(
    seed_id: &str,
    seed_title: &str,
    seed_artist: &str,
    _seed_duration_sec: u32,
    exclude_ids: &[String],
) -> Result<RecommendationResult, String> {
    // 1. Gerçek YouTube videoId'yi çözümle
    let resolved_vid = if seed_id.len() == 11 && !seed_id.starts_with("sp:") {
        seed_id.to_string()
    } else {
        let q = if !seed_artist.is_empty() && !seed_title.is_empty() {
            format!("{seed_artist} - {seed_title}")
        } else if let Some(stripped) = seed_id.strip_prefix("sp:") {
            stripped.to_string()
        } else {
            format!("{seed_title} {seed_artist}")
        };
        let found = search(&q).await?;
        found
            .into_iter()
            .next()
            .map(|t| t.id)
            .ok_or_else(|| "Öneri için kaynak şarkı çözümlenemedi.".to_string())?
    };

    // 2. Birincil RDAMVM Akustik Radyo Grafiğini çek
    let primary_radio = fetch_radio_candidates(&resolved_vid)
        .await
        .unwrap_or_default();

    // 3. Eğer çok sayıda şarkı daha önce çalındıysa (sonsuz akış ilerlediyse),
    //    birincil radyodaki ilk uygun komşu şarkıdan ikinci bir RDAMVM grafiği daha çek!
    let excluded_set: HashSet<&str> = exclude_ids.iter().map(|s| s.as_str()).collect();
    let hop_vid = primary_radio
        .iter()
        .skip(1)
        .find(|t| t.id != resolved_vid && !excluded_set.contains(t.id.as_str()))
        .or_else(|| primary_radio.get(1))
        .map(|t| t.id.clone());

    let secondary_radio = if let Some(hvid) = hop_vid {
        fetch_radio_candidates(&hvid).await.unwrap_or_default()
    } else {
        Vec::new()
    };

    let ranked = filter_and_diversify(
        &resolved_vid,
        seed_title,
        exclude_ids,
        primary_radio,
        secondary_radio,
    );

    if ranked.is_empty() {
        return Err("Bu parça için benzer şarkı bulunamadı.".into());
    }

    let clean_artist = seed_artist
        .split([',', '&', '•'])
        .next()
        .unwrap_or(seed_artist)
        .trim();
    let detected_genre = if !clean_artist.is_empty() {
        format!("{clean_artist} Radyosu")
    } else {
        "Benzer Frekans Radyosu".to_string()
    };

    Ok(RecommendationResult {
        seed_title: seed_title.to_string(),
        seed_artist: seed_artist.to_string(),
        detected_genre,
        algorithm_summary: format!("“{seed_title}” baz alınarak aynı atmosferdeki parçalar"),
        tracks: ranked,
    })
}

fn parse_results(data: &Value) -> Vec<Track> {
    let sections = data
        .pointer("/contents/tabbedSearchResultsRenderer/tabs/0/tabRenderer/content/sectionListRenderer/contents")
        .and_then(Value::as_array);

    let mut tracks = Vec::new();
    for section in sections.into_iter().flatten() {
        let Some(items) = section.pointer("/musicShelfRenderer/contents").and_then(Value::as_array) else {
            continue;
        };
        for item in items {
            if let Some(t) = item.get("musicResponsiveListItemRenderer").and_then(parse_item) {
                tracks.push(t);
            }
        }
    }
    tracks
}

fn column_runs(item: &Value, idx: usize) -> Vec<&str> {
    item.pointer(&format!("/flexColumns/{idx}/musicResponsiveListItemFlexColumnRenderer/text/runs"))
        .and_then(Value::as_array)
        .map(|runs| runs.iter().filter_map(|r| r.get("text").and_then(Value::as_str)).collect())
        .unwrap_or_default()
}

fn parse_duration(s: &str) -> Option<u32> {
    let mut total = 0u32;
    let mut parts = 0;
    for p in s.trim().split(':') {
        total = total * 60 + p.parse::<u32>().ok()?;
        parts += 1;
    }
    (parts >= 2).then_some(total)
}

fn parse_item(item: &Value) -> Option<Track> {
    let id = item.pointer("/playlistItemData/videoId").and_then(Value::as_str)?.to_string();
    let title = column_runs(item, 0).concat();
    if title.is_empty() {
        return None;
    }

    let meta = column_runs(item, 1).concat();
    let mut groups: Vec<String> = meta.split(" • ").map(|s| s.trim().to_string()).collect();

    let (duration, duration_sec) = match groups.last().and_then(|g| parse_duration(g)) {
        Some(sec) => (groups.pop().unwrap_or_default(), sec),
        None => (String::new(), 0),
    };
    let artist = groups.first().cloned().unwrap_or_default();
    let album = if groups.len() >= 2 { groups[1].clone() } else { String::new() };

    let thumbnail = item
        .pointer("/thumbnail/musicThumbnailRenderer/thumbnail/thumbnails")
        .and_then(Value::as_array)
        .and_then(|a| a.last())
        .and_then(|t| t.get("url"))
        .and_then(Value::as_str)
        .map(upscale_thumbnail)
        .filter(|u| !u.is_empty())
        .unwrap_or_else(|| format!("https://i.ytimg.com/vi/{id}/hqdefault.jpg"));

    Some(Track { id, title, artist, album, duration, duration_sec, thumbnail })
}

fn upscale_thumbnail(url: &str) -> String {
    match url.rfind("=w") {
        Some(pos) if url.contains("googleusercontent") || url.contains("ggpht") => {
            format!("{}=w544-h544-l90-rj", &url[..pos])
        }
        _ => url.to_string(),
    }
}
