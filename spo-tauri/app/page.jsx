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
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Minus,
  Square,
  ListPlus,
  Loader2,
  SlidersHorizontal,
  MicVocal,
  Maximize2,
  Minimize2,
  Home,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

// ============================================================================
// Ana Sayfa Koleksiyon & AI Discovery Kartları
// ============================================================================
const COLLECTIONS = [
  {
    id: "global-hits",
    title: "COSMIC DRIFT",
    subtitle: "Global Hit & Trend 2026",
    query: "top global hits 2026",
    gradient: "from-sky-500 via-indigo-600 to-purple-800",
    badge: "SMART PLAYLIST",
    icon: Flame,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
  },
  {
    id: "tr-pop",
    title: "NEON PULSE",
    subtitle: "Türkçe Pop & Hit",
    query: "türkçe pop hit şarkılar 2026",
    gradient: "from-cyan-500 via-purple-600 to-indigo-900",
    badge: "POPÜLER MİKS",
    icon: Sparkles,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  },
  {
    id: "synthwave",
    title: "STARGAZER",
    subtitle: "Nightdrive Synthwave",
    query: "synthwave retrowave nightdrive mix",
    gradient: "from-fuchsia-600 via-purple-700 to-slate-900",
    badge: "RETROWAVE",
    icon: Zap,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
  },
  {
    id: "lofi-focus",
    title: "ASTRAL FOCUS",
    subtitle: "Lo-Fi Derin Odak",
    query: "lofi hip hop chill beats study",
    gradient: "from-teal-500 via-cyan-700 to-slate-900",
    badge: "CHILL AI",
    icon: Headphones,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
  },
];

const GENRE_PILLS = [
  {
    id: "tr-pop",
    label: "Türkçe Pop",
    query: "türkçe pop hit şarkılar 2026",
    style:
      "border-sky-400/60 bg-sky-500/15 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.28)] hover:bg-sky-500/25 hover:border-sky-300",
  },
  {
    id: "alt-rock",
    label: "Alternatif Rock",
    query: "türkçe alternatif rock en iyiler",
    style:
      "border-purple-400/60 bg-purple-500/15 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.28)] hover:bg-purple-500/25 hover:border-purple-300",
  },
  {
    id: "tr-rap",
    label: "Türkçe Rap",
    query: "türkçe rap hit şarkılar",
    style:
      "border-pink-400/60 bg-pink-500/15 text-pink-100 shadow-[0_0_16px_rgba(244,114,182,0.28)] hover:bg-pink-500/25 hover:border-pink-300",
  },
  {
    id: "synthwave",
    label: "Synthwave",
    query: "synthwave retrowave nightdrive mix",
    style:
      "border-indigo-400/60 bg-indigo-500/15 text-indigo-100 shadow-[0_0_16px_rgba(129,140,248,0.28)] hover:bg-indigo-500/25 hover:border-indigo-300",
  },
  {
    id: "anadolu-rock",
    label: "Anadolu Rock",
    query: "anadolu rock efsaneleri",
    style:
      "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.32)] hover:bg-emerald-500/25 hover:border-emerald-300",
  },
  {
    id: "lofi",
    label: "Lo-Fi Chill",
    query: "lofi hip hop chill beats",
    style:
      "border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.25)] hover:bg-cyan-500/25 hover:border-cyan-300",
  },
  {
    id: "acoustic",
    label: "Akustik",
    query: "türkçe akustik şarkılar",
    style:
      "border-violet-400/50 bg-violet-500/15 text-violet-100 shadow-[0_0_16px_rgba(139,92,246,0.25)] hover:bg-violet-500/25 hover:border-violet-300",
  },
];

const FEATURED_ARTISTS = [
  {
    name: "Adamlar",
    sub: "ALTERNATİF ROCK",
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&q=80",
  },
  {
    name: "Semicenk",
    sub: "TÜRKÇE POP",
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=240&q=80",
  },
  {
    name: "Funda Arar",
    sub: "POP & ARABESK",
    avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=240&q=80",
  },
  {
    name: "The Weeknd",
    sub: "SYNTH POP",
    avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=240&q=80",
  },
  {
    name: "Duman",
    sub: "ROCK EFSANESİ",
    avatar: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=240&q=80",
  },
  {
    name: "Sezen Aksu",
    sub: "TÜRKÇE POP",
    avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=240&q=80",
  },
  {
    name: "UZI",
    sub: "TÜRKÇE RAP",
    avatar: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=240&q=80",
  },
  {
    name: "Motive",
    sub: "MELODİK RAP",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=240&q=80",
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

function parseLrcLyrics(lrcText) {
  if (!lrcText || typeof lrcText !== "string") return [];
  const lines = lrcText.split(/\r?\n/);
  const parsed = [];
  const tagRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const timestamps = [];
    let match;
    tagRegex.lastIndex = 0;
    while ((match = tagRegex.exec(rawLine)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const fracStr = match[3] || "0";
      const frac =
        parseInt(fracStr, 10) / Math.pow(10, fracStr.length);
      timestamps.push(mins * 60 + secs + frac);
    }
    const text = rawLine.replace(tagRegex, "").trim();
    if (timestamps.length > 0 && text.length > 0) {
      for (const time of timestamps) {
        parsed.push({ time, text });
      }
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

function getTrackCover(track) {
  if (!track) return "";
  if (track.thumbnail && track.thumbnail.trim().length > 0) {
    return track.thumbnail;
  }
  if (track.id && track.id.length === 11 && !track.id.startsWith("sp:")) {
    return `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
  }
  return "";
}

// ============================================================================
// Albüm Kapağı Bileşeni (Skeleton + Yedek Kapak + Fallback İkon Destekli)
// ============================================================================
function TrackArtwork({ track, className = "w-11 h-11 rounded-xl", iconSize = 18 }) {
  const primarySrc = getTrackCover(track);
  const ytFallbackSrc =
    track?.id && track.id.length === 11 && !track.id.startsWith("sp:")
      ? `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`
      : "";
  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const sources = useMemo(() => {
    const list = [];
    if (primarySrc) list.push(primarySrc);
    if (ytFallbackSrc && ytFallbackSrc !== primarySrc) list.push(ytFallbackSrc);
    return list;
  }, [primarySrc, ytFallbackSrc]);

  const activeSrc = sources[srcIndex] || "";

  useEffect(() => {
    setSrcIndex(0);
    setLoaded(false);
  }, [primarySrc, ytFallbackSrc]);

  return (
    <div
      className={`relative overflow-hidden bg-zinc-800/80 border border-white/10 shrink-0 flex items-center justify-center ${className}`}
    >
      {!loaded && activeSrc && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-700/60 via-zinc-800/60 to-zinc-700/60" />
      )}
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={track?.title || "Kapak"}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setSrcIndex((prev) => prev + 1);
          }}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
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
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("queue"); // "queue" | "lyrics"
  const [lyricsData, setLyricsData] = useState({
    synced: [],
    plain: "",
    loading: false,
    error: null,
    trackId: null,
  });
  const lyricsCacheRef = useRef(new Map());
  const rightLyricsContainerRef = useRef(null);
  const mainLyricsContainerRef = useRef(null);
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
  const lastSavedPosRef = useRef(0);
  const resumePendingRef = useRef(null);

  // localStorage + Kalıcı Disk Kütüphanesi (library.json) yükleme & kurtarma + Son Şarkıdan Devam Etme
  useEffect(() => {
    let localLiked = [];
    let localRecent = [];
    let localPlaylists = [];
    let localPlayback = null;
    try {
      localLiked = JSON.parse(localStorage.getItem("liked") || "[]");
      localRecent = JSON.parse(localStorage.getItem("recent") || "[]");
      localPlaylists = JSON.parse(localStorage.getItem("custom_playlists") || "[]");
      localPlayback = JSON.parse(localStorage.getItem("mihon_playback_state") || "null");
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
        const diskPlayback = disk?.playback_state || null;

        let finalPlaylists = localPlaylists.length > 0 ? localPlaylists : diskPlaylists;
        const finalLiked = localLiked.length > 0 ? localLiked : diskLiked;
        const finalRecent = localRecent.length > 0 ? localRecent : diskRecent;
        const savedState =
          localPlayback?.currentTrack?.id ? localPlayback : diskPlayback;

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

        // Son çalan şarkıyı, kuyruğu ve kaldığı saniyeyi geri yükle (otomatik çalmadan duraklatılmış hazır beklet)
        const fallbackTrack = savedState?.currentTrack || finalRecent[0] || null;
        if (fallbackTrack && fallbackTrack.id) {
          const restoredQueue =
            Array.isArray(savedState?.queue) && savedState.queue.length > 0
              ? savedState.queue
              : [fallbackTrack, ...finalRecent.filter((t) => t.id !== fallbackTrack.id)];
          const restoredIdx = Math.max(
            0,
            restoredQueue.findIndex((t) => t.id === fallbackTrack.id)
          );
          const restoredTime = Number(savedState?.currentTime) || 0;
          const restoredDur =
            Number(savedState?.duration) || Number(fallbackTrack.duration_sec) || 0;
          isRadioModeRef.current = Boolean(savedState?.isRadioMode);

          setQueue(restoredQueue);
          setQueueIndex(restoredIdx);
          setCurrentTrack(fallbackTrack);
          setCurrentTime(restoredTime);
          setDuration(restoredDur);
          lastSavedPosRef.current = restoredTime;
          resumePendingRef.current = {
            trackId: fallbackTrack.id,
            time: restoredTime,
          };

          // Arka planda ses dosyasını hazırla ve <audio> etiketine bağla ki Play'e basınca kaldığı saniyeden anında devam etsin
          tauriInvoke("prepare_track", { id: fallbackTrack.id })
            .then((localPath) => {
              const audio = audioRef.current;
              if (
                audio &&
                !audio.src &&
                resumePendingRef.current?.trackId === fallbackTrack.id
              ) {
                audio.src = toAssetUrl(localPath);
                audio.currentTime = restoredTime;
              }
            })
            .catch(() => {});
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

  // Kütüphane ve son şarkı durumu değiştiğinde diske (`library.json`) ve localStorage'a kalıcı olarak kaydet
  const persistPlaybackState = useCallback(
    (overrideTime) => {
      if (!libraryLoadedRef.current || !currentTrack) return;
      const pos =
        typeof overrideTime === "number"
          ? overrideTime
          : audioRef.current?.currentTime || currentTime || 0;
      const playbackState = {
        currentTrack,
        queue: queue.slice(Math.max(0, queueIndex - 5), queueIndex + 35),
        queueIndex,
        currentTime: pos,
        duration: duration || currentTrack.duration_sec || 0,
        isRadioMode: isRadioModeRef.current,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem("mihon_playback_state", JSON.stringify(playbackState));
      } catch {
        /* ignore */
      }
      tauriInvoke("save_library", {
        data: {
          custom_playlists: customPlaylists,
          liked: likedTracks,
          recent: recentTracks,
          playback_state: playbackState,
        },
      }).catch(() => {});
    },
    [currentTrack, queue, queueIndex, currentTime, duration, customPlaylists, likedTracks, recentTracks]
  );

  useEffect(() => {
    if (!libraryLoadedRef.current) return;
    let savedPlayback = null;
    try {
      savedPlayback = JSON.parse(localStorage.getItem("mihon_playback_state") || "null");
    } catch {
      /* ignore */
    }
    if (currentTrack) {
      savedPlayback = {
        currentTrack,
        queue: queue.slice(Math.max(0, queueIndex - 5), queueIndex + 35),
        queueIndex,
        currentTime: audioRef.current?.currentTime || currentTime || 0,
        duration: duration || currentTrack.duration_sec || 0,
        isRadioMode: isRadioModeRef.current,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem("mihon_playback_state", JSON.stringify(savedPlayback));
      } catch {
        /* ignore */
      }
    }
    tauriInvoke("save_library", {
      data: {
        custom_playlists: customPlaylists,
        liked: likedTracks,
        recent: recentTracks,
        playback_state: savedPlayback,
      },
    }).catch(() => {});
  }, [customPlaylists, likedTracks, recentTracks, currentTrack, queue, queueIndex]);

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
      showToast(`Mihon v${updateInfo.latest_version} indirme sayfası açılıyor...`);
      try {
        await tauriInvoke("install_update", {
          downloadUrl: updateInfo.release_url || updateInfo.download_url,
        });
      } catch (err) {
        showToast(`Güncelleme hatası: ${err?.message || err}`, true);
      } finally {
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
        showToast(`Mihon güncel (v${info?.current_version || "2.1.0"})`);
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
    // İnsan kulağına uygun gerçek logaritmik/kübik ses eğrisi (x^2.7) + ReplayGain (-8.4 dB / 0.38x) tavan dengelemesi
    // Böylece %10 seviyesinde gerçekten fısıltı düzeyinde çalar ve %100'de kulak patlatmaz.
    const curvedVol = rawVol === 0 ? 0 : Math.min(1, Math.pow(rawVol, 2.7) * 0.38);
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

        // Yalnızca sıradaki 1 parçayı arka planda hazırla (gereksiz önbellek şişmesini önler)
        const nextIdx1 = index + 1;
        if (targetQueue[nextIdx1]?.id) {
          tauriInvoke("prepare_track", { id: targetQueue[nextIdx1].id }).catch(() => {});
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
      } else if (repeatMode === "all" && queue.length > 1) {
        playTrackAtIndex(queue, 0);
      } else if ((isRadioModeRef.current || userInitiated) && currentTrack) {
        try {
          if (userInitiated && displayedTracks.length > 1) {
            const dispIdx = displayedTracks.findIndex(
              (t) => t.id === currentTrack.id
            );
            if (dispIdx >= 0 && dispIdx + 1 < displayedTracks.length) {
              playTrackAtIndex(displayedTracks, dispIdx + 1);
              return;
            }
          }
          showToast(`“${currentTrack.title}” türünde sıradaki şarkıya geçiliyor...`);
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
        if (userInitiated && queue.length > 0) {
          playTrackAtIndex(queue, 0);
        } else {
          setIsPlaying(false);
        }
      } else if (userInitiated && queue.length > 0) {
        playTrackAtIndex(queue, 0);
      } else {
        setIsPlaying(false);
      }
    },
    [
      queue,
      queueIndex,
      shuffle,
      repeatMode,
      currentTrack,
      displayedTracks,
      playTrackAtIndex,
      showToast,
    ]
  );

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3 && queue.length <= 1) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (queue.length > 1) {
      const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
      playTrackAtIndex(queue, prevIdx);
      return;
    }
    if (currentTrack && displayedTracks.length > 1) {
      const dispIdx = displayedTracks.findIndex((t) => t.id === currentTrack.id);
      if (dispIdx > 0) {
        playTrackAtIndex(displayedTracks, dispIdx - 1);
        return;
      }
    }
    if (recentTracks.length > 1) {
      const prevTrack = recentTracks.find((t) => t.id !== currentTrack?.id);
      if (prevTrack) {
        playTrackAtIndex([prevTrack, ...queue], 0);
        return;
      }
    }
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  }, [queue, queueIndex, currentTrack, displayedTracks, recentTracks, playTrackAtIndex]);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      if (tracks.length > 0) playTrackAtIndex(tracks, 0);
      return;
    }
    if (!audio.src) {
      setIsTrackLoading(true);
      try {
        const localPath = await tauriInvoke("prepare_track", {
          id: currentTrack.id,
        });
        audio.src = toAssetUrl(localPath);
        audio.playbackRate = playbackRate;
        applyAudioSettings();
        const resumeSec =
          resumePendingRef.current?.trackId === currentTrack.id
            ? resumePendingRef.current.time
            : currentTime || 0;
        if (resumeSec > 0) {
          audio.currentTime = resumeSec;
        }
        resumePendingRef.current = null;
        await audio.play();
        setIsPlaying(true);
      } catch {
        /* ignore */
      } finally {
        setIsTrackLoading(false);
      }
      return;
    }
    if (audio.paused) {
      if (resumePendingRef.current?.trackId === currentTrack.id) {
        const resumeSec = resumePendingRef.current.time || 0;
        if (resumeSec > 0 && Math.abs(audio.currentTime - resumeSec) > 1) {
          audio.currentTime = resumeSec;
        }
        resumePendingRef.current = null;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [
    currentTrack,
    tracks,
    playTrackAtIndex,
    playbackRate,
    applyAudioSettings,
    currentTime,
  ]);

  // Discord Rich Presence Senkronizasyonu
  const syncDiscordPresence = useCallback(
    async (track, playing, posSec, durSec) => {
      if (!discordEnabled || !track || !playing) {
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
          isPlaying: true,
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

  const mediaKeyDebounceRef = useRef(0);

  const triggerMediaAction = useCallback(
    (action) => {
      const now = Date.now();
      if (now - mediaKeyDebounceRef.current < 250) return;
      mediaKeyDebounceRef.current = now;
      if (action === "next") {
        handleNext(true);
      } else if (action === "prev") {
        handlePrev();
      } else if (action === "playpause") {
        togglePlayPause();
      } else if (action === "stop") {
        audioRef.current?.pause();
      }
    },
    [handleNext, handlePrev, togglePlayPause]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__mihonMediaKey = triggerMediaAction;
    }
    return () => {
      if (typeof window !== "undefined" && window.__mihonMediaKey === triggerMediaAction) {
        delete window.__mihonMediaKey;
      }
    };
  }, [triggerMediaAction]);

  // Klavye Kısayolları + Windows Medya Tuşları (Fn+F5 / Fn+F6 / Fn+F7 - MediaSession API)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "MediaTrackNext") {
        e.preventDefault();
        triggerMediaAction("next");
        return;
      }
      if (e.key === "MediaTrackPrevious") {
        e.preventDefault();
        triggerMediaAction("prev");
        return;
      }
      if (e.key === "MediaPlayPause") {
        e.preventDefault();
        triggerMediaAction("playpause");
        return;
      }
      if (e.key === "MediaStop") {
        e.preventDefault();
        triggerMediaAction("stop");
        return;
      }

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
  }, [togglePlayPause, seekToSeconds, currentTime, triggerMediaAction]);

  // Windows SMTC / MediaSession Entegrasyonu (Fn+F6 vb. sistem medya tuşlarıyla arka planda da şarkı değiştirme)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;

    if (currentTrack) {
      const coverUrl = getTrackCover(currentTrack);
      try {
        ms.metadata = new MediaMetadata({
          title: currentTrack.title || "Mihon",
          artist: currentTrack.artist || "Mihon",
          album: currentTrack.album || "Mihon",
          artwork: coverUrl
            ? [
                { src: coverUrl, sizes: "512x512", type: "image/jpeg" },
                { src: coverUrl, sizes: "256x256", type: "image/jpeg" },
              ]
            : [],
        });
      } catch {
        /* ignore */
      }
    }

    ms.playbackState = isPlaying ? "playing" : "paused";

    const safeSetHandler = (action, fn) => {
      try {
        ms.setActionHandler(action, fn);
      } catch {
        /* ignore */
      }
    };

    safeSetHandler("play", () => {
      if (audioRef.current?.paused) triggerMediaAction("playpause");
    });
    safeSetHandler("pause", () => {
      if (audioRef.current && !audioRef.current.paused) triggerMediaAction("playpause");
    });
    safeSetHandler("previoustrack", () => {
      triggerMediaAction("prev");
    });
    safeSetHandler("nexttrack", () => {
      triggerMediaAction("next");
    });
    safeSetHandler("seekto", (details) => {
      if (typeof details?.seekTime === "number") {
        seekToSeconds(details.seekTime);
      }
    });
    safeSetHandler("seekbackward", (details) => {
      const offset = details?.seekOffset || 10;
      seekToSeconds((audioRef.current?.currentTime || currentTime) - offset);
    });
    safeSetHandler("seekforward", (details) => {
      const offset = details?.seekOffset || 10;
      seekToSeconds((audioRef.current?.currentTime || currentTime) + offset);
    });
  }, [
    currentTrack,
    isPlaying,
    togglePlayPause,
    handlePrev,
    handleNext,
    seekToSeconds,
    currentTime,
  ]);

  const effectiveDuration = duration || currentTrack?.duration_sec || 0;
  const displayedTime = isSeeking ? seekPreview : currentTime;
  const seekPercent =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (displayedTime / effectiveDuration) * 100))
      : 0;

  // Şarkı değiştiğinde LRCLIB üzerinden senkronize veya düz sözleri getir
  useEffect(() => {
    if (!currentTrack) {
      setLyricsData({
        synced: [],
        plain: "",
        loading: false,
        error: null,
        trackId: null,
      });
      return;
    }

    const trackId = currentTrack.id;
    const cached = lyricsCacheRef.current.get(trackId);
    if (cached) {
      setLyricsData({ ...cached, loading: false, trackId });
      return;
    }

    let cancelled = false;
    setLyricsData({
      synced: [],
      plain: "",
      loading: true,
      error: null,
      trackId,
    });

    (async () => {
      try {
        const res = await tauriInvoke("fetch_lyrics", {
          title: currentTrack.title || "",
          artist: currentTrack.artist || "",
          durationSec: Number(currentTrack.duration_sec) || 0,
        });
        if (cancelled) return;
        const syncedArr = parseLrcLyrics(res?.synced_lyrics || "");
        const plainText = (res?.plain_lyrics || "").trim();
        const entry = {
          synced: syncedArr,
          plain: plainText,
          error:
            syncedArr.length === 0 && !plainText
              ? "Bu şarkı için söz bulunamadı."
              : null,
        };
        lyricsCacheRef.current.set(trackId, entry);
        setLyricsData({ ...entry, loading: false, trackId });
      } catch (err) {
        if (cancelled) return;
        const entry = {
          synced: [],
          plain: "",
          error: typeof err === "string" ? err : "Bu şarkı için söz bulunamadı.",
        };
        lyricsCacheRef.current.set(trackId, entry);
        setLyricsData({ ...entry, loading: false, trackId });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  // O an çalan senkronize şarkı sözü satırı indeksi
  const activeLyricIndex = useMemo(() => {
    if (!lyricsData.synced || lyricsData.synced.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyricsData.synced.length; i++) {
      if (currentTime + 0.25 >= lyricsData.synced[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyricsData.synced, currentTime]);

  // Aktif şarkı sözü satırı değiştikçe yumuşakça ortala
  useEffect(() => {
    if (activeLyricIndex < 0) return;
    const scrollContainer = (container) => {
      if (!container) return;
      const activeEl = container.querySelector(
        `[data-lyric-idx="${activeLyricIndex}"]`
      );
      if (activeEl) {
        const targetTop =
          activeEl.offsetTop -
          container.clientHeight / 2 +
          activeEl.clientHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth",
        });
      }
    };
    if (activeView === "lyrics") {
      scrollContainer(mainLyricsContainerRef.current);
    }
    if (isFullscreenStage) {
      scrollContainer(fullscreenLyricsRef.current);
    }
  }, [activeLyricIndex, activeView]);

  const [discoveryIdx, setDiscoveryIdx] = useState(0);
  const [artistPageIdx, setArtistPageIdx] = useState(0);
  const [isUpNextCardOpen, setIsUpNextCardOpen] = useState(true);
  const [isFullscreenStage, setIsFullscreenStage] = useState(false);
  const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);
  const fullscreenLyricsRef = useRef(null);
  const healedTrackIdsRef = useRef(new Set());

  const healTruncatedTrack = useCallback(
    async (track, resumeSec = 0) => {
      if (!track?.id || healedTrackIdsRef.current.has(track.id)) return false;
      healedTrackIdsRef.current.add(track.id);
      const token = loadTokenRef.current;
      showToast("Yarım inmiş parça tespit edildi, tam sürümü indiriliyor...");
      try {
        const localPath = await tauriInvoke("redownload_track", { id: track.id });
        if (token !== loadTokenRef.current || !audioRef.current) return true;
        const audio = audioRef.current;
        const wasPlaying = !audio.paused || isPlaying;
        const freshUrl = `${toAssetUrl(localPath)}?v=${Date.now()}`;
        audio.src = freshUrl;
        audio.playbackRate = playbackRate;
        applyAudioSettings();
        if (resumeSec > 1) {
          audio.currentTime = resumeSec;
        }
        if (wasPlaying) {
          await audio.play().catch(() => {});
        }
        refreshCacheInfo();
        return true;
      } catch {
        return false;
      }
    },
    [applyAudioSettings, isPlaying, playbackRate, refreshCacheInfo, showToast]
  );

  const handleToggleFullscreenMode = useCallback(async (stageOnly = false) => {
    try {
      if (!stageOnly) {
        const nextWinFull = await tauriInvoke("toggle_fullscreen");
        setIsWindowFullscreen(Boolean(nextWinFull));
        setIsFullscreenStage(Boolean(nextWinFull));
      } else {
        setIsFullscreenStage((prev) => !prev);
      }
    } catch {
      setIsFullscreenStage((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        handleToggleFullscreenMode(false);
      } else if (e.key === "Escape" && (isFullscreenStage || isWindowFullscreen)) {
        setIsFullscreenStage(false);
        if (isWindowFullscreen) {
          tauriInvoke("toggle_fullscreen")
            .then((v) => setIsWindowFullscreen(Boolean(v)))
            .catch(() => setIsWindowFullscreen(false));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggleFullscreenMode, isFullscreenStage, isWindowFullscreen]);

  const recentArtistPair = useMemo(() => {
    const names = [];
    for (const t of [...recentTracks, ...likedTracks]) {
      for (const a of splitArtists(t?.artist)) {
        if (a && !names.includes(a)) names.push(a);
        if (names.length >= 2) break;
      }
      if (names.length >= 2) break;
    }
    if (names.length === 0) return ["ADAMLAR", "SEMİCENK"];
    if (names.length === 1) return [names[0], "FUNDA ARAR"];
    return [names[0], names[1]];
  }, [recentTracks, likedTracks]);

  const activeSlide = COLLECTIONS[discoveryIdx % COLLECTIONS.length] || COLLECTIONS[0];
  const visibleFeaturedArtists = useMemo(() => {
    const start = (artistPageIdx * 4) % FEATURED_ARTISTS.length;
    return FEATURED_ARTISTS.slice(start, start + 4);
  }, [artistPageIdx]);

  const [activeGenreId, setActiveGenreId] = useState("all");
  const [playlistFilter, setPlaylistFilter] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const nonEmptyPlaylists = useMemo(
    () => customPlaylists.filter((pl) => Array.isArray(pl.tracks) && pl.tracks.length > 0),
    [customPlaylists]
  );

  const playlistTotalDurationLabel = useMemo(() => {
    if (!activePlaylistObj?.tracks?.length) return "0 dk";
    const totalSec = activePlaylistObj.tracks.reduce(
      (acc, t) => acc + (Number(t.duration_sec) || 210),
      0
    );
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return hrs > 0 ? `${hrs} sa ${mins} dk` : `${mins} dk`;
  }, [activePlaylistObj]);

  const visibleTrackList = useMemo(() => {
    if (activeView === "playlist-detail" && playlistFilter.trim()) {
      const q = playlistFilter.trim().toLowerCase();
      return displayedTracks.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.artist || "").toLowerCase().includes(q) ||
          (t.album || "").toLowerCase().includes(q)
      );
    }
    if (activeView === "home" && !hasSearched) {
      return recentTracks.slice(0, 15);
    }
    return displayedTracks;
  }, [activeView, playlistFilter, displayedTracks, hasSearched, recentTracks]);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#09070f] text-[#f6f4fb] select-none">
      {/* Çok hafif, göz yormayan tek ortam ışığı */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 45% at 25% 0%, rgba(139, 92, 246, 0.12), transparent 70%), radial-gradient(45% 45% at 85% 100%, rgba(167, 139, 250, 0.08), transparent 70%)",
        }}
      />

      {/* ===== ANA ALAN: SOL SADE MENÜ + FERAH ORTA SAHNE (SAĞ PANEL YOK) ===== */}
      <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        {/* 1. SOL SADE KENAR ÇUBUĞU */}
        {isLeftSidebarOpen ? (
          <aside className="w-60 shrink-0 bg-[#110d1b]/75 border-r border-white/[0.065] backdrop-blur-2xl flex flex-col justify-between p-4">
            <div className="flex flex-col flex-1 min-h-0">
              {/* Marka & Sürüm */}
              <div
                data-tauri-drag-region
                className="flex items-center justify-between px-2 pb-6"
              >
                <div data-tauri-drag-region className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c4b5fd] to-[#7c3aed] flex items-center justify-center text-[#09070f] font-extrabold text-xs">
                    M
                  </div>
                  <span
                    data-tauri-drag-region
                    className="text-sm font-bold tracking-[0.12em] uppercase text-[#f6f4fb]"
                  >
                    Mihon
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCheckOrInstallUpdate}
                    disabled={isCheckingUpdate || isInstallingUpdate}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      updateInfo?.has_update
                        ? "bg-violet-500/30 text-violet-200 animate-pulse"
                        : "bg-[#a78bfa]/15 text-[#c4b5fd] hover:bg-[#a78bfa]/25"
                    }`}
                    title="Güncelleme Kontrolü"
                  >
                    {isInstallingUpdate
                      ? "..."
                      : updateInfo?.has_update
                      ? `v${updateInfo.latest_version}`
                      : `v${updateInfo?.current_version || "2.1.0"}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLeftSidebarOpen(false)}
                    className="p-1 rounded-md text-[#9890ad] hover:text-white hover:bg-white/[0.05] transition-colors"
                    title="Menüyü Gizle"
                  >
                    <PanelLeftClose size={14} />
                  </button>
                </div>
              </div>

              {/* Ana Menü */}
              <nav className="space-y-0.5">
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery("");
                    setPlaylistFilter("");
                    setActiveView("home");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] transition-all ${
                    activeView === "home"
                      ? "bg-[#a78bfa]/15 text-white font-semibold"
                      : "text-[#9890ad] hover:text-white hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <Home
                    size={16}
                    className={activeView === "home" ? "text-[#a78bfa]" : ""}
                  />
                  <span>Ana Sayfa</span>
                </button>

                <button
                  onClick={(e) => openSimilarRecommendations(currentTrack, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] transition-all ${
                    activeView === "recommendations"
                      ? "bg-[#a78bfa]/15 text-white font-semibold"
                      : "text-[#9890ad] hover:text-white hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles
                      size={16}
                      className={
                        activeView === "recommendations" ? "text-[#a78bfa]" : ""
                      }
                    />
                    <span>AI Keşif</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#c4b5fd]">
                    AI
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("liked")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] transition-all ${
                    activeView === "liked"
                      ? "bg-[#a78bfa]/15 text-white font-semibold"
                      : "text-[#9890ad] hover:text-white hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart
                      size={16}
                      className={activeView === "liked" ? "text-[#a78bfa]" : ""}
                    />
                    <span>Beğenilenler</span>
                  </span>
                  {likedTracks.length > 0 && (
                    <span className="text-[11px] text-[#5e5773]">
                      {likedTracks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView("recent")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] transition-all ${
                    activeView === "recent"
                      ? "bg-[#a78bfa]/15 text-white font-semibold"
                      : "text-[#9890ad] hover:text-white hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Clock
                      size={16}
                      className={activeView === "recent" ? "text-[#a78bfa]" : ""}
                    />
                    <span>Geçmiş</span>
                  </span>
                  {recentTracks.length > 0 && (
                    <span className="text-[11px] text-[#5e5773]">
                      {recentTracks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView("playlists")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] transition-all ${
                    activeView === "playlists"
                      ? "bg-[#a78bfa]/15 text-white font-semibold"
                      : "text-[#9890ad] hover:text-white hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <ListMusic
                      size={16}
                      className={
                        activeView === "playlists" ? "text-[#a78bfa]" : ""
                      }
                    />
                    <span>Çalma Listeleri</span>
                  </span>
                  <span className="text-[11px] text-[#5e5773]">
                    {customPlaylists.length}
                  </span>
                </button>
              </nav>

              <div className="h-px bg-white/[0.065] my-4 mx-2" />

              {/* Listelerim */}
              <div className="flex items-center justify-between px-2.5 pb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5e5773]">
                  Listelerim
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSpotifyModalOpen(true)}
                    className="w-6 h-6 rounded-md text-[#9890ad] hover:text-emerald-400 hover:bg-white/[0.05] flex items-center justify-center transition-colors"
                    title="Spotify Listelerimi Aktar"
                  >
                    <Disc3 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setTrackForPlaylistModal(null);
                      setNewPlaylistName("");
                      setIsCreateModalOpen(true);
                    }}
                    className="w-6 h-6 rounded-md text-[#9890ad] hover:text-white hover:bg-white/[0.05] flex items-center justify-center transition-colors"
                    title="Yeni Liste Oluştur"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
                {customPlaylists.length === 0 ? (
                  <button
                    onClick={() => {
                      setTrackForPlaylistModal(null);
                      setNewPlaylistName("");
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-dashed border-white/10 hover:border-[#a78bfa]/40 text-left text-xs text-[#9890ad] hover:text-white transition-colors"
                  >
                    + İlk Listeni Oluştur
                  </button>
                ) : (
                  customPlaylists.map((pl) => {
                    const isSelected =
                      activeView === "playlist-detail" &&
                      selectedPlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setPlaylistFilter("");
                          setSelectedPlaylistId(pl.id);
                          setActiveView("playlist-detail");
                        }}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-[9px] cursor-pointer text-[13px] transition-colors ${
                          isSelected
                            ? "bg-[#a78bfa]/15 text-white font-medium"
                            : "text-[#9890ad] hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span className="truncate pr-2">{pl.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] text-[#5e5773] group-hover:hidden">
                            {pl.tracks.length}
                          </span>
                          <button
                            onClick={(e) => handleDeletePlaylist(pl.id, e)}
                            className="hidden group-hover:flex p-1 rounded text-[#9890ad] hover:text-rose-400"
                            title="Listeyi Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Alt Sade Durum Satırı: Discord + Önbellek */}
            <div className="mt-3 pt-3 border-t border-white/[0.065] flex items-center justify-between px-1.5 text-[11px] text-[#5e5773]">
              <button
                type="button"
                onClick={() => {
                  const next = !discordEnabled;
                  setDiscordEnabled(next);
                  showToast(
                    next
                      ? "Discord Rich Presence aktif"
                      : "Discord Rich Presence kapatıldı"
                  );
                }}
                className="inline-flex items-center gap-1.5 text-[#9890ad] hover:text-white transition-colors"
                title="Discord Rich Presence Aç/Kapat"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    discordEnabled && discordConnected
                      ? "bg-[#a78bfa]"
                      : discordEnabled
                      ? "bg-[#a78bfa]/60"
                      : "bg-white/20"
                  }`}
                />
                <span>Discord</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span title={`${cacheStats.files} şarkı önbellekte`}>
                  {formatBytes(cacheStats.bytes)}
                </span>
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
                    className="text-[#5e5773] hover:text-rose-400 transition-colors"
                    title="Önbelleği Temizle"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen(true)}
            className="w-9 shrink-0 bg-[#110d1b]/75 hover:bg-[#171224] border-r border-white/[0.065] flex items-center justify-center text-[#9890ad] hover:text-white transition-colors"
            title="Menüyü Aç"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* 2. FERAH ORTA SAHNE */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Üst Sade Çubuk */}
          <header
            data-tauri-drag-region
            className="h-16 px-8 flex items-center justify-between gap-4 shrink-0"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchQuery.trim()) return;
                setHasSearched(true);
                setActiveView("home");
                performSearch(
                  searchQuery,
                  `“${searchQuery.trim()}”`,
                  "Anlık arama sonuçları"
                );
              }}
              className="flex items-center gap-2.5 w-full max-w-sm h-9 px-3.5 rounded-[11px] bg-white/[0.04] focus-within:bg-[#171224] border border-white/[0.065] focus-within:border-[#a78bfa]/40 transition-all"
            >
              <Search size={14} className="text-[#9890ad] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) setHasSearched(false);
                }}
                placeholder="Şarkı, sanatçı veya albüm ara..."
                className="w-full bg-transparent text-[13px] text-[#f6f4fb] placeholder:text-[#5e5773] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setHasSearched(false);
                  }}
                  className="text-[#9890ad] hover:text-white"
                >
                  <X size={13} />
                </button>
              ) : (
                <span className="text-[10px] text-[#5e5773] px-1.5 py-0.5 rounded border border-white/[0.065] shrink-0">
                  Ctrl K
                </span>
              )}
            </form>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveView(activeView === "lyrics" ? "home" : "lyrics")
                }
                className={`h-8 px-3 rounded-[9px] border text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
                  activeView === "lyrics"
                    ? "bg-[#a78bfa]/15 text-white border-[#a78bfa]/40"
                    : "bg-transparent text-[#9890ad] border-white/[0.065] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <MicVocal size={13} />
                <span>Sözler</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleFullscreenMode(false)}
                className="h-8 px-3 rounded-[9px] border border-white/[0.065] bg-transparent text-[#9890ad] hover:text-white hover:bg-white/[0.04] hover:border-[#a78bfa]/35 text-xs font-medium inline-flex items-center gap-1.5 transition-all"
                title="Tam Ekran Modu (F11)"
              >
                <Maximize2 size={13} />
                <span>Tam Ekran</span>
              </button>

              <div className="flex items-center gap-0.5 pl-2 ml-1 border-l border-white/[0.065]">
                <button
                  onClick={() => tauriInvoke("minimize_window").catch(() => {})}
                  className="w-7 h-7 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-[#9890ad] hover:text-white transition-colors"
                  title="Küçült"
                >
                  <Minus size={13} />
                </button>
                <button
                  onClick={() => tauriInvoke("toggle_maximize").catch(() => {})}
                  className="w-7 h-7 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-[#9890ad] hover:text-white transition-colors"
                  title="Büyüt"
                >
                  <Square size={11} />
                </button>
                <button
                  onClick={() => tauriInvoke("close_window").catch(() => {})}
                  className="w-7 h-7 rounded-md hover:bg-rose-600/80 flex items-center justify-center text-[#9890ad] hover:text-white transition-colors"
                  title="Kapat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </header>

          {/* Kaydırılabilir İçerik */}
          <div
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto px-8 pt-2 pb-8 space-y-7"
          >
            {/* SANATÇI SAYFASI */}
            {activeView === "artist" && (
              <section className="rounded-[20px] p-6 bg-[#140f22] border border-white/[0.065] flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <TrackArtwork
                    track={artistTracks[0]}
                    className="w-16 h-16 rounded-2xl"
                    iconSize={26}
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a78bfa]">
                        Sanatçı
                      </span>
                      <button
                        onClick={() => setActiveView("home")}
                        className="text-xs text-[#9890ad] hover:text-white"
                      >
                        ← Geri
                      </button>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                      {selectedArtistName}
                    </h1>
                    <p className="text-xs text-[#9890ad] mt-0.5">
                      {isLoadingArtist
                        ? "Parçalar yükleniyor..."
                        : `${artistTracks.length} popüler parça`}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* AI KEŞİF SAYFASI */}
            {activeView === "recommendations" && (
              <section className="rounded-[20px] p-6 bg-gradient-to-br from-[#18112b] via-[#110d1b] to-[#1d1433] border border-white/[0.065] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <TrackArtwork
                    track={recommendationMeta?.seedTrack || recommendedTracks[0]}
                    className="w-14 h-14 rounded-xl shrink-0"
                    iconSize={22}
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a78bfa]">
                      Akıllı AI Radyo • {recommendationMeta?.detected_genre || "Benzer Akış"}
                    </span>
                    <h1 className="text-xl font-bold text-white truncate mt-0.5">
                      “{recommendationMeta?.seed_title || "Seçili Parça"}” Benzerleri
                    </h1>
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
                        showToast("Yeni benzer parçalar ekleniyor...");
                        await extendQueueWithSimilar(seed, recommendedTracks);
                      }}
                      className="h-9 px-4 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] text-[#09070f] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles size={13} />
                      <span>+ Daha Fazla</span>
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
                        showToast(`“${plName}” kaydedildi`);
                      }}
                      className="h-9 px-4 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-[#a78bfa]/15 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <FolderPlus size={13} />
                      <span>Kaydet</span>
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* DETAYLI ÇALMA LİSTESİ BAŞLIĞI (Playlist Detail) */}
            {activeView === "playlist-detail" && activePlaylistObj && (
              <section className="rounded-[20px] p-6 bg-gradient-to-br from-[#18112b] via-[#110d1b] to-[#150e26] border border-white/[0.065] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    <TrackArtwork
                      track={
                        activePlaylistObj.cover
                          ? {
                              thumbnail: activePlaylistObj.cover,
                              title: activePlaylistObj.name,
                            }
                          : activePlaylistObj.tracks[0]
                      }
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl shadow-2xl shrink-0"
                      iconSize={44}
                    />
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a78bfa]">
                          {activePlaylistObj.source === "spotify"
                            ? "Spotify Listesi"
                            : "Çalma Listesi"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPlaylistFilter("");
                            setHasSearched(false);
                            setActiveView("home");
                          }}
                          className="text-xs text-[#9890ad] hover:text-white transition-colors"
                        >
                          ← Listelerime Dön
                        </button>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                        {activePlaylistObj.name}
                      </h1>
                      <p className="text-xs text-[#9890ad]">
                        {activePlaylistObj.tracks.length} şarkı •{" "}
                        {playlistTotalDurationLabel}
                      </p>

                      <div className="flex items-center flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          disabled={activePlaylistObj.tracks.length === 0}
                          onClick={() =>
                            activePlaylistObj.tracks.length > 0 &&
                            playTrackAtIndex(activePlaylistObj.tracks, 0)
                          }
                          className="h-9 px-5 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] disabled:opacity-40 text-[#09070f] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                        >
                          <Play size={14} className="fill-current" />
                          <span>Tümünü Çal</span>
                        </button>

                        <button
                          type="button"
                          disabled={activePlaylistObj.tracks.length === 0}
                          onClick={() => {
                            if (!activePlaylistObj.tracks.length) return;
                            setShuffle(true);
                            const rand = Math.floor(
                              Math.random() * activePlaylistObj.tracks.length
                            );
                            playTrackAtIndex(activePlaylistObj.tracks, rand);
                          }}
                          className="h-9 px-4 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Shuffle size={13} />
                          <span>Karıştır</span>
                        </button>

                        {activePlaylistObj.tracks[0] && (
                          <button
                            type="button"
                            onClick={(e) =>
                              openSimilarRecommendations(
                                activePlaylistObj.tracks[0],
                                e
                              )
                            }
                            className="h-9 px-4 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-[#a78bfa]/15 hover:border-[#a78bfa]/35 text-xs font-medium text-[#e9d5ff] inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles size={13} />
                            <span>AI Benzerleri</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) =>
                            handleDeletePlaylist(activePlaylistObj.id, e)
                          }
                          className="h-9 px-3.5 rounded-full border border-white/[0.065] hover:border-rose-500/40 hover:bg-rose-500/10 text-xs font-medium text-[#9890ad] hover:text-rose-300 inline-flex items-center gap-1.5 transition-colors"
                          title="Listeyi Sil"
                        >
                          <Trash2 size={13} />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liste İçi Hızlı Arama */}
                  <div className="flex items-center gap-2 w-full sm:w-60 h-9 px-3 rounded-[10px] bg-white/[0.04] border border-white/[0.07] focus-within:border-[#a78bfa]/40">
                    <Search size={13} className="text-[#9890ad] shrink-0" />
                    <input
                      type="text"
                      value={playlistFilter}
                      onChange={(e) => setPlaylistFilter(e.target.value)}
                      placeholder="Bu listede ara..."
                      className="w-full bg-transparent text-xs text-white placeholder:text-[#5e5773] focus:outline-none"
                    />
                    {playlistFilter && (
                      <button
                        type="button"
                        onClick={() => setPlaylistFilter("")}
                        className="text-[#9890ad] hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ANA SAYFA: DOĞRUDAN KULLANICININ KENDİ LİSTELERİ (Boş listeler gizli) */}
            {activeView === "home" && !hasSearched && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                      Listelerim
                    </h1>
                    <p className="text-xs text-[#5e5773] mt-0.5">
                      {nonEmptyPlaylists.length} çalma listesi
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSpotifyModalOpen(true)}
                      className="h-8 px-3.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Disc3 size={13} />
                      <span>Spotify Aktar</span>
                    </button>
                    <button
                      onClick={() => {
                        setTrackForPlaylistModal(null);
                        setNewPlaylistName("");
                        setIsCreateModalOpen(true);
                      }}
                      className="h-8 px-3.5 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] text-[#09070f] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={13} />
                      <span>Yeni Liste</span>
                    </button>
                  </div>
                </div>

                {nonEmptyPlaylists.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-white/10">
                    <ListMusic size={30} className="mx-auto text-[#5e5773] mb-2" />
                    <p className="text-sm text-[#9890ad]">
                      Henüz dolu bir çalma listen yok. Spotify&apos;dan aktarabilir veya yeni liste oluşturabilirsin.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {nonEmptyPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setPlaylistFilter("");
                          setSelectedPlaylistId(pl.id);
                          setActiveView("playlist-detail");
                        }}
                        className="group p-3.5 rounded-2xl bg-[#110d1b] hover:bg-[#171224] border border-white/[0.065] hover:border-[#a78bfa]/30 cursor-pointer transition-all"
                      >
                        <div className="relative aspect-square mb-3">
                          <TrackArtwork
                            track={
                              pl.cover
                                ? { thumbnail: pl.cover, title: pl.name }
                                : pl.tracks[0]
                            }
                            className="w-full h-full rounded-xl"
                            iconSize={32}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pl.tracks.length > 0)
                                playTrackAtIndex(pl.tracks, 0);
                            }}
                            className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-[#f6f4fb] text-[#09070f] flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                            title="Listeyi Çal"
                          >
                            <Play size={15} className="fill-current ml-0.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {pl.name}
                        </p>
                        <p className="text-xs text-[#5e5773] mt-0.5">
                          {pl.tracks.length} şarkı
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ÇALMA LİSTELERİM */}
            {activeView === "playlists" && (
              <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-xl font-bold text-white">Çalma Listelerim</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSpotifyModalOpen(true)}
                      className="h-9 px-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Disc3 size={14} />
                      <span>Spotify&apos;dan Aktar</span>
                    </button>
                    <button
                      onClick={() => {
                        setTrackForPlaylistModal(null);
                        setNewPlaylistName("");
                        setIsCreateModalOpen(true);
                      }}
                      className="h-9 px-4 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] text-[#09070f] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} />
                      <span>Yeni Liste</span>
                    </button>
                  </div>
                </div>

                {customPlaylists.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-white/10">
                    <ListMusic size={34} className="mx-auto text-[#5e5773] mb-3" />
                    <p className="text-sm font-medium text-[#9890ad]">
                      Henüz çalma listen yok
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {customPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setPlaylistFilter("");
                          setSelectedPlaylistId(pl.id);
                          setActiveView("playlist-detail");
                        }}
                        className="group p-3.5 rounded-2xl bg-[#110d1b] hover:bg-[#171224] border border-white/[0.065] cursor-pointer transition-all"
                      >
                        <div className="relative aspect-square mb-3">
                          <TrackArtwork
                            track={
                              pl.cover
                                ? { thumbnail: pl.cover, title: pl.name }
                                : pl.tracks[0]
                            }
                            className="w-full h-full rounded-xl"
                            iconSize={32}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pl.tracks.length > 0)
                                playTrackAtIndex(pl.tracks, 0);
                            }}
                            className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-[#f6f4fb] text-[#09070f] flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                          >
                            <Play size={15} className="fill-current ml-0.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {pl.name}
                        </p>
                        <p className="text-xs text-[#5e5773] mt-0.5">
                          {pl.tracks.length} parça
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SADE SENKRONİZE ŞARKI SÖZLERİ (Çerçevesiz, Scrollbar'sız, Ortalanmış) */}
            {activeView === "lyrics" && (
              <section className="relative h-full min-h-[460px] flex flex-col">
                <div
                  ref={mainLyricsContainerRef}
                  className="flex-1 overflow-y-auto no-scrollbar py-16 px-4 md:px-10"
                >
                  <div className="max-w-3xl mx-auto space-y-6">
                    {!currentTrack ? (
                      <div className="py-24 text-center text-[#5e5773]">
                        <MicVocal size={34} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">Şarkı seçilmedi</p>
                      </div>
                    ) : lyricsData.loading ? (
                      <div className="py-24 flex justify-center">
                        <Loader2 size={26} className="animate-spin text-[#a78bfa]" />
                      </div>
                    ) : lyricsData.synced.length > 0 ? (
                      lyricsData.synced.map((line, i) => {
                        const isActive = i === activeLyricIndex;
                        return (
                          <p
                            key={`${line.time}_${i}`}
                            data-lyric-idx={i}
                            onClick={() => seekToSeconds(line.time)}
                            className={`cursor-pointer leading-snug tracking-tight transition-colors duration-200 ${
                              isActive
                                ? "text-white text-2xl md:text-3xl font-bold"
                                : "text-white/25 hover:text-white/60 text-xl md:text-2xl font-semibold"
                            }`}
                          >
                            {line.text}
                          </p>
                        );
                      })
                    ) : lyricsData.plain ? (
                      <div className="whitespace-pre-line text-lg leading-relaxed font-medium text-[#d4cfe3]">
                        {lyricsData.plain}
                      </div>
                    ) : (
                      <div className="py-24 text-center text-[#5e5773]">
                        <p className="text-sm font-medium">
                          {lyricsData.error || "Söz bulunamadı"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* SADE ŞARKI LİSTESİ TABLOSU */}
            {activeView !== "playlists" &&
              activeView !== "lyrics" &&
              !(activeView === "home" && !hasSearched && visibleTrackList.length === 0) && (
              <section className="space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold tracking-tight text-white">
                      {activeView === "artist"
                        ? `${selectedArtistName} — Popüler`
                        : activeView === "recommendations"
                        ? `${recommendationMeta?.detected_genre || "Benzer"} Parçalar`
                        : activeView === "liked"
                        ? "Beğenilen Şarkılar"
                        : activeView === "recent"
                        ? "Son Çalınanlar"
                        : activeView === "playlist-detail"
                        ? playlistFilter.trim()
                          ? `Arama Sonuçları (${visibleTrackList.length})`
                          : "Liste İçeriği"
                        : hasSearched
                        ? sectionTitle
                        : "Son Çalınanlar"}
                    </h2>
                    {activeView === "home" && hasSearched && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setHasSearched(false);
                        }}
                        className="text-xs text-[#9890ad] hover:text-white"
                      >
                        ← Listelerime Dön
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#5e5773]">
                      {visibleTrackList.length} parça
                    </span>
                    <button
                      disabled={visibleTrackList.length === 0}
                      onClick={() => {
                        if (!visibleTrackList.length) return;
                        setShuffle(true);
                        const rand = Math.floor(
                          Math.random() * visibleTrackList.length
                        );
                        playTrackAtIndex(visibleTrackList, rand);
                      }}
                      className="text-xs font-medium text-[#9890ad] hover:text-white disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Shuffle size={12} />
                      <span>Karıştır</span>
                    </button>
                  </div>
                </div>

                {(activeView === "home" && hasSearched && isLoadingTracks) ||
                (activeView === "artist" && isLoadingArtist) ||
                (activeView === "recommendations" && isLoadingRecs) ? (
                  <TrackSkeletonList count={8} />
                ) : visibleTrackList.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-white/[0.05]">
                    <Music2 size={32} className="mx-auto text-[#5e5773] mb-2" />
                    <p className="text-sm text-[#9890ad]">
                      {playlistFilter.trim()
                        ? "Bu aramayla eşleşen şarkı yok"
                        : "Burada henüz şarkı yok"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {visibleTrackList.map((track, idx) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const liked = isTrackLiked(track.id);
                      return (
                        <div
                          key={`${track.id}_${idx}`}
                          onClick={() => {
                            if (
                              (activeView === "home" && hasSearched) ||
                              activeView === "recent"
                            ) {
                              isRadioModeRef.current = false;
                              playTrackAtIndex([track], 0);
                            } else {
                              isRadioModeRef.current =
                                activeView === "recommendations";
                              playTrackAtIndex(visibleTrackList, idx);
                            }
                          }}
                          className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isCurrent
                              ? "bg-[#a78bfa]/10"
                              : "hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Sıra / Ekolayzır */}
                          <div className="w-6 flex items-center justify-center shrink-0">
                            {isCurrent && isTrackLoading ? (
                              <Loader2
                                size={15}
                                className="text-[#a78bfa] animate-spin"
                              />
                            ) : isCurrent && isPlaying ? (
                              <div className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 h-full bg-[#a78bfa] eq-bar eq-bar-1" />
                                <span className="w-0.5 h-full bg-[#a78bfa] eq-bar eq-bar-2" />
                                <span className="w-0.5 h-full bg-[#a78bfa] eq-bar eq-bar-3" />
                              </div>
                            ) : (
                              <>
                                <span
                                  className={`text-xs tabular-nums group-hover:hidden ${
                                    isCurrent ? "text-[#a78bfa] font-semibold" : "text-[#5e5773]"
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                                <Play
                                  size={13}
                                  className="hidden group-hover:block text-white fill-current"
                                />
                              </>
                            )}
                          </div>

                          <TrackArtwork
                            track={track}
                            className="w-10 h-10 rounded-[9px]"
                          />

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13.5px] font-semibold truncate ${
                                isCurrent ? "text-[#ddd6fe]" : "text-[#f6f4fb]"
                              }`}
                            >
                              {track.title}
                            </p>
                            <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-[#9890ad] truncate mt-0.5">
                              {splitArtists(track.artist).map(
                                (art, aIdx, arr) => (
                                  <React.Fragment key={`${art}_${aIdx}`}>
                                    <button
                                      type="button"
                                      onClick={(e) => openArtistPage(art, e)}
                                      className="hover:text-white transition-colors truncate"
                                    >
                                      {art}
                                    </button>
                                    {aIdx < arr.length - 1 && (
                                      <span className="text-[#5e5773]">•</span>
                                    )}
                                  </React.Fragment>
                                )
                              )}
                            </div>
                          </div>

                          <div className="hidden md:block w-44 text-xs text-[#5e5773] truncate">
                            {track.album}
                          </div>

                          <div
                            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) =>
                                openSimilarRecommendations(track, e)
                              }
                              className="p-1.5 rounded-md text-[#9890ad] hover:text-[#c4b5fd] hover:bg-white/[0.05]"
                              title="Benzerlerini Öner (AI)"
                            >
                              <Sparkles size={14} />
                            </button>
                            <button
                              onClick={() => setTrackForPlaylistModal(track)}
                              className="p-1.5 rounded-md text-[#9890ad] hover:text-white hover:bg-white/[0.05]"
                              title="Listeye Ekle"
                            >
                              <ListPlus size={14} />
                            </button>
                            <button
                              onClick={(e) => toggleLikeTrack(track, e)}
                              className={`p-1.5 rounded-md transition-colors ${
                                liked
                                  ? "text-[#a78bfa]"
                                  : "text-[#9890ad] hover:text-white"
                              }`}
                              title={liked ? "Beğeniden Çıkar" : "Beğen"}
                            >
                              <Heart
                                size={14}
                                className={liked ? "fill-current" : ""}
                              />
                            </button>
                            {activeView === "playlist-detail" &&
                              activePlaylistObj && (
                                <button
                                  onClick={(e) =>
                                    handleRemoveTrackFromPlaylist(
                                      activePlaylistObj.id,
                                      track.id,
                                      e
                                    )
                                  }
                                  className="p-1.5 rounded-md text-[#9890ad] hover:text-rose-400"
                                  title="Listeden Kaldır"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                          </div>

                          <div className="w-11 text-right text-xs text-[#5e5773] tabular-nums">
                            {track.duration || "0:00"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      {/* ===== MİNİMAL ALT OYNATICI ÇUBUĞU ===== */}
      <footer className="relative z-20 h-[82px] px-6 bg-[#0e0a17]/95 border-t border-white/[0.065] backdrop-blur-2xl grid grid-cols-3 items-center gap-5 shrink-0">
        {/* Sol: Çalan Parça */}
        <div className="flex items-center gap-3.5 min-w-0">
          <TrackArtwork
            track={currentTrack}
            className="w-12 h-12 rounded-[10px]"
            iconSize={20}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-[#f6f4fb] truncate">
              {currentTrack ? currentTrack.title : "Mihon"}
            </p>
            {currentTrack ? (
              <div className="flex items-center gap-x-1.5 text-xs text-[#9890ad] truncate mt-0.5">
                {splitArtists(currentTrack.artist).map((art, aIdx, arr) => (
                  <React.Fragment key={`${art}_${aIdx}`}>
                    <button
                      type="button"
                      onClick={(e) => openArtistPage(art, e)}
                      className="hover:text-white transition-colors truncate"
                    >
                      {art}
                    </button>
                    {aIdx < arr.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5e5773] truncate mt-0.5">
                Bir parça seçin
              </p>
            )}
          </div>
          {currentTrack && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => toggleLikeTrack(currentTrack, e)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isTrackLiked(currentTrack.id)
                    ? "text-[#a78bfa]"
                    : "text-[#9890ad] hover:text-white"
                }`}
                title="Beğen"
              >
                <Heart
                  size={16}
                  className={isTrackLiked(currentTrack.id) ? "fill-current" : ""}
                />
              </button>
              <button
                onClick={() => setTrackForPlaylistModal(currentTrack)}
                className="p-1.5 rounded-lg text-[#9890ad] hover:text-white transition-colors"
                title="Listeye Ekle"
              >
                <ListPlus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Orta: Kontroller & İnce Seekbar */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShuffle((s) => !s);
                showToast(!shuffle ? "Karıştırma açıldı" : "Karıştırma kapatıldı");
              }}
              className={`p-1 rounded-md transition-colors ${
                shuffle ? "text-[#a78bfa]" : "text-[#9890ad] hover:text-white"
              }`}
              title="Karıştır"
            >
              <Shuffle size={15} />
            </button>

            <button
              onClick={handlePrev}
              className="p-1 text-[#d4cfe3] hover:text-white transition-colors"
              title="Önceki"
            >
              <SkipBack size={18} className="fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] text-[#09070f] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              title="Oynat / Duraklat"
            >
              {isTrackLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNext(true)}
              className="p-1 text-[#d4cfe3] hover:text-white transition-colors"
              title="Sonraki"
            >
              <SkipForward size={18} className="fill-current" />
            </button>

            <button
              onClick={() => {
                const next =
                  repeatMode === "off"
                    ? "all"
                    : repeatMode === "all"
                    ? "one"
                    : "off";
                setRepeatMode(next);
              }}
              className={`p-1 rounded-md transition-colors ${
                repeatMode !== "off"
                  ? "text-[#a78bfa]"
                  : "text-[#9890ad] hover:text-white"
              }`}
              title="Tekrarla"
            >
              {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>
          </div>

          <div className="w-full max-w-lg flex items-center gap-2.5">
            <span className="text-[11px] text-[#5e5773] tabular-nums w-8 text-right">
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
            <span className="text-[11px] text-[#5e5773] tabular-nums w-8">
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* Sağ: Hız, Sözler, Ses, Tam Ekran */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={cyclePlaybackSpeed}
            className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors ${
              playbackRate !== 1
                ? "border-[#a78bfa]/40 bg-[#a78bfa]/15 text-[#e9d5ff]"
                : "border-white/[0.065] text-[#9890ad] hover:text-white"
            }`}
            title="Oynatma Hızı"
          >
            {playbackRate}x
          </button>

          <button
            onClick={() =>
              setActiveView(activeView === "lyrics" ? "home" : "lyrics")
            }
            className={`p-1.5 rounded-md transition-colors ${
              activeView === "lyrics"
                ? "text-[#a78bfa]"
                : "text-[#9890ad] hover:text-white"
            }`}
            title="Şarkı Sözleri"
          >
            <MicVocal size={15} />
          </button>

          <button
            onClick={() => setIsMuted((m) => !m)}
            className="p-1 text-[#9890ad] hover:text-white transition-colors"
            title="Ses"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} />
            ) : volume < 0.5 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
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
              volumeRef.current = v;
              mutedRef.current = false;
              applyAudioSettings();
              setVolume(v);
              setIsMuted(false);
              localStorage.setItem("volume", JSON.stringify(v));
            }}
            style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
            className="helios-slider w-20"
          />

          <button
            onClick={() => handleToggleFullscreenMode(false)}
            className="p-1.5 rounded-md text-[#9890ad] hover:text-white transition-colors"
            title="Tam Ekran Modu (F11)"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </footer>

      {/* ===== SADE TAM EKRAN SAHNE MODU (F11 / Tam Ekran) ===== */}
      {isFullscreenStage && (
        <div className="fixed inset-0 z-40 bg-[#09070f] flex flex-col justify-between px-10 md:px-14 py-9 overflow-hidden select-none">
          {currentTrack && (
            <div
              className="pointer-events-none absolute inset-0 opacity-20 blur-[90px] scale-125"
              style={{
                backgroundImage: `url(${getTrackCover(currentTrack)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          <div
            data-tauri-drag-region
            className="relative z-10 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c4b5fd] to-[#7c3aed] flex items-center justify-center text-[#09070f] font-extrabold text-xs">
                M
              </div>
              <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">
                Mihon
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggleFullscreenMode(false)}
              className="h-8 px-3.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[#d4cfe3] hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 size={13} />
              <span>Tam Ekrandan Çık (ESC)</span>
            </button>
          </div>

          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl w-full mx-auto min-h-0 my-6">
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-[22px] overflow-hidden border border-white/10 shadow-2xl bg-[#110d1b]">
                <TrackArtwork
                  track={currentTrack}
                  className="w-full h-full rounded-none border-0"
                  iconSize={64}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-5 truncate max-w-sm">
                {currentTrack ? currentTrack.title : "Mihon"}
              </h1>
              <p className="text-sm text-[#9890ad] mt-1 truncate max-w-sm">
                {currentTrack ? currentTrack.artist : "Bir parça seçin"}
              </p>
            </div>

            <div
              ref={fullscreenLyricsRef}
              className="lg:col-span-7 max-h-[55vh] overflow-y-auto no-scrollbar space-y-5 pr-3"
            >
              {!currentTrack ? (
                <p className="text-base text-[#5e5773]">Şarkı seçilmedi</p>
              ) : lyricsData.loading ? (
                <Loader2 size={28} className="animate-spin text-[#a78bfa]" />
              ) : lyricsData.synced.length > 0 ? (
                lyricsData.synced.map((line, i) => {
                  const isActive = i === activeLyricIndex;
                  return (
                    <p
                      key={`fs_${line.time}_${i}`}
                      data-lyric-idx={i}
                      onClick={() => seekToSeconds(line.time)}
                      className={`cursor-pointer text-2xl sm:text-3xl font-bold leading-snug transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-white/25 hover:text-white/60"
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : lyricsData.plain ? (
                <div className="whitespace-pre-line text-xl leading-relaxed font-semibold text-white/80">
                  {lyricsData.plain}
                </div>
              ) : (
                <p className="text-base text-[#5e5773]">
                  {lyricsData.error || "Söz bulunamadı"}
                </p>
              )}
            </div>
          </div>

          <div className="relative z-10 max-w-2xl w-full mx-auto space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#9890ad] tabular-nums w-9 text-right">
                {formatTime(displayedTime)}
              </span>
              <input
                type="range"
                min={0}
                max={effectiveDuration || 100}
                step={0.1}
                value={displayedTime}
                disabled={!currentTrack}
                onChange={(e) => seekToSeconds(parseFloat(e.target.value))}
                style={{ "--progress": `${seekPercent}%` }}
                className="helios-slider flex-1"
              />
              <span className="text-xs text-[#9890ad] tabular-nums w-9">
                {formatTime(effectiveDuration)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handlePrev}
                className="p-2 text-[#d4cfe3] hover:text-white transition-colors"
              >
                <SkipBack size={22} className="fill-current" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-[#f6f4fb] hover:bg-[#e9d5ff] text-[#09070f] flex items-center justify-center transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause size={20} className="fill-current" />
                ) : (
                  <Play size={20} className="fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={() => handleNext(true)}
                className="p-2 text-[#d4cfe3] hover:text-white transition-colors"
              >
                <SkipForward size={22} className="fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL 1: YENİ ÇALMA LİSTESİ OLUŞTUR ===== */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#110d1b] border border-white/15 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FolderPlus size={20} className="text-[#a78bfa]" />
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
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a78bfa]"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#a78bfa] hover:bg-[#c4b5fd] text-white shadow-lg shadow-orange-500/25"
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
            className="w-full max-w-md rounded-2xl bg-[#110d1b] border border-white/15 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ListPlus size={19} className="text-[#a78bfa]" />
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
                        <Plus size={16} className="text-[#a78bfa]" />
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
              className="w-full py-2.5 rounded-xl bg-[#a78bfa] hover:bg-[#c4b5fd] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
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
            className="w-full max-w-md rounded-2xl bg-[#110d1b] border border-[#1DB954]/30 p-6 shadow-2xl space-y-4"
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
              : "bg-[#110d1b]/95 text-white border-white/15 backdrop-blur-xl"
          }`}
        >
          <Sparkles size={14} className="text-[#a78bfa]" />
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
        onPause={() => {
          setIsPlaying(false);
          persistPlaybackState(audioRef.current?.currentTime || currentTime);
          tauriInvoke("clear_discord_presence").catch(() => {});
        }}
        onLoadedData={() => applyAudioSettings()}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (Number.isFinite(dur) && dur > 0) {
            setDuration(dur);
            const expected = Number(currentTrack?.duration_sec) || 0;
            if (
              currentTrack?.id &&
              expected >= 45 &&
              dur < expected * 0.72 &&
              !healedTrackIdsRef.current.has(currentTrack.id)
            ) {
              healTruncatedTrack(currentTrack, e.currentTarget.currentTime || 0);
            }
          }
          e.currentTarget.playbackRate = playbackRate;
          applyAudioSettings();
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (!isSeeking) setCurrentTime(t);
          if (Math.abs(t - lastSavedPosRef.current) >= 4) {
            lastSavedPosRef.current = t;
            persistPlaybackState(t);
          }
        }}
        onEnded={async () => {
          const expected = Number(currentTrack?.duration_sec) || 0;
          const played = audioRef.current?.currentTime || currentTime || 0;
          if (
            currentTrack?.id &&
            expected >= 45 &&
            played < expected * 0.72 &&
            !healedTrackIdsRef.current.has(currentTrack.id)
          ) {
            const healed = await healTruncatedTrack(currentTrack, played);
            if (healed) return;
          }
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

