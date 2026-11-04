"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Plus,
  Trash2,
  Search,
  Compass,
  Clock,
  ListMusic,
  Volume2,
  Volume1,
  VolumeX,
  Sparkles,
  Flame,
  Disc3,
  Radio,
  Headphones,
  Music2,
  Zap,
  Check,
  X,
  Gauge,
  FolderPlus,
  HardDrive,
  ChevronRight,
  Minus,
  Square,
  ListPlus,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

// ============================================================================
// Ana Sayfa Koleksiyon Kartları (Solda değil, doğrudan Ana Sayfada!)
// ============================================================================
const COLLECTIONS = [
  {
    id: "global-hits",
    title: "Global Hit 2026",
    subtitle: "Dünya çapında zirvedeki parçalar",
    query: "top global hits 2026",
    gradient: "from-orange-500 via-rose-600 to-purple-800",
    badge: "TREND #1",
    icon: Flame,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
  },
  {
    id: "tr-pop",
    title: "Türkçe Pop & Hit",
    subtitle: "Yerli sahnenin en çok dinlenenleri",
    query: "türkçe pop hit şarkılar 2026",
    gradient: "from-rose-500 via-pink-600 to-indigo-800",
    badge: "POPÜLER",
    icon: Sparkles,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  },
  {
    id: "synthwave",
    title: "Nightdrive Synthwave",
    subtitle: "Gece sürüşü, neon ve retro-fütürizm",
    query: "synthwave retrowave nightdrive mix",
    gradient: "from-fuchsia-600 via-purple-700 to-slate-900",
    badge: "NEON",
    icon: Zap,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
  },
  {
    id: "lofi-focus",
    title: "Lo-Fi Derin Odak",
    subtitle: "Kodlama ve çalışma için pürüzsüz ritimler",
    query: "lofi hip hop chill beats study",
    gradient: "from-amber-500 via-orange-700 to-stone-900",
    badge: "CHILL",
    icon: Headphones,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
  },
  {
    id: "tr-rap",
    title: "Türkçe Rap Sokak",
    subtitle: "Sert beatler ve yeni nesil lirikler",
    query: "türkçe rap hit şarkılar",
    gradient: "from-emerald-500 via-teal-700 to-zinc-900",
    badge: "HİPHOP",
    icon: Radio,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
  },
  {
    id: "rock-legends",
    title: "Rock Efsaneleri",
    subtitle: "Zamansız gitar soloları ve klasikler",
    query: "classic rock greatest hits",
    gradient: "from-red-600 via-rose-800 to-neutral-950",
    badge: "KLASİK",
    icon: Disc3,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
  },
];

const QUICK_CHIPS = [
  "UZI",
  "Lvbel C5",
  "The Weeknd",
  "Motive",
  "Sezen Aksu",
  "Tarkan",
  "Ati242",
  "Ezhel",
  "Daft Punk",
];

function splitArtists(artistStr) {
  if (!artistStr) return [];
  return artistStr
    .split(/\s*(?:,|&|\bve\b|\bfeat\.?|\bft\.?|•|\/|;)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// ============================================================================
// Tauri Köprüsü ve Yardımcılar
// ============================================================================
const searchMemoryCache = new Map();

async function tauriInvoke(cmd, args = {}) {
  if (typeof window !== "undefined" && window.__TAURI__?.core?.invoke) {
    return window.__TAURI__.core.invoke(cmd, args);
  }
  throw new Error("Tauri arka ucu bulunamadı");
}

function toAssetUrl(filePath) {
  if (typeof window !== "undefined" && window.__TAURI__?.core?.convertFileSrc) {
    return window.__TAURI__.core.convertFileSrc(filePath);
  }
  return filePath;
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

function getTrackCover(track) {
  if (!track) return "";
  if (track.thumbnail && track.thumbnail.trim().length > 0) {
    return track.thumbnail;
  }
  if (track.id && track.id.length === 11) {
    return `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
  }
  return "";
}

// ============================================================================
// Albüm Kapağı Bileşeni (Skeleton + Fallback İkon Destekli)
// ============================================================================
function TrackArtwork({ track, className = "w-11 h-11 rounded-xl", iconSize = 18 }) {
  const src = getTrackCover(track);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-zinc-800/80 border border-white/10 shrink-0 flex items-center justify-center ${className}`}
    >
      {!loaded && !errored && src && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-700/60 via-zinc-800/60 to-zinc-700/60" />
      )}
      {src && !errored ? (
        <img
          src={src}
          alt={track?.title || "Kapak"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <Music2 size={iconSize} className="text-orange-400/80" />
      )}
    </div>
  );
}

// ============================================================================
// Skeleton Yükleme Satırları
// ============================================================================
function TrackSkeletonList({ count = 8 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
        >
          <div className="w-6 h-4 rounded bg-white/10" />
          <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 w-48 max-w-[60%] rounded-full bg-white/15" />
            <div className="h-2.5 w-32 max-w-[40%] rounded-full bg-white/10" />
          </div>
          <div className="hidden md:block h-3 w-28 rounded-full bg-white/10" />
          <div className="h-3 w-12 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Ana Helios Uygulaması
// ============================================================================
export default function HeliosApp() {
  // Gezinme & Görünüm
  const [activeView, setActiveView] = useState("home"); // "home" | "artist" | "recommendations" | "liked" | "recent" | "playlists" | "playlist-detail"
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [selectedArtistName, setSelectedArtistName] = useState("");
  const [artistTracks, setArtistTracks] = useState([]);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0]);
  const mainScrollRef = useRef(null);

  // Arama & Parça Listesi
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionTitle, setSectionTitle] = useState("Bugünün Popüler Şarkıları");
  const [sectionSub, setSectionSub] = useState("Anında kayıpsız çalmaya hazır parçalar");
  const [tracks, setTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);

  // Kalıcı Kütüphane (Beğenilenler, Son Çalınanlar, Özel Listeler)
  const [likedTracks, setLikedTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [cacheStats, setCacheStats] = useState({ bytes: 0, files: 0 });

  // Oynatıcı Durumu
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const volumeRef = useRef(0.75);
  const mutedRef = useRef(false);
  const loadTokenRef = useRef(0);
  const autoExtendLockRef = useRef(false);
  const isRadioModeRef = useRef(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"
  const [playbackRate, setPlaybackRate] = useState(1);

  // Modallar & Menü Durumu
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [trackForPlaylistModal, setTrackForPlaylistModal] = useState(null);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [spotifyInput, setSpotifyInput] = useState("");
  const [isImportingSpotify, setIsImportingSpotify] = useState(false);
  const [discordEnabled, setDiscordEnabled] = useState(true);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const searchInputRef = useRef(null);

  const showToast = useCallback((text, isError = false) => {
    setToastMessage({ text, isError, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const libraryLoadedRef = useRef(false);

  // localStorage + Kalıcı Disk Kütüphanesi (library.json) yükleme & kurtarma
  useEffect(() => {
    let localLiked = [];
    let localRecent = [];
    let localPlaylists = [];
    try {
      localLiked = JSON.parse(localStorage.getItem("liked") || "[]");
      localRecent = JSON.parse(localStorage.getItem("recent") || "[]");
      localPlaylists = JSON.parse(localStorage.getItem("custom_playlists") || "[]");
      const savedVol = JSON.parse(localStorage.getItem("volume") || "0.75");
      const savedRate = JSON.parse(localStorage.getItem("playback_rate") || "1");
      if (!Array.isArray(localLiked)) localLiked = [];
      if (!Array.isArray(localRecent)) localRecent = [];
      if (!Array.isArray(localPlaylists)) localPlaylists = [];
      setLikedTracks(localLiked);
      setRecentTracks(localRecent);
      setCustomPlaylists(localPlaylists);
      if (typeof savedVol === "number") setVolume(Math.max(0, Math.min(1, savedVol)));
      if (PLAYBACK_SPEEDS.includes(savedRate)) setPlaybackRate(savedRate);
    } catch {
      /* ignore */
    }

    (async () => {
      try {
        const disk = await tauriInvoke("load_library");
        const diskPlaylists = Array.isArray(disk?.custom_playlists) ? disk.custom_playlists : [];
        const diskLiked = Array.isArray(disk?.liked) ? disk.liked : [];
        const diskRecent = Array.isArray(disk?.recent) ? disk.recent : [];

        let finalPlaylists = localPlaylists.length > 0 ? localPlaylists : diskPlaylists;
        const finalLiked = localLiked.length > 0 ? localLiked : diskLiked;
        const finalRecent = localRecent.length > 0 ? localRecent : diskRecent;

        if (finalLiked.length > 0 && localLiked.length === 0) {
          setLikedTracks(finalLiked);
          localStorage.setItem("liked", JSON.stringify(finalLiked));
        }
        if (finalRecent.length > 0 && localRecent.length === 0) {
          setRecentTracks(finalRecent);
          localStorage.setItem("recent", JSON.stringify(finalRecent));
        }
        if (finalPlaylists.length > 0 && localPlaylists.length === 0) {
          setCustomPlaylists(finalPlaylists);
          localStorage.setItem("custom_playlists", JSON.stringify(finalPlaylists));
        }

        // Eğer hem localStorage hem disk boşsa kullanıcının Spotify profil listelerini otomatik geri yükle
        if (finalPlaylists.length === 0 && !localStorage.getItem("mihon_sp_auto_restored")) {
          localStorage.setItem("mihon_sp_auto_restored", "1");
          const importedList = await tauriInvoke("import_spotify", {
            input: "https://open.spotify.com/user/plcdgnxjp7rv57rnc7g5ai4jl",
          });
          if (Array.isArray(importedList) && importedList.length > 0) {
            const now = Date.now();
            finalPlaylists = importedList.map((pl, idx) => ({
              id: `sp_${now}_${idx}`,
              name: pl.name || "Spotify Listem",
              cover: pl.cover || "",
              tracks: Array.isArray(pl.tracks) ? pl.tracks : [],
              createdAt: now + idx,
              source: "spotify",
            }));
            setCustomPlaylists(finalPlaylists);
            localStorage.setItem("custom_playlists", JSON.stringify(finalPlaylists));
          }
        }
      } catch {
        /* ignore */
      } finally {
        libraryLoadedRef.current = true;
      }
    })();
  }, []);

  // Kütüphane değiştiğinde diske (`library.json`) kalıcı olarak kaydet
  useEffect(() => {
    if (!libraryLoadedRef.current) return;
    tauriInvoke("save_library", {
      data: {
        custom_playlists: customPlaylists,
        liked: likedTracks,
        recent: recentTracks,
      },
    }).catch(() => {});
  }, [customPlaylists, likedTracks, recentTracks]);

  // Önbellek bilgisini güncelle
  const refreshCacheInfo = useCallback(async () => {
    try {
      const info = await tauriInvoke("cache_info");
      if (info) setCacheStats(info);
    } catch {
      /* ignore */
    }
  }, []);

  // Arama Fonksiyonu (Skeleton + Önbellek + İlk 2 Şarkıyı Otomatik Prefetch)
  const performSearch = useCallback(
    async (query, title, sub) => {
      const clean = query.trim();
      if (!clean) return;
      if (title) setSectionTitle(title);
      if (sub) setSectionSub(sub);

      const cacheKey = clean.toLowerCase();
      if (searchMemoryCache.has(cacheKey)) {
        const cached = searchMemoryCache.get(cacheKey);
        setTracks(cached);
        setIsLoadingTracks(false);
        return;
      }

      setIsLoadingTracks(true);
      try {
        const results = await tauriInvoke("search", { query: clean });
        const list = Array.isArray(results) ? results : [];
        searchMemoryCache.set(cacheKey, list);
        setTracks(list);

        // İlk şarkıyı arka planda sessizce hazırla (tıkladığında 0 sn gecikmeyle başlasın!)
        if (list[0]?.id) {
          tauriInvoke("prepare_track", { id: list[0].id }).catch(() => {});
        }
      } catch (err) {
        showToast(`Arama hatası: ${err?.message || err}`, true);
        setTracks([]);
      } finally {
        setIsLoadingTracks(false);
      }
    },
    [showToast]
  );

  // Sanatçı Sayfasını Aç (Örn: UZI, Lvbel C5, Motive vb. tıklandığında özel sayfasına gider)
  const openArtistPage = useCallback(
    async (artistName, e) => {
      if (e) e.stopPropagation();
      const clean = (artistName || "").trim();
      if (!clean) return;

      setSelectedArtistName(clean);
      setActiveView("artist");
      mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

      const cacheKey = `artist_${clean.toLowerCase()}`;
      if (searchMemoryCache.has(cacheKey)) {
        setArtistTracks(searchMemoryCache.get(cacheKey));
        setIsLoadingArtist(false);
        return;
      }

      setIsLoadingArtist(true);
      try {
        const results = await tauriInvoke("search", { query: clean });
        const list = Array.isArray(results) ? results : [];
        const needle = clean.toLowerCase();
        // Önce sanatçı adında tam/kısmi eşleşenleri filtrele, yoksa en yakın sonuçları göster
        const matched = list.filter(
          (t) =>
            t.artist?.toLowerCase().includes(needle) ||
            t.title?.toLowerCase().includes(needle)
        );
        const finalTracks = matched.length >= 3 ? matched : list;

        searchMemoryCache.set(cacheKey, finalTracks);
        setArtistTracks(finalTracks);
        if (finalTracks[0]?.id) {
          tauriInvoke("prepare_track", { id: finalTracks[0].id }).catch(() => {});
        }
      } catch (err) {
        showToast(`Sanatçı sayfası yüklenemedi: ${err?.message || err}`, true);
        setArtistTracks([]);
      } finally {
        setIsLoadingArtist(false);
      }
    },
    [showToast]
  );

  // İlk açılışta Global Hit listesini yükle ve GitHub güncellemesini kontrol et
  useEffect(() => {
    performSearch(
      COLLECTIONS[0].query,
      COLLECTIONS[0].title,
      COLLECTIONS[0].subtitle
    );
    refreshCacheInfo();
    tauriInvoke("check_for_updates")
      .then((info) => {
        if (info) setUpdateInfo(info);
      })
      .catch(() => {});
    const interval = setInterval(refreshCacheInfo, 12000);
    return () => clearInterval(interval);
  }, [performSearch, refreshCacheInfo]);

  const handleCheckOrInstallUpdate = useCallback(async () => {
    if (isCheckingUpdate || isInstallingUpdate) return;
    if (updateInfo?.has_update && updateInfo?.download_url) {
      setIsInstallingUpdate(true);
      showToast(`Mihon v${updateInfo.latest_version} indiriliyor ve güncelleniyor...`);
      try {
        await tauriInvoke("install_update", { downloadUrl: updateInfo.download_url });
      } catch (err) {
        showToast(`Güncelleme hatası: ${err?.message || err}`, true);
        setIsInstallingUpdate(false);
      }
      return;
    }

    setIsCheckingUpdate(true);
    try {
      const info = await tauriInvoke("check_for_updates");
      setUpdateInfo(info);
      if (info?.has_update) {
        showToast(
          `Yeni sürüm bulundu: v${info.latest_version}! Tekrar tıklayarak hemen güncelleyebilirsin.`
        );
      } else {
        showToast(`Mihon güncel (v${info?.current_version || "2.0.0"})`);
      }
    } catch (err) {
      showToast(`Güncelleme kontrolü başarısız: ${err?.message || err}`, true);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [isCheckingUpdate, isInstallingUpdate, updateInfo, showToast]);

  // Ses Seviyesi, Ses Dengeleyici (Loudness Normalizer) ve Oynatma Hızı Senkronizasyonu
  const applyAudioSettings = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const rawVol = mutedRef.current ? 0 : Math.max(0, Math.min(1, volumeRef.current));
    // İnsan kulağına uygun logaritmik ses eğrisi (x^1.6) ve sabit ses seviyesi
    const curvedVol = rawVol === 0 ? 0 : Math.pow(rawVol, 1.6);
    audio.muted = mutedRef.current;
    audio.volume = curvedVol;
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
    mutedRef.current = isMuted;
    applyAudioSettings();
  }, [volume, isMuted, currentTrack, applyAudioSettings]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
    audio.defaultPlaybackRate = playbackRate;
  }, [playbackRate, currentTrack]);

  // Arka planda sıranın sonuna yaklaşıldığında sürekli yeni benzer türde şarkılar ekler (Sonsuz Radyo)
  const extendQueueWithSimilar = useCallback(async (seed, currentQueueList) => {
    if (!seed || autoExtendLockRef.current) return null;
    autoExtendLockRef.current = true;
    try {
      const excludeIds = (currentQueueList || [])
        .flatMap((t) => [t.id, t.title])
        .filter(Boolean)
        .slice(-120);

      const res = await tauriInvoke("recommend_similar", {
        seedId: seed.id || "",
        seedTitle: seed.title || "",
        seedArtist: seed.artist || "",
        seedDurationSec: seed.duration_sec || 180,
        excludeIds,
      });

      const raw = Array.isArray(res?.tracks) ? res.tracks : [];
      if (raw.length === 0) return null;

      let appendedList = null;
      setQueue((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const existingTitles = new Set(
          prev.map((t) => (t.title || "").toLowerCase().trim())
        );
        const fresh = raw.filter(
          (t) =>
            !existingIds.has(t.id) &&
            !existingTitles.has((t.title || "").toLowerCase().trim())
        );
        if (fresh.length === 0) return prev;
        appendedList = [...prev, ...fresh];
        if (fresh[0]?.id) {
          tauriInvoke("prepare_track", { id: fresh[0].id }).catch(() => {});
        }
        return appendedList;
      });

      setRecommendedTracks((prev) => {
        if (!prev.length) return prev;
        const existingIds = new Set(prev.map((t) => t.id));
        const existingTitles = new Set(
          prev.map((t) => (t.title || "").toLowerCase().trim())
        );
        const fresh = raw.filter(
          (t) =>
            !existingIds.has(t.id) &&
            !existingTitles.has((t.title || "").toLowerCase().trim())
        );
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });

      return raw;
    } catch {
      return null;
    } finally {
      autoExtendLockRef.current = false;
    }
  }, []);

  // Şarkıyı Oynat (Sıranın sonuna yaklaşıldığında otomatik olarak benzer şarkılarla sırayı uzatır)
  const playTrackAtIndex = useCallback(
    async (targetQueue, index) => {
      const track = targetQueue[index];
      if (!track || !audioRef.current) return;

      const token = ++loadTokenRef.current;
      const audio = audioRef.current;

      setQueue(targetQueue);
      setQueueIndex(index);
      setCurrentTrack(track);
      setIsTrackLoading(true);
      setCurrentTime(0);
      setDuration(track.duration_sec || 0);
      audio.pause();

      // Son çalınanlara ekle
      setRecentTracks((prev) => {
        const next = [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 50);
        localStorage.setItem("recent", JSON.stringify(next));
        return next;
      });

      // Yalnızca "Aynı Türde Öneriler" radyo modundaysa sıranın sonuna yaklaşıldığında otomatik uzat
      const remaining = targetQueue.length - 1 - index;
      if (isRadioModeRef.current && remaining <= 4) {
        extendQueueWithSimilar(track, targetQueue);
      }

      try {
        const localPath = await tauriInvoke("prepare_track", { id: track.id });
        if (token !== loadTokenRef.current) return;

        audio.src = toAssetUrl(localPath);
        audio.playbackRate = playbackRate;
        applyAudioSettings();
        await audio.play();
        setIsPlaying(true);
        refreshCacheInfo();

        // Sıradaki 2 parçayı arka planda hazırla (geçişlerde 0 bekleme!)
        const nextIdx1 = index + 1;
        const nextIdx2 = index + 2;
        if (targetQueue[nextIdx1]?.id) {
          tauriInvoke("prepare_track", { id: targetQueue[nextIdx1].id }).catch(() => {});
        }
        if (targetQueue[nextIdx2]?.id) {
          tauriInvoke("prepare_track", { id: targetQueue[nextIdx2].id }).catch(() => {});
        }
      } catch (err) {
        if (token !== loadTokenRef.current) return;
        showToast("Parça atlanıyor, sıradaki benzer şarkıya geçiliyor...", true);
        if (index + 1 < targetQueue.length) {
          setTimeout(() => playTrackAtIndex(targetQueue, index + 1), 350);
        } else {
          setIsPlaying(false);
        }
      } finally {
        if (token === loadTokenRef.current) {
          setIsTrackLoading(false);
        }
      }
    },
    [playbackRate, refreshCacheInfo, showToast, applyAudioSettings, extendQueueWithSimilar]
  );

  // Aynı Türde Şarkı Önerme Algoritmasını Çalıştır (Akustik Radyo + Süre/Tempo + MMR Çeşitlilik)
  const openSimilarRecommendations = useCallback(
    async (seedTrack, e) => {
      if (e) e.stopPropagation();
      const seed =
        seedTrack ||
        currentTrack ||
        recentTracks[0] ||
        likedTracks[0] ||
        tracks[0];
      if (!seed) {
        showToast("Öneri oluşturmak için önce bir şarkı seçin.", true);
        return;
      }

      isRadioModeRef.current = true;
      setActiveView("recommendations");
      mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setRecommendationMeta({
        seedTrack: seed,
        seed_title: seed.title,
        seed_artist: seed.artist,
        detected_genre: `${seed.artist || seed.title} Radyosu`,
        algorithm_summary: `“${seed.title}” baz alınarak kesintisiz benzer şarkılar yükleniyor...`,
      });

      setIsLoadingRecs(true);
      try {
        const excludeIds = queue
          .flatMap((t) => [t.id, t.title])
          .filter(Boolean)
          .slice(-60);

        const res = await tauriInvoke("recommend_similar", {
          seedId: seed.id || "",
          seedTitle: seed.title || "",
          seedArtist: seed.artist || "",
          seedDurationSec: seed.duration_sec || 180,
          excludeIds,
        });
        const recList = Array.isArray(res?.tracks) ? res.tracks : [];
        const meta = {
          seedTrack: seed,
          seed_title: res?.seed_title || seed.title,
          seed_artist: res?.seed_artist || seed.artist,
          detected_genre: res?.detected_genre || "Benzer Şarkı Radyosu",
          algorithm_summary: `“${seed.title}” ile aynı atmosferde kesintisiz radyo akışı`,
        };
        setRecommendationMeta(meta);
        setRecommendedTracks(recList);

        if (recList.length > 0) {
          // Eğer şu an bu tohum şarkı çalıyorsa, sıranın devamını doğrudan bu benzer şarkılar yap (kesintisiz devam etsin!)
          if (currentTrack && currentTrack.id === seed.id) {
            const newQueue = [currentTrack, ...recList];
            setQueue(newQueue);
            setQueueIndex(0);
            if (recList[0]?.id) {
              tauriInvoke("prepare_track", { id: recList[0].id }).catch(() => {});
            }
          } else {
            // Farklı bir şarkı için öneriye basıldıysa hemen ilk öneriden sonsuz radyoyu başlat!
            playTrackAtIndex(recList, 0);
          }
          showToast(
            `“${seed.title}” için ${recList.length} benzer şarkı yüklendi — kesintisiz çalmaya devam edecek!`
          );
        }
      } catch (err) {
        showToast(`Öneri algoritması hatası: ${err?.message || err}`, true);
        setRecommendedTracks([]);
      } finally {
        setIsLoadingRecs(false);
      }
    },
    [currentTrack, recentTracks, likedTracks, tracks, queue, showToast, playTrackAtIndex]
  );

  // Sonraki / Önceki Şarkı (Liste bittiğinde veya İleri tuşuna basıldığında Sonsuz Benzer Tür Radyosu devreye girer)
  const handleNext = useCallback(
    async (userInitiated = true) => {
      if (!queue.length) return;
      if (shuffle && queue.length > 1) {
        let rand;
        do {
          rand = Math.floor(Math.random() * queue.length);
        } while (rand === queueIndex);
        playTrackAtIndex(queue, rand);
        return;
      }
      if (queueIndex + 1 < queue.length) {
        playTrackAtIndex(queue, queueIndex + 1);
      } else if (repeatMode === "all") {
        playTrackAtIndex(queue, 0);
      } else if (isRadioModeRef.current && currentTrack) {
        try {
          showToast(`“${currentTrack.title}” türünde yeni şarkılar ekleniyor...`);
          const excludeIds = queue
            .flatMap((t) => [t.id, t.title])
            .filter(Boolean)
            .slice(-120);
          const res = await tauriInvoke("recommend_similar", {
            seedId: currentTrack.id || "",
            seedTitle: currentTrack.title || "",
            seedArtist: currentTrack.artist || "",
            seedDurationSec: currentTrack.duration_sec || 180,
            excludeIds,
          });
          if (Array.isArray(res?.tracks) && res.tracks.length > 0) {
            const extendedQueue = [...queue, ...res.tracks];
            setRecommendedTracks((prev) =>
              prev.length > 0 ? [...prev, ...res.tracks] : prev
            );
            playTrackAtIndex(extendedQueue, queueIndex + 1);
            return;
          }
        } catch {
          /* ignore */
        }
        playTrackAtIndex(queue, 0);
      } else if (userInitiated && queue.length > 0) {
        playTrackAtIndex(queue, 0);
      } else {
        setIsPlaying(false);
      }
    },
    [queue, queueIndex, shuffle, repeatMode, currentTrack, playTrackAtIndex, showToast]
  );

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (!queue.length) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    playTrackAtIndex(queue, prevIdx);
  }, [queue, queueIndex, playTrackAtIndex]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      if (tracks.length > 0) playTrackAtIndex(tracks, 0);
      return;
    }
    if (!audio.src) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack, tracks, playTrackAtIndex]);

  // Discord Rich Presence Senkronizasyonu
  const syncDiscordPresence = useCallback(
    async (track, playing, posSec, durSec) => {
      if (!discordEnabled || !track) {
        tauriInvoke("clear_discord_presence").catch(() => {});
        setDiscordConnected(false);
        return;
      }
      try {
        await tauriInvoke("update_discord_presence", {
          id: track.id || "",
          title: track.title || "",
          artist: track.artist || "",
          album: track.album || "",
          thumbnail: getTrackCover(track),
          currentSec: Math.max(0, Math.floor(posSec || 0)),
          durationSec: Math.max(
            0,
            Math.floor(durSec || track.duration_sec || 0)
          ),
          isPlaying: Boolean(playing),
        });
        setDiscordConnected(true);
      } catch {
        setDiscordConnected(false);
      }
    },
    [discordEnabled]
  );

  useEffect(() => {
    if (!currentTrack) return;
    const pos = audioRef.current?.currentTime || 0;
    const dur = duration || audioRef.current?.duration || currentTrack.duration_sec || 0;
    syncDiscordPresence(currentTrack, isPlaying, pos, dur);
  }, [currentTrack, isPlaying, duration, discordEnabled, syncDiscordPresence]);

  // İleri / Geri Sarma (Bar'dan anlık veya +-10sn)
  const seekToSeconds = useCallback(
    (targetSec) => {
      const audio = audioRef.current;
      if (!audio || !audio.src) return;
      const maxDur = duration || audio.duration || currentTrack?.duration_sec || 0;
      const clamped = Math.max(0, Math.min(targetSec, maxDur || targetSec));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
      if (currentTrack) {
        syncDiscordPresence(currentTrack, !audio.paused, clamped, maxDur);
      }
    },
    [duration, currentTrack, syncDiscordPresence]
  );

  // Oynatma Hızı Değiştirme (0.75x -> 1x -> 1.25x -> 1.5x -> 2x)
  const cyclePlaybackSpeed = useCallback(() => {
    setPlaybackRate((prev) => {
      const idx = PLAYBACK_SPEEDS.indexOf(prev);
      const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
      localStorage.setItem("playback_rate", JSON.stringify(next));
      showToast(`Oynatma hızı: ${next}x`);
      return next;
    });
  }, [showToast]);

  // Beğeni Ekle / Çıkar
  const isTrackLiked = useCallback(
    (id) => likedTracks.some((t) => t.id === id),
    [likedTracks]
  );

  const toggleLikeTrack = useCallback(
    (track, e) => {
      if (e) e.stopPropagation();
      if (!track) return;
      setLikedTracks((prev) => {
        const exists = prev.some((t) => t.id === track.id);
        const next = exists ? prev.filter((t) => t.id !== track.id) : [track, ...prev];
        localStorage.setItem("liked", JSON.stringify(next));
        showToast(exists ? "Beğenilenlerden çıkarıldı" : "Beğenilenlere eklendi");
        return next;
      });
    },
    [showToast]
  );

  // Özel Çalma Listesi İşlemleri (Oluşturma, Şarkı Atma, Silme)
  const saveCustomPlaylists = useCallback((nextList) => {
    setCustomPlaylists(nextList);
    localStorage.setItem("custom_playlists", JSON.stringify(nextList));
  }, []);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    const created = {
      id: `pl_${Date.now()}`,
      name,
      tracks: trackForPlaylistModal ? [trackForPlaylistModal] : [],
      createdAt: Date.now(),
    };
    const next = [created, ...customPlaylists];
    saveCustomPlaylists(next);
    setNewPlaylistName("");
    setIsCreateModalOpen(false);

    if (trackForPlaylistModal) {
      showToast(`“${trackForPlaylistModal.title}” → “${name}” listesine eklendi`);
      setTrackForPlaylistModal(null);
    } else {
      showToast(`“${name}” listesi oluşturuldu`);
      setSelectedPlaylistId(created.id);
      setActiveView("playlist-detail");
    }
  };

  const handleAddTrackToPlaylist = (playlistId, track) => {
    const next = customPlaylists.map((pl) => {
      if (pl.id !== playlistId) return pl;
      if (pl.tracks.some((t) => t.id === track.id)) {
        showToast(`Zaten “${pl.name}” listesinde var`);
        return pl;
      }
      showToast(`“${track.title}” → “${pl.name}” listesine eklendi`);
      return { ...pl, tracks: [...pl.tracks, track] };
    });
    saveCustomPlaylists(next);
    setTrackForPlaylistModal(null);
  };

  const handleRemoveTrackFromPlaylist = (playlistId, trackId, e) => {
    if (e) e.stopPropagation();
    const next = customPlaylists.map((pl) =>
      pl.id === playlistId
        ? { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) }
        : pl
    );
    saveCustomPlaylists(next);
    showToast("Şarkı listeden çıkarıldı");
  };

  const handleDeletePlaylist = (playlistId, e) => {
    if (e) e.stopPropagation();
    const target = customPlaylists.find((p) => p.id === playlistId);
    const next = customPlaylists.filter((p) => p.id !== playlistId);
    saveCustomPlaylists(next);
    if (selectedPlaylistId === playlistId) {
      setActiveView("playlists");
      setSelectedPlaylistId(null);
    }
    showToast(`“${target?.name || "Liste"}” silindi`);
  };

  // Spotify'dan Çalma Listesi veya Kullanıcı Profili İçe Aktar
  const handleSpotifyImport = async (e) => {
    e.preventDefault();
    const val = spotifyInput.trim();
    if (!val || isImportingSpotify) return;

    setIsImportingSpotify(true);
    try {
      const importedList = await tauriInvoke("import_spotify", { input: val });
      if (!Array.isArray(importedList) || importedList.length === 0) {
        showToast("Spotify listesi bulunamadı veya boş.", true);
        return;
      }

      const now = Date.now();
      const newEntries = importedList.map((pl, idx) => ({
        id: `sp_${now}_${idx}`,
        name: pl.name || "Spotify Listem",
        cover: pl.cover || "",
        tracks: Array.isArray(pl.tracks) ? pl.tracks : [],
        createdAt: now + idx,
        source: "spotify",
      }));

      const importedNames = new Set(
        newEntries.map((e) => (e.name || "").toLowerCase())
      );
      const existingFiltered = customPlaylists.filter(
        (p) =>
          !(
            p.source === "spotify" &&
            importedNames.has((p.name || "").toLowerCase())
          )
      );
      const updated = [...newEntries, ...existingFiltered];
      saveCustomPlaylists(updated);
      setIsSpotifyModalOpen(false);
      setSpotifyInput("");

      if (newEntries.length === 1) {
        setSelectedPlaylistId(newEntries[0].id);
        setActiveView("playlist-detail");
        showToast(
          `“${newEntries[0].name}” (${newEntries[0].tracks.length} şarkı) Spotify'dan aktarıldı!`
        );
      } else {
        setActiveView("playlists");
        showToast(
          `${newEntries.length} Spotify çalma listesi başarıyla aktarıldı!`
        );
      }
    } catch (err) {
      showToast(`Spotify aktarım hatası: ${err?.message || err}`, true);
    } finally {
      setIsImportingSpotify(false);
    }
  };

  // Klavye Kısayolları
  useEffect(() => {
    const onKeyDown = (e) => {
      const isInput = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        setTrackForPlaylistModal(null);
        setIsCreateModalOpen(false);
        return;
      }
      if (isInput) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekToSeconds(currentTime + 5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekToSeconds(currentTime - 5);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlayPause, seekToSeconds, currentTime]);

  // Gösterilecek aktif parça listesi
  const activePlaylistObj = useMemo(
    () => customPlaylists.find((p) => p.id === selectedPlaylistId) || null,
    [customPlaylists, selectedPlaylistId]
  );

  const displayedTracks = useMemo(() => {
    if (activeView === "artist") return artistTracks;
    if (activeView === "recommendations") return recommendedTracks;
    if (activeView === "liked") return likedTracks;
    if (activeView === "recent") return recentTracks;
    if (activeView === "playlist-detail") return activePlaylistObj?.tracks || [];
    return tracks;
  }, [
    activeView,
    artistTracks,
    recommendedTracks,
    likedTracks,
    recentTracks,
    activePlaylistObj,
    tracks,
  ]);

  const effectiveDuration = duration || currentTrack?.duration_sec || 0;
  const displayedTime = isSeeking ? seekPreview : currentTime;
  const seekPercent =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (displayedTime / effectiveDuration) * 100))
      : 0;

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#09090B] text-zinc-100 select-none">
      {/* Dinamik Arka Plan Ortam Işığı */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[130px] opacity-25 transition-all duration-1000"
          style={{
            background: currentTrack
              ? "radial-gradient(circle, #F06B3C 0%, #9333EA 70%, transparent 100%)"
              : "radial-gradient(circle, #F06B3C 0%, transparent 75%)",
          }}
        />
        <div className="absolute -bottom-40 right-0 w-[460px] h-[460px] rounded-full bg-indigo-600/15 blur-[140px]" />
      </div>

      {/* ===== ÜST PENCERE ÇUBUĞU (Tauri Frameless Titlebar) ===== */}
      <header
        data-tauri-drag-region
        className="relative z-30 h-11 px-4 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl shrink-0"
      >
        <div data-tauri-drag-region className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-900 border border-white/15 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <img
              src="/mihon-logo.jpg"
              alt="Mihon"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-extrabold tracking-wide text-sm text-white">
            Mihon
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !discordEnabled;
              setDiscordEnabled(next);
              showToast(
                next
                  ? "Discord Rich Presence aktif edildi"
                  : "Discord Rich Presence kapatıldı"
              );
            }}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
              discordEnabled
                ? "bg-[#5865F2]/20 text-[#99AAB5] hover:text-white border-[#5865F2]/40"
                : "bg-white/[0.04] text-zinc-500 border-white/10"
            }`}
            title="Discord Rich Presence Durumu (Aç/Kapat)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                discordEnabled && discordConnected
                  ? "bg-emerald-400 animate-pulse"
                  : discordEnabled
                  ? "bg-[#5865F2]"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-indigo-300">Discord RPC</span>
          </button>

          <button
            type="button"
            onClick={handleCheckOrInstallUpdate}
            disabled={isCheckingUpdate || isInstallingUpdate}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
              updateInfo?.has_update
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40 animate-pulse"
                : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/10"
            }`}
            title="GitHub Üzerinden Güncelleme Kontrolü"
          >
            {isCheckingUpdate || isInstallingUpdate ? (
              <Loader2 size={11} className="animate-spin text-[#F06B3C]" />
            ) : (
              <Zap
                size={11}
                className={
                  updateInfo?.has_update ? "text-emerald-400" : "text-[#F06B3C]"
                }
              />
            )}
            <span>
              {isInstallingUpdate
                ? "Güncelleniyor..."
                : isCheckingUpdate
                ? "Kontrol Ediliyor..."
                : updateInfo?.has_update
                ? `Güncelle (v${updateInfo.latest_version})`
                : `v${updateInfo?.current_version || "2.0.0"} • Güncelleme Kontrol`}
            </span>
          </button>
        </div>

        {/* Hızlı Üst Arama Çubuğu */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            setActiveView("home");
            performSearch(
              searchQuery,
              `“${searchQuery.trim()}”`,
              "YouTube Music anlık arama sonuçları"
            );
          }}
          className="flex items-center gap-2 w-full max-w-md mx-4 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-[#F06B3C]/60 border border-white/[0.08] transition-all"
        >
          <Search size={15} className="text-zinc-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şarkı, sanatçı veya albüm ara... (Ctrl+K)"
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-zinc-500 hover:text-zinc-200"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Pencere Kontrolleri */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => tauriInvoke("minimize_window").catch(() => {})}
            className="w-8 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Küçült"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => tauriInvoke("toggle_maximize").catch(() => {})}
            className="w-8 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Büyüt"
          >
            <Square size={12} />
          </button>
          <button
            onClick={() => tauriInvoke("close_window").catch(() => {})}
            className="w-8 h-7 rounded-lg hover:bg-rose-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Kapat"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* ===== ORTA ALAN (Sol Minimal Menü + Ana İçerik + Sağ Kuyruk) ===== */}
      <div className="relative z-10 flex-1 flex min-h-0 gap-2.5 p-2.5 pb-0">
        {/* SOL KENAR ÇUBUĞU (Sade Navigasyon & Kullanıcının Kendi Listeleri) */}
        <aside className="w-60 shrink-0 rounded-2xl bg-zinc-900/60 border border-white/[0.07] backdrop-blur-2xl flex flex-col justify-between p-3">
          <div className="space-y-5 min-h-0 flex-1 flex flex-col">
            {/* Ana Menü */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveView("home")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "home"
                    ? "bg-[#F06B3C] text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Compass size={17} />
                <span>Ana Sayfa & Koleksiyonlar</span>
              </button>

              <button
                onClick={(e) => openSimilarRecommendations(currentTrack, e)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "recommendations"
                    ? "bg-gradient-to-r from-[#F06B3C] to-purple-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Sparkles size={17} className="text-[#F06B3C]" />
                  <span>Aynı Türde Öneriler</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-[#F06B3C]/20 text-[#F06B3C]">
                  AI
                </span>
              </button>

              <button
                onClick={() => setActiveView("liked")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "liked"
                    ? "bg-[#F06B3C] text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Heart size={17} />
                  <span>Beğenilen Şarkılar</span>
                </span>
                {likedTracks.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-black/25">
                    {likedTracks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView("recent")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "recent"
                    ? "bg-[#F06B3C] text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Clock size={17} />
                  <span>Son Çalınanlar</span>
                </span>
                {recentTracks.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-black/25">
                    {recentTracks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView("playlists")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === "playlists"
                    ? "bg-[#F06B3C] text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ListMusic size={17} />
                  <span>Çalma Listelerim</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-black/25">
                  {customPlaylists.length}
                </span>
              </button>
            </nav>

            {/* Özel Çalma Listeleri Bölümü */}
            <div className="pt-3 border-t border-white/[0.07] flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  LİSTELERİM
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSpotifyModalOpen(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#1DB954] hover:text-emerald-300 px-2 py-1 rounded-lg bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/30 transition-colors"
                    title="Spotify'daki Listelerimi Aktar"
                  >
                    <Disc3 size={12} />
                    <span>Spotify Aktar</span>
                  </button>
                  <button
                    onClick={() => {
                      setTrackForPlaylistModal(null);
                      setNewPlaylistName("");
                      setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#F06B3C] hover:text-orange-300 px-2 py-1 rounded-lg bg-[#F06B3C]/10 hover:bg-[#F06B3C]/20 transition-colors"
                    title="Yeni Liste Oluştur"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {customPlaylists.length === 0 ? (
                  <button
                    onClick={() => {
                      setTrackForPlaylistModal(null);
                      setNewPlaylistName("");
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full p-3 rounded-xl border border-dashed border-white/10 hover:border-[#F06B3C]/50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-[#F06B3C]">
                      <FolderPlus size={15} />
                      <span>İlk Listeni Oluştur</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Şarkıları listelerine ekleyip yönetebilirsin.
                    </p>
                  </button>
                ) : (
                  customPlaylists.map((pl) => {
                    const isSelected =
                      activeView === "playlist-detail" && selectedPlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setSelectedPlaylistId(pl.id);
                          setActiveView("playlist-detail");
                        }}
                        className={`group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/[0.05] text-zinc-300"
                        }`}
                      >
                        <TrackArtwork
                          track={pl.tracks[0]}
                          className="w-9 h-9 rounded-lg"
                          iconSize={15}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{pl.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {pl.tracks.length} şarkı
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeletePlaylist(pl.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Listeyi Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Alt Önbellek Kartı */}
          <div className="mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <HardDrive size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-200 truncate">
                  {formatBytes(cacheStats.bytes)} Önbellek
                </p>
                <p className="text-[10px] text-zinc-500">
                  {cacheStats.files} şarkı hazır
                </p>
              </div>
            </div>
            {cacheStats.files > 0 && (
              <button
                onClick={async () => {
                  try {
                    await tauriInvoke("clear_cache");
                    refreshCacheInfo();
                    showToast("Önbellek temizlendi");
                  } catch (e) {
                    showToast(String(e), true);
                  }
                }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Önbelleği Temizle"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </aside>

        {/* ===== ANA İÇERİK PANELİ ===== */}
        <main
          ref={mainScrollRef}
          className="flex-1 rounded-2xl bg-zinc-900/50 border border-white/[0.07] backdrop-blur-2xl overflow-y-auto px-6 py-5 space-y-7"
        >
          {/* SANATÇI ÖZEL SAYFASI (Örn: UZI, Lvbel C5, Motive vb. tıklandığında) */}
          {activeView === "artist" && (
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#F06B3C]/25 via-zinc-900 to-zinc-950 p-6 shadow-2xl">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <TrackArtwork
                    track={artistTracks[0]}
                    className="w-20 h-20 rounded-2xl shadow-2xl border-2 border-[#F06B3C]/40"
                    iconSize={32}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#F06B3C] text-white">
                        DOĞRULANMIŞ SANATÇI
                      </span>
                      <button
                        onClick={() => setActiveView("home")}
                        className="text-xs font-semibold text-zinc-400 hover:text-white underline"
                      >
                        ← Ana Sayfaya Dön
                      </button>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                      {selectedArtistName}
                    </h1>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {isLoadingArtist
                        ? "Sanatçının en popüler parçaları yükleniyor..."
                        : `${artistTracks.length} popüler parça • Anında çalmaya hazır`}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* AYNİ TÜRDE AKILLI ŞARKI ÖNERİ SAYFASI */}
          {activeView === "recommendations" && (
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#F06B3C]/20 via-zinc-900 to-zinc-950 px-5 py-4 shadow-xl">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <TrackArtwork
                    track={recommendationMeta?.seedTrack || recommendedTracks[0]}
                    className="w-14 h-14 rounded-xl shadow-lg border border-[#F06B3C]/40 shrink-0"
                    iconSize={24}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#F06B3C] text-white shrink-0">
                        SONSUZ RADYO
                      </span>
                      <span className="text-xs font-semibold text-orange-300 truncate">
                        {recommendationMeta?.detected_genre}
                      </span>
                    </div>
                    <h1 className="text-lg font-extrabold tracking-tight text-white truncate mt-1">
                      “{recommendationMeta?.seed_title || "Seçili Şarkı"}” Benzerleri
                    </h1>
                    <p className="text-xs text-zinc-400 truncate">
                      {recommendationMeta?.algorithm_summary}
                    </p>
                  </div>
                </div>

                {recommendedTracks.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        const seed =
                          currentTrack ||
                          recommendedTracks[recommendedTracks.length - 1] ||
                          recommendationMeta?.seedTrack;
                        if (!seed) return;
                        showToast("Yeni benzer şarkılar ekleniyor...");
                        await extendQueueWithSimilar(seed, recommendedTracks);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F06B3C] hover:bg-[#FF8256] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap"
                    >
                      <Sparkles size={14} />
                      <span>+ Daha Fazla Ekle</span>
                    </button>

                    <button
                      onClick={() => {
                        const plName = `${
                          recommendationMeta?.seed_title || "Benzerler"
                        } Radyo`;
                        const created = {
                          id: `rec_pl_${Date.now()}`,
                          name: plName,
                          cover: getTrackCover(recommendedTracks[0]),
                          tracks: recommendedTracks,
                          createdAt: Date.now(),
                        };
                        saveCustomPlaylists([created, ...customPlaylists]);
                        showToast(`“${plName}” çalma listelerine kaydedildi!`);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all whitespace-nowrap"
                    >
                      <FolderPlus size={14} className="text-[#F06B3C]" />
                      <span>Listeye Kaydet</span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ANA SAYFA: KOLEKSİYON KARTLARI (Tam istediğin gibi ana sayfada!) */}
          {activeView === "home" && (
            <>
              <section>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F06B3C]">
                      KEŞFET & DİNLE
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white">
                      Öne Çıkan Koleksiyonlar
                    </h1>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={(e) => openArtistPage(chip, e)}
                        className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.05] hover:bg-[#F06B3C] text-zinc-300 hover:text-white border border-white/[0.07] transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Koleksiyon Kart Izgarası */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {COLLECTIONS.map((col) => {
                    const IconComp = col.icon;
                    const isSelected =
                      activeCollection?.id === col.id && sectionTitle === col.title;
                    return (
                      <button
                        key={col.id}
                        onClick={() => {
                          setActiveCollection(col);
                          performSearch(col.query, col.title, col.subtitle);
                        }}
                        className={`group relative overflow-hidden rounded-2xl p-3 text-left transition-all duration-300 border ${
                          isSelected
                            ? "border-[#F06B3C] ring-2 ring-[#F06B3C]/30 scale-[1.01]"
                            : "border-white/10 hover:border-white/25 hover:-translate-y-1"
                        } bg-gradient-to-br ${col.gradient} shadow-xl`}
                      >
                        <img
                          src={col.cover}
                          alt={col.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-110 group-hover:opacity-45 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        <div className="relative z-10 flex flex-col justify-between h-32">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider bg-black/55 text-white backdrop-blur-md whitespace-nowrap">
                              {col.badge}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                              <IconComp size={12} />
                            </div>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-xs text-white leading-snug line-clamp-2">
                              {col.title}
                            </h3>
                            <p className="text-[10px] text-white/75 line-clamp-1 mt-0.5">
                              {col.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="absolute right-2.5 bottom-2.5 z-20 w-8 h-8 rounded-full bg-[#F06B3C] text-white flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ÇALMA LİSTELERİM GÖRÜNÜMÜ */}
          {activeView === "playlists" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F06B3C]">
                    KÜTÜPHANE
                  </span>
                  <h1 className="text-2xl font-extrabold text-white">
                    Çalma Listelerim
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSpotifyModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ED760] text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Disc3 size={15} />
                    <span>Spotify&apos;dan Aktar</span>
                  </button>
                  <button
                    onClick={() => {
                      setTrackForPlaylistModal(null);
                      setNewPlaylistName("");
                      setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F06B3C] hover:bg-[#FF8256] text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all"
                  >
                    <Plus size={15} />
                    <span>Yeni Liste Oluştur</span>
                  </button>
                </div>
              </div>

              {customPlaylists.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                  <ListMusic size={40} className="mx-auto text-[#F06B3C] mb-3" />
                  <h3 className="text-base font-bold text-white">
                    Henüz hiç çalma listen yok
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4">
                    Yeni bir liste oluşturup beğendiğin şarkıları içine atabilirsin.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#F06B3C] text-white text-xs font-bold"
                  >
                    + İlk Listeni Oluştur
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {customPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => {
                        setSelectedPlaylistId(pl.id);
                        setActiveView("playlist-detail");
                      }}
                      className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] cursor-pointer transition-all"
                    >
                      <div className="relative aspect-square mb-3">
                        <TrackArtwork
                          track={
                            pl.cover
                              ? { thumbnail: pl.cover, title: pl.name }
                              : pl.tracks[0]
                          }
                          className="w-full h-full rounded-xl"
                          iconSize={36}
                        />
                        {pl.source === "spotify" && (
                          <span className="absolute left-2.5 top-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-[#1DB954] text-black shadow">
                            SPOTIFY
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pl.tracks.length > 0) playTrackAtIndex(pl.tracks, 0);
                          }}
                          className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-[#F06B3C] text-white flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                        >
                          <Play size={18} className="fill-current ml-0.5" />
                        </button>
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">
                        {pl.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {pl.tracks.length} parça
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ŞARKI LİSTESİ TABLOSU (Home, Liked, Recent, Playlist Detail) */}
          {activeView !== "playlists" && (
            <section className="space-y-3">
              {/* Liste Üst Başlığı ve Aksiyonlar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.07]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F06B3C]">
                    {activeView === "artist"
                      ? "SANATÇI DİSKOGRAFİSİ"
                      : activeView === "recommendations"
                      ? "BENZER TÜR & FREKANS EŞLEŞMESİ"
                      : activeView === "liked"
                      ? "FAVORİLERİM"
                      : activeView === "recent"
                      ? "GEÇMİŞ"
                      : activeView === "playlist-detail"
                      ? "ÖZEL LİSTE"
                      : "ŞARKI LİSTESİ"}
                  </span>
                  <h2 className="text-xl font-extrabold text-white">
                    {activeView === "artist"
                      ? `${selectedArtistName} — Popüler Şarkılar`
                      : activeView === "recommendations"
                      ? `${recommendationMeta?.detected_genre || "Aynı Türde"} Önerilen Şarkılar`
                      : activeView === "liked"
                      ? "Beğenilen Şarkılar"
                      : activeView === "recent"
                      ? "Son Çalınan Şarkılar"
                      : activeView === "playlist-detail"
                      ? activePlaylistObj?.name || "Çalma Listesi"
                      : sectionTitle}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {activeView === "artist"
                      ? `${artistTracks.length} şarkı listeleniyor`
                      : activeView === "recommendations"
                      ? `${recommendedTracks.length} benzer türde şarkı sıralandı`
                      : activeView === "liked"
                      ? `${likedTracks.length} beğenilen şarkı`
                      : activeView === "recent"
                      ? `${recentTracks.length} dinlenen şarkı`
                      : activeView === "playlist-detail"
                      ? `${activePlaylistObj?.tracks.length || 0} şarkı`
                      : sectionSub}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={displayedTracks.length === 0}
                    onClick={() =>
                      displayedTracks.length > 0 && playTrackAtIndex(displayedTracks, 0)
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F06B3C] hover:bg-[#FF8256] disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all"
                  >
                    <Play size={15} className="fill-current" />
                    <span>Tümünü Çal</span>
                  </button>

                  <button
                    disabled={displayedTracks.length === 0}
                    onClick={() => {
                      if (!displayedTracks.length) return;
                      setShuffle(true);
                      const rand = Math.floor(Math.random() * displayedTracks.length);
                      playTrackAtIndex(displayedTracks, rand);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 text-zinc-200 text-xs font-semibold border border-white/[0.08] transition-all"
                  >
                    <Shuffle size={14} />
                    <span>Karıştır</span>
                  </button>
                </div>
              </div>

              {/* Yüklenirken Skeleton Gösterimi */}
              {(activeView === "home" && isLoadingTracks) ||
              (activeView === "artist" && isLoadingArtist) ||
              (activeView === "recommendations" && isLoadingRecs) ? (
                <TrackSkeletonList count={8} />
              ) : displayedTracks.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <Music2 size={36} className="mx-auto text-zinc-500 mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">
                    Burada henüz şarkı yok
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Arama çubuğunu kullanarak veya koleksiyonlardan şarkı ekleyebilirsin.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {displayedTracks.map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const liked = isTrackLiked(track.id);
                    return (
                      <div
                        key={`${track.id}_${idx}`}
                        onClick={() => {
                          if (activeView === "home" || activeView === "recent") {
                            isRadioModeRef.current = false;
                            playTrackAtIndex([track], 0);
                          } else {
                            isRadioModeRef.current = activeView === "recommendations";
                            playTrackAtIndex(displayedTracks, idx);
                          }
                        }}
                        className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                          isCurrent
                            ? "bg-[#F06B3C]/15 border-[#F06B3C]/40"
                            : "bg-transparent border-transparent hover:bg-white/[0.05] hover:border-white/[0.06]"
                        }`}
                      >
                        {/* Sıra No / Ekolayzır / Yükleniyor */}
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isCurrent && isTrackLoading ? (
                            <Loader2 size={16} className="text-[#F06B3C] animate-spin" />
                          ) : isCurrent && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <span className="w-0.5 h-full bg-[#F06B3C] eq-bar eq-bar-1" />
                              <span className="w-0.5 h-full bg-[#F06B3C] eq-bar eq-bar-2" />
                              <span className="w-0.5 h-full bg-[#F06B3C] eq-bar eq-bar-3" />
                              <span className="w-0.5 h-full bg-[#F06B3C] eq-bar eq-bar-4" />
                            </div>
                          ) : (
                            <>
                              <span
                                className={`text-xs font-semibold tabular-nums group-hover:hidden ${
                                  isCurrent ? "text-[#F06B3C]" : "text-zinc-500"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <Play
                                size={14}
                                className="hidden group-hover:block text-white fill-current"
                              />
                            </>
                          )}
                        </div>

                        {/* Gerçek Albüm Kapağı + Skeleton */}
                        <TrackArtwork
                          track={track}
                          className="w-11 h-11 rounded-xl"
                        />

                        {/* Başlık & Tıklanabilir Sanatçı İsimleri */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              isCurrent ? "text-[#F06B3C]" : "text-zinc-100"
                            }`}
                          >
                            {track.title}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-zinc-400 truncate mt-0.5">
                            {splitArtists(track.artist).map((art, aIdx, arr) => (
                              <React.Fragment key={`${art}_${aIdx}`}>
                                <button
                                  type="button"
                                  onClick={(e) => openArtistPage(art, e)}
                                  className="hover:text-[#F06B3C] hover:underline transition-colors truncate"
                                  title={`${art} sayfasına git`}
                                >
                                  {art}
                                </button>
                                {aIdx < arr.length - 1 && (
                                  <span className="text-zinc-600">•</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Albüm */}
                        <div className="hidden md:block w-44 text-xs text-zinc-500 truncate">
                          {track.album}
                        </div>

                        {/* Aksiyon Butonları: Aynı Türde Öner, Listeye At, Beğen, Listeden Çıkar */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => openSimilarRecommendations(track, e)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-[#F06B3C] hover:bg-[#F06B3C]/15 transition-colors"
                            title="Bu Şarkıyla Aynı Türde Öner"
                          >
                            <Sparkles size={16} />
                          </button>

                          <button
                            onClick={() => setTrackForPlaylistModal(track)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Çalma Listesine Ekle"
                          >
                            <ListPlus size={16} />
                          </button>

                          <button
                            onClick={(e) => toggleLikeTrack(track, e)}
                            className={`p-2 rounded-lg transition-colors ${
                              liked
                                ? "text-[#F06B3C] hover:bg-[#F06B3C]/15"
                                : "text-zinc-400 hover:text-white hover:bg-white/10"
                            }`}
                            title={liked ? "Beğeniden Çıkar" : "Beğen"}
                          >
                            <Heart size={16} className={liked ? "fill-current" : ""} />
                          </button>

                          {activeView === "playlist-detail" && activePlaylistObj && (
                            <button
                              onClick={(e) =>
                                handleRemoveTrackFromPlaylist(
                                  activePlaylistObj.id,
                                  track.id,
                                  e
                                )
                              }
                              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Bu Listeden Kaldır"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        {/* Süre */}
                        <div className="w-12 text-right text-xs font-medium text-zinc-500 tabular-nums">
                          {track.duration || "0:00"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>

        {/* ===== SAĞ PANEL: ŞİMDİ ÇALIYOR & SIRADAKİ KUYRUK ===== */}
        <aside className="hidden xl:flex w-72 shrink-0 rounded-2xl bg-zinc-900/60 border border-white/[0.07] backdrop-blur-2xl p-4 flex-col justify-between">
          <div className="space-y-4 min-h-0 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Şimdi Çalıyor
              </span>
              {playbackRate !== 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F06B3C]/20 text-[#F06B3C]">
                  {playbackRate}x HIZ
                </span>
              )}
            </div>

            {/* Büyük Kapak Kartı */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800/60 border border-white/10 shadow-2xl">
              {currentTrack ? (
                <TrackArtwork
                  track={currentTrack}
                  className="w-full h-full rounded-none border-0"
                  iconSize={48}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                  <img
                    src="/mihon-logo.jpg"
                    alt="Mihon"
                    className="w-20 h-20 rounded-2xl object-cover shadow-2xl border border-white/10 mb-3"
                  />
                  <p className="text-xs font-bold text-zinc-200">
                    Mihon
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Bir şarkıya tıklayarak anında çalmaya başla
                  </p>
                </div>
              )}
            </div>

            {currentTrack && (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-white truncate">
                      {currentTrack.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-zinc-400">
                      {splitArtists(currentTrack.artist).map((art, aIdx, arr) => (
                        <React.Fragment key={`${art}_${aIdx}`}>
                          <button
                            type="button"
                            onClick={(e) => openArtistPage(art, e)}
                            className="hover:text-[#F06B3C] hover:underline transition-colors truncate"
                          >
                            {art}
                          </button>
                          {aIdx < arr.length - 1 && <span>•</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setTrackForPlaylistModal(currentTrack)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                      title="Listeye Ekle"
                    >
                      <ListPlus size={16} />
                    </button>
                    <button
                      onClick={(e) => toggleLikeTrack(currentTrack, e)}
                      className={`p-1.5 rounded-lg ${
                        isTrackLiked(currentTrack.id)
                          ? "text-[#F06B3C]"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={isTrackLiked(currentTrack.id) ? "fill-current" : ""}
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={(e) => openSimilarRecommendations(currentTrack, e)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#F06B3C]/20 to-purple-600/20 hover:from-[#F06B3C] hover:to-purple-600 text-orange-300 hover:text-white border border-[#F06B3C]/30 text-xs font-bold transition-all"
                >
                  <Sparkles size={14} />
                  <span>Aynı Türde Şarkı Öner</span>
                </button>
              </div>
            )}

            {/* Sıradaki Parçalar */}
            <div className="pt-3 border-t border-white/[0.07] flex-1 flex flex-col min-h-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                SIRADAKİ PARÇALAR
              </span>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {queue.slice(queueIndex + 1, queueIndex + 12).map((item, i) => (
                  <div
                    key={`${item.id}_${i}`}
                    onClick={() => playTrackAtIndex(queue, queueIndex + 1 + i)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors"
                  >
                    <TrackArtwork
                      track={item}
                      className="w-8 h-8 rounded-lg"
                      iconSize={13}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {item.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== ALT OYNATICI ÇUBUĞU (İleri-Geri Sarma + 2x Hız + Listeye Atma) ===== */}
      <footer className="relative z-20 h-24 m-2.5 px-5 rounded-2xl bg-zinc-950/90 border border-white/[0.09] backdrop-blur-2xl flex items-center justify-between gap-6 shadow-2xl shrink-0">
        {/* Sol: Çalan Şarkı Bilgisi */}
        <div className="flex items-center gap-3.5 w-72 min-w-0">
          <TrackArtwork
            track={currentTrack}
            className="w-14 h-14 rounded-xl shadow-lg"
            iconSize={22}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">
              {currentTrack ? currentTrack.title : "Mihon"}
            </p>
            {currentTrack ? (
              <div className="flex items-center gap-x-1.5 text-xs text-zinc-400 truncate mt-0.5">
                {splitArtists(currentTrack.artist).map((art, aIdx, arr) => (
                  <React.Fragment key={`${art}_${aIdx}`}>
                    <button
                      type="button"
                      onClick={(e) => openArtistPage(art, e)}
                      className="hover:text-[#F06B3C] hover:underline transition-colors truncate"
                      title={`${art} sayfasına git`}
                    >
                      {art}
                    </button>
                    {aIdx < arr.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                Bir şarkı veya koleksiyon seç
              </p>
            )}
          </div>
          {currentTrack && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => toggleLikeTrack(currentTrack, e)}
                className={`p-2 rounded-lg transition-colors ${
                  isTrackLiked(currentTrack.id)
                    ? "text-[#F06B3C]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Beğen"
              >
                <Heart
                  size={17}
                  className={isTrackLiked(currentTrack.id) ? "fill-current" : ""}
                />
              </button>
              <button
                onClick={() => setTrackForPlaylistModal(currentTrack)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Çalma Listesine Ekle"
              >
                <ListPlus size={17} />
              </button>
            </div>
          )}
        </div>

        {/* Orta: Kontroller + İleri/Geri Sarma Çubuğu (Seekbar) */}
        <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {/* Karıştır */}
            <button
              onClick={() => {
                setShuffle((s) => !s);
                showToast(!shuffle ? "Karıştırma açıldı" : "Karıştırma kapatıldı");
              }}
              className={`p-2 rounded-full transition-colors ${
                shuffle
                  ? "text-[#F06B3C] bg-[#F06B3C]/15"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Karıştır"
            >
              <Shuffle size={16} />
            </button>

            {/* Önceki */}
            <button
              onClick={handlePrev}
              className="p-2 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Önceki Şarkı"
            >
              <SkipBack size={19} className="fill-current" />
            </button>

            {/* -10sn Geri Sar */}
            <button
              onClick={() => seekToSeconds(currentTime - 10)}
              disabled={!currentTrack}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="10 Saniye Geri Sar"
            >
              -10s
            </button>

            {/* Oynat / Duraklat */}
            <button
              onClick={togglePlayPause}
              className="w-11 h-11 rounded-full bg-[#F06B3C] hover:bg-[#FF8256] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
              title="Oynat / Duraklat (Boşluk)"
            >
              {isTrackLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} className="fill-current" />
              ) : (
                <Play size={20} className="fill-current ml-0.5" />
              )}
            </button>

            {/* +10sn İleri Sar */}
            <button
              onClick={() => seekToSeconds(currentTime + 10)}
              disabled={!currentTrack}
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="10 Saniye İleri Sar"
            >
              +10s
            </button>

            {/* Sonraki */}
            <button
              onClick={() => handleNext(true)}
              className="p-2 rounded-full text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Sonraki Şarkı"
            >
              <SkipForward size={19} className="fill-current" />
            </button>

            {/* Tekrar */}
            <button
              onClick={() => {
                const next =
                  repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
                setRepeatMode(next);
              }}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== "off"
                  ? "text-[#F06B3C] bg-[#F06B3C]/15"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Tekrarla"
            >
              {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          {/* İlerleme ve İleri-Geri Sarma Çubuğu */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-400 tabular-nums w-9 text-right">
              {formatTime(displayedTime)}
            </span>

            <input
              type="range"
              min={0}
              max={effectiveDuration || 100}
              step={0.1}
              value={displayedTime}
              disabled={!currentTrack}
              onMouseDown={() => setIsSeeking(true)}
              onTouchStart={() => setIsSeeking(true)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSeekPreview(val);
                if (!isSeeking) seekToSeconds(val);
              }}
              onMouseUp={(e) => {
                const val = parseFloat(e.currentTarget.value);
                setIsSeeking(false);
                seekToSeconds(val);
              }}
              onTouchEnd={(e) => {
                const val = parseFloat(e.currentTarget.value);
                setIsSeeking(false);
                seekToSeconds(val);
              }}
              style={{ "--progress": `${seekPercent}%` }}
              className="helios-slider flex-1"
            />

            <span className="text-[11px] font-medium text-zinc-400 tabular-nums w-9">
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* Sağ: Oynatma Hızı (1x / 1.25x / 1.5x / 2x) + Ses Kontrolü */}
        <div className="flex items-center justify-end gap-3 w-72">
          {/* Oynatma Hızı Butonu */}
          <button
            onClick={cyclePlaybackSpeed}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              playbackRate !== 1
                ? "bg-[#F06B3C] text-white border-[#F06B3C] shadow-lg shadow-orange-500/20"
                : "bg-white/[0.05] text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
            title="Oynatma Hızını Değiştir (0.75x - 2x)"
          >
            <Gauge size={14} />
            <span>{playbackRate}x</span>
          </button>

          {/* Ses İkonu & Kaydırıcı */}
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Sesi Kapat / Aç"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              setIsMuted(false);
              localStorage.setItem("volume", JSON.stringify(v));
            }}
            style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
            className="helios-slider w-24"
          />
          <span className="text-[11px] font-bold text-zinc-400 tabular-nums w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </footer>

      {/* ===== MODAL 1: YENİ ÇALMA LİSTESİ OLUŞTUR ===== */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/15 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FolderPlus size={20} className="text-[#F06B3C]" />
                <span>Yeni Çalma Listesi</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {trackForPlaylistModal && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <TrackArtwork
                  track={trackForPlaylistModal}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {trackForPlaylistModal.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Oluşturulduğunda bu listeye eklenecek
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                maxLength={45}
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Örn: Gece Sürüşü, Spor, Kodlama..."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F06B3C]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F06B3C] hover:bg-[#FF8256] text-white shadow-lg shadow-orange-500/25"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 2: ŞARKIYI ÇALMA LİSTESİNE EKLE ===== */}
      {trackForPlaylistModal && !isCreateModalOpen && (
        <div
          onClick={() => setTrackForPlaylistModal(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/15 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ListPlus size={19} className="text-[#F06B3C]" />
                <span>Çalma Listesine Ekle</span>
              </h3>
              <button
                onClick={() => setTrackForPlaylistModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <TrackArtwork
                track={trackForPlaylistModal}
                className="w-10 h-10 rounded-lg"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {trackForPlaylistModal.title}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {trackForPlaylistModal.artist}
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {customPlaylists.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  Henüz oluşturulmuş bir çalma listen yok.
                </p>
              ) : (
                customPlaylists.map((pl) => {
                  const alreadyIn = pl.tracks.some(
                    (t) => t.id === trackForPlaylistModal.id
                  );
                  return (
                    <button
                      key={pl.id}
                      onClick={() =>
                        handleAddTrackToPlaylist(pl.id, trackForPlaylistModal)
                      }
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-left transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{pl.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {pl.tracks.length} şarkı
                        </p>
                      </div>
                      {alreadyIn ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <Check size={14} /> Eklendi
                        </span>
                      ) : (
                        <Plus size={16} className="text-[#F06B3C]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setNewPlaylistName("");
                setIsCreateModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#F06B3C] hover:bg-[#FF8256] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Plus size={15} />
              <span>Yeni Liste Oluştur ve Ekle</span>
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL 3: SPOTIFY'DAKİ LİSTELERİMİ AKTAR ===== */}
      {isSpotifyModalOpen && (
        <div
          onClick={() => !isImportingSpotify && setIsSpotifyModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-[#1DB954]/30 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Disc3 size={20} className="text-[#1DB954]" />
                <span>Spotify Listelerimi Aktar</span>
              </h3>
              <button
                disabled={isImportingSpotify}
                onClick={() => setIsSpotifyModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Spotify <strong className="text-zinc-200">çalma listesi linkini</strong>{" "}
              (<code className="text-[#1DB954]">open.spotify.com/playlist/...</code>) veya{" "}
              <strong className="text-zinc-200">Spotify profil linkini / kullanıcı adını</strong>{" "}
              yapıştır. Tüm şarkıların kapaklarıyla birlikte Mihon&apos;a aktarılır!
            </p>

            <form onSubmit={handleSpotifyImport} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                disabled={isImportingSpotify}
                value={spotifyInput}
                onChange={(e) => setSpotifyInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/... veya kullanıcı adı"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isImportingSpotify}
                  onClick={() => setIsSpotifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isImportingSpotify}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#1DB954] hover:bg-[#1ED760] disabled:opacity-50 text-black flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isImportingSpotify ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Şarkılar Eşleştiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Listeyi Aktar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bildirim Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border ${
            toastMessage.isError
              ? "bg-rose-600 text-white border-rose-400"
              : "bg-zinc-900/95 text-white border-white/15 backdrop-blur-xl"
          }`}
        >
          <Sparkles size={14} className="text-[#F06B3C]" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HTML5 Audio Motoru */}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => {
          applyAudioSettings();
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => applyAudioSettings()}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (Number.isFinite(dur) && dur > 0) setDuration(dur);
          e.currentTarget.playbackRate = playbackRate;
          applyAudioSettings();
        }}
        onTimeUpdate={(e) => {
          if (!isSeeking) setCurrentTime(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          if (repeatMode === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else {
            handleNext(false);
          }
        }}
        onError={() => {
          if (queue.length > 1) {
            setTimeout(() => handleNext(false), 350);
          }
        }}
      />
    </div>
  );
}

