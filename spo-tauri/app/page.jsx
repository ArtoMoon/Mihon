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

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#090514] text-purple-50 select-none">
      {/* Kozmik Mor / Violet / Fuchsia Aurora Arka Plan Efektleri */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-36 left-1/4 w-[650px] h-[440px] rounded-full blur-[145px] opacity-35 cosmic-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.65) 0%, rgba(217,70,239,0.4) 55%, transparent 100%)",
          }}
        />
        <div
          className="absolute -bottom-36 -left-20 w-[540px] h-[540px] rounded-full blur-[135px] opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(192,38,211,0.35) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-1/4 -right-24 w-[520px] h-[520px] rounded-full blur-[150px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(192,132,252,0.55) 0%, rgba(124,58,237,0.4) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* ===== ANA 3 SÜTUNLU SYNTHESIA (MOR TEMA) PENCERE DÜZENİ ===== */}
      <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        {/* 1. SOL SÜTUN: SYNTHESIA KENAR ÇUBUĞU (M I H O N) */}
        {isLeftSidebarOpen ? (
          <aside className="relative w-60 shrink-0 bg-[#100821]/90 border-r border-purple-400/[0.1] backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
            {/* Sol Alt Kozmik Mor Dalga Grafiği */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden opacity-55">
              <div className="absolute -bottom-12 -left-10 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-600/50 via-fuchsia-500/35 to-transparent blur-2xl" />
              <svg
                viewBox="0 0 240 180"
                fill="none"
                className="absolute bottom-0 left-0 w-full h-44"
              >
                <path
                  d="M-20 180 C 30 90, 110 140, 260 40 L 260 180 Z"
                  fill="url(#mihonWave1)"
                  fillOpacity="0.32"
                />
                <path
                  d="M-20 180 C 60 120, 140 70, 260 110 L 260 180 Z"
                  fill="url(#mihonWave2)"
                  fillOpacity="0.26"
                />
                <defs>
                  <linearGradient id="mihonWave1" x1="0" y1="0" x2="240" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#e879f9" />
                  </linearGradient>
                  <linearGradient id="mihonWave2" x1="240" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col flex-1 min-h-0 p-4">
              {/* Üst Marka Başlığı: M I H O N */}
              <div
                data-tauri-drag-region
                className="flex items-center justify-between pt-1 pb-6 px-2"
              >
                <span
                  data-tauri-drag-region
                  className="text-lg font-light tracking-[0.34em] uppercase text-purple-100 drop-shadow-[0_0_14px_rgba(192,132,252,0.5)]"
                >
                  MIHON
                </span>
                <button
                  type="button"
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/10 transition-colors"
                  title="Sol Menüyü Gizle"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>

              {/* Ana Gezinme Menüsü (Parlayan Mor Sol Çizgi ile) */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveView("home")}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-r-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all ${
                    activeView === "home"
                      ? "border-l-[3px] border-purple-400 bg-gradient-to-r from-purple-500/25 via-purple-900/40 to-transparent text-white shadow-[0_4px_20px_rgba(168,85,247,0.18)]"
                      : "border-l-[3px] border-transparent text-purple-200/60 hover:text-white hover:bg-purple-500/[0.06]"
                  }`}
                >
                  <Home
                    size={16}
                    className={
                      activeView === "home"
                        ? "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
                        : "text-purple-300/60"
                    }
                  />
                  <span>HOME</span>
                </button>

                <button
                  onClick={(e) => openSimilarRecommendations(currentTrack, e)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all ${
                    activeView === "recommendations"
                      ? "border-l-[3px] border-purple-400 bg-gradient-to-r from-purple-500/25 via-purple-900/40 to-transparent text-white shadow-[0_4px_20px_rgba(168,85,247,0.18)]"
                      : "border-l-[3px] border-transparent text-purple-200/60 hover:text-white hover:bg-purple-500/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <Compass
                      size={16}
                      className={
                        activeView === "recommendations"
                          ? "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
                          : "text-purple-300/60"
                      }
                    />
                    <span>DISCOVER</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/25 text-purple-200 border border-purple-400/40">
                    AI
                  </span>
                </button>

                <button
                  onClick={() => setActiveView("liked")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all ${
                    activeView === "liked"
                      ? "border-l-[3px] border-purple-400 bg-gradient-to-r from-purple-500/25 via-purple-900/40 to-transparent text-white shadow-[0_4px_20px_rgba(168,85,247,0.18)]"
                      : "border-l-[3px] border-transparent text-purple-200/60 hover:text-white hover:bg-purple-500/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <Heart
                      size={16}
                      className={
                        activeView === "liked"
                          ? "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
                          : "text-purple-300/60"
                      }
                    />
                    <span>BEĞENİLENLER</span>
                  </span>
                  {likedTracks.length > 0 && (
                    <span className="text-[10px] text-purple-300/70 font-bold">
                      {likedTracks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView("recent")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all ${
                    activeView === "recent"
                      ? "border-l-[3px] border-purple-400 bg-gradient-to-r from-purple-500/25 via-purple-900/40 to-transparent text-white shadow-[0_4px_20px_rgba(168,85,247,0.18)]"
                      : "border-l-[3px] border-transparent text-purple-200/60 hover:text-white hover:bg-purple-500/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <Clock
                      size={16}
                      className={
                        activeView === "recent"
                          ? "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
                          : "text-purple-300/60"
                      }
                    />
                    <span>GEÇMİŞ</span>
                  </span>
                  {recentTracks.length > 0 && (
                    <span className="text-[10px] text-purple-300/70 font-bold">
                      {recentTracks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView("playlists")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-r-xl text-xs font-semibold tracking-[0.12em] uppercase transition-all ${
                    activeView === "playlists"
                      ? "border-l-[3px] border-purple-400 bg-gradient-to-r from-purple-500/25 via-purple-900/40 to-transparent text-white shadow-[0_4px_20px_rgba(168,85,247,0.18)]"
                      : "border-l-[3px] border-transparent text-purple-200/60 hover:text-white hover:bg-purple-500/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <ListMusic
                      size={16}
                      className={
                        activeView === "playlists"
                          ? "text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]"
                          : "text-purple-300/60"
                      }
                    />
                    <span>LIBRARY</span>
                  </span>
                  <span className="text-[10px] text-purple-300/70 font-bold">
                    {customPlaylists.length}
                  </span>
                </button>
              </nav>

              {/* PLAYLISTS Bölümü */}
              <div className="mt-6 pt-5 border-t border-purple-400/[0.1] flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-2 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-300/70">
                    PLAYLISTS
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsSpotifyModalOpen(true)}
                      className="flex items-center gap-1 text-[10px] font-bold text-purple-200 hover:text-white px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/35 transition-colors"
                      title="Spotify Listelerimi Aktar"
                    >
                      <Disc3 size={11} />
                      <span>Spotify</span>
                    </button>
                    <button
                      onClick={() => {
                        setTrackForPlaylistModal(null);
                        setNewPlaylistName("");
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1 rounded-md text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/30 transition-colors"
                      title="Yeni Çalma Listesi Oluştur"
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
                      className="w-full p-3 rounded-xl border border-dashed border-purple-400/20 hover:border-purple-400/50 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-200 group-hover:text-purple-300">
                        <FolderPlus size={14} />
                        <span>İlk Listeni Oluştur</span>
                      </div>
                    </button>
                  ) : (
                    customPlaylists.map((pl, idx) => {
                      const isSelected =
                        activeView === "playlist-detail" && selectedPlaylistId === pl.id;
                      const PlaylistIcon =
                        idx % 3 === 0 ? Music2 : idx % 3 === 1 ? Sparkles : ListMusic;
                      return (
                        <div
                          key={pl.id}
                          onClick={() => {
                            setSelectedPlaylistId(pl.id);
                            setActiveView("playlist-detail");
                          }}
                          className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-500/20 text-white border border-purple-400/40"
                              : "hover:bg-purple-500/[0.08] text-purple-100/80 border border-transparent"
                          }`}
                        >
                          <PlaylistIcon
                            size={15}
                            className={
                              isSelected
                                ? "text-purple-300 shrink-0"
                                : "text-purple-300/60 group-hover:text-purple-300 shrink-0"
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{pl.name}</p>
                            <p className="text-[10px] text-purple-300/50">
                              {pl.tracks.length} parça
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeletePlaylist(pl.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-purple-300/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Listeyi Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Alt Önbellek (350 MB Akıllı LRU) Kartı */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#160b2e]/85 border border-purple-400/15 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/35 flex items-center justify-center text-purple-300 shrink-0">
                    <HardDrive size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-purple-100 truncate">
                      {formatBytes(cacheStats.bytes)} Önbellek
                    </p>
                    <p className="text-[10px] text-purple-300/60">
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
                    className="p-1.5 rounded-lg text-purple-300/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Önbelleği Temizle"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setIsLeftSidebarOpen(true)}
            className="w-8 shrink-0 bg-[#100821]/90 hover:bg-[#190d33] border-r border-purple-400/10 flex flex-col items-center justify-center gap-2 text-purple-300/70 hover:text-purple-200 transition-all group"
            title="Sol Menüyü Aç"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* 2. ORTA + SAĞ ALAN (Üst Pencere/Arama Çubuğu + İçerik + Sağ NOW PLAYING) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* ÜST ÇUBUK (`< >` Oklar + Arama Çubuğu + Tam Ekran Modu + Pencere Kontrolleri) */}
          <header
            data-tauri-drag-region
            className="h-14 px-6 flex items-center justify-between border-b border-purple-400/[0.08] bg-[#100821]/65 backdrop-blur-2xl shrink-0"
          >
            {/* Sol: Geri / İleri Okları + Arama Kutusu */}
            <div data-tauri-drag-region className="flex items-center gap-2.5 flex-1 max-w-xl">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveView("home")}
                  className="w-7 h-7 rounded-lg bg-purple-500/[0.07] hover:bg-purple-500/15 border border-purple-400/15 flex items-center justify-center text-purple-200/70 hover:text-white transition-colors"
                  title="Ana Sayfa"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => openSimilarRecommendations(currentTrack, e)}
                  className="w-7 h-7 rounded-lg bg-purple-500/[0.07] hover:bg-purple-500/15 border border-purple-400/15 flex items-center justify-center text-purple-200/70 hover:text-white transition-colors"
                  title="AI Keşif"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

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
                className="flex items-center gap-2.5 w-full max-w-sm px-3.5 py-1.5 rounded-xl bg-[#190f32]/90 hover:bg-[#211342] focus-within:bg-[#1d113a] focus-within:ring-1 focus-within:ring-purple-400/60 border border-purple-400/15 transition-all"
              >
                <Search size={14} className="text-purple-300/70 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search / Şarkı veya sanatçı ara..."
                  className="w-full bg-transparent text-xs text-purple-50 placeholder:text-purple-300/50 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-purple-300/60 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </form>
            </div>

            {/* Sağ: Tam Ekran Modu, Sözler, Discord RPC, Güncelleme, Profil ve Pencere Kontrolleri */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleFullscreenMode(false)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  isFullscreenStage || isWindowFullscreen
                    ? "bg-purple-500/30 text-purple-100 border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.4)]"
                    : "bg-purple-500/10 text-purple-200 border-purple-400/25 hover:bg-purple-500/20"
                }`}
                title="Tam Ekran Modu (F11)"
              >
                {isFullscreenStage || isWindowFullscreen ? (
                  <Minimize2 size={13} className="text-purple-300" />
                ) : (
                  <Maximize2 size={13} className="text-purple-300" />
                )}
                <span className="hidden sm:inline">Tam Ekran</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveView(activeView === "lyrics" ? "home" : "lyrics")
                }
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  activeView === "lyrics"
                    ? "bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                    : "bg-white/[0.04] text-purple-200/80 border-white/10 hover:bg-purple-500/15"
                }`}
                title="Canlı Şarkı Sözleri"
              >
                <MicVocal size={13} />
                <span className="hidden sm:inline">Sözler</span>
              </button>

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
                className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  discordEnabled
                    ? "bg-purple-500/15 text-purple-200 border-purple-400/35"
                    : "bg-white/[0.04] text-purple-300/40 border-white/10"
                }`}
                title="Discord Rich Presence Durumu"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    discordEnabled && discordConnected
                      ? "bg-fuchsia-400 animate-pulse"
                      : discordEnabled
                      ? "bg-purple-400"
                      : "bg-slate-600"
                  }`}
                />
                <span className="hidden md:inline">Discord</span>
              </button>

              <button
                type="button"
                onClick={handleCheckOrInstallUpdate}
                disabled={isCheckingUpdate || isInstallingUpdate}
                className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  updateInfo?.has_update
                    ? "bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/50 animate-pulse"
                    : "bg-white/[0.04] text-purple-200/80 hover:text-white border-white/10"
                }`}
                title="GitHub Güncelleme Kontrolü"
              >
                {isCheckingUpdate || isInstallingUpdate ? (
                  <Loader2 size={11} className="animate-spin text-purple-400" />
                ) : (
                  <Zap size={11} className="text-purple-400" />
                )}
                <span className="hidden xl:inline">
                  {isInstallingUpdate
                    ? "Güncelleniyor..."
                    : updateInfo?.has_update
                    ? `v${updateInfo.latest_version}`
                    : `v${updateInfo?.current_version || "2.1.0"}`}
                </span>
              </button>

              {/* Profil Rozeti */}
              <div className="hidden sm:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/20">
                <img
                  src="/mihon-logo.jpg"
                  alt="Mihon"
                  className="w-5 h-5 rounded-full object-cover border border-purple-400/50"
                />
                <span className="text-xs font-medium text-purple-100">Mihon</span>
              </div>

              <button
                type="button"
                onClick={() => setIsRightSidebarOpen((v) => !v)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                  isRightSidebarOpen
                    ? "bg-white/[0.05] text-purple-200 border-white/10 hover:bg-purple-500/15"
                    : "bg-purple-500/25 text-purple-200 border-purple-400/40"
                }`}
                title={isRightSidebarOpen ? "Now Playing Panelini Gizle" : "Now Playing Panelini Aç"}
              >
                {isRightSidebarOpen ? (
                  <PanelRightClose size={13} />
                ) : (
                  <PanelRightOpen size={13} />
                )}
              </button>

              <div className="flex items-center gap-0.5 pl-1 border-l border-purple-400/15">
                <button
                  onClick={() => tauriInvoke("minimize_window").catch(() => {})}
                  className="w-7 h-7 rounded-lg hover:bg-purple-500/15 flex items-center justify-center text-purple-300/70 hover:text-white transition-colors"
                  title="Küçült"
                >
                  <Minus size={13} />
                </button>
                <button
                  onClick={() => tauriInvoke("toggle_maximize").catch(() => {})}
                  className="w-7 h-7 rounded-lg hover:bg-purple-500/15 flex items-center justify-center text-purple-300/70 hover:text-white transition-colors"
                  title="Pencereyi Büyüt"
                >
                  <Square size={11} />
                </button>
                <button
                  onClick={() => tauriInvoke("close_window").catch(() => {})}
                  className="w-7 h-7 rounded-lg hover:bg-rose-600 flex items-center justify-center text-purple-300/70 hover:text-white transition-colors"
                  title="Kapat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </header>

          {/* ORTA İÇERİK + SAĞ NOW PLAYING PANELİ */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* ===== ORTA ANA SAHNE ===== */}
            <main
              ref={mainScrollRef}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
            >
              {/* SANATÇI ÖZEL SAYFASI */}
              {activeView === "artist" && (
                <section className="relative overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-br from-[#231145] via-[#150b2b] to-[#2c124d] p-6 shadow-2xl">
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <TrackArtwork
                        track={artistTracks[0]}
                        className="w-20 h-20 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.35)] border border-purple-400/50"
                        iconSize={32}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-purple-500/25 text-purple-200 border border-purple-400/40">
                            FEATURED ARTIST
                          </span>
                          <button
                            onClick={() => setActiveView("home")}
                            className="text-xs font-semibold text-purple-300/80 hover:text-purple-200 underline"
                          >
                            ← Ana Sayfaya Dön
                          </button>
                        </div>
                        <h1 className="text-3xl font-black tracking-wide uppercase text-white mt-1">
                          {selectedArtistName}
                        </h1>
                        <p className="text-xs text-purple-200/80 mt-0.5">
                          {isLoadingArtist
                            ? "Sanatçının popüler parçaları yükleniyor..."
                            : `${artistTracks.length} popüler parça • Anında çalmaya hazır`}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* AI ÖNERİ SAYFASI */}
              {activeView === "recommendations" && (
                <section className="relative overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-r from-[#231145] via-[#180d33] to-[#311354] px-5 py-4 shadow-xl">
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <TrackArtwork
                        track={recommendationMeta?.seedTrack || recommendedTracks[0]}
                        className="w-14 h-14 rounded-xl shadow-lg border border-purple-400/45 shrink-0"
                        iconSize={24}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-500/25 text-purple-200 border border-purple-400/40 shrink-0">
                            AI DISCOVERY RADIO
                          </span>
                          <span className="text-xs font-semibold text-fuchsia-300 truncate">
                            {recommendationMeta?.detected_genre}
                          </span>
                        </div>
                        <h1 className="text-lg font-extrabold tracking-tight text-white truncate mt-1">
                          “{recommendationMeta?.seed_title || "Seçili Şarkı"}” Benzerleri
                        </h1>
                        <p className="text-xs text-purple-200/70 truncate">
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
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 transition-all whitespace-nowrap"
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
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-500/15 hover:bg-purple-500/25 text-white text-xs font-bold border border-purple-400/25 transition-all whitespace-nowrap"
                        >
                          <FolderPlus size={14} className="text-purple-300" />
                          <span>Listeye Kaydet</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ===== HOME: SYNTHESIA AI DISCOVERY + EXPLORE NEW GENRES + FEATURED ARTISTS ===== */}
              {activeView === "home" && (
                <>
                  {/* 1. AI DISCOVERY HERO CARD (Kozmik Mor/Fuchsia Halka Kartı) */}
                  <section>
                    <h2 className="text-lg font-medium uppercase tracking-[0.14em] text-white mb-3">
                      AI DISCOVERY
                    </h2>

                    <div className="relative overflow-hidden rounded-2xl border border-purple-400/35 bg-gradient-to-r from-[#170d30] via-[#221247] to-[#32155c] p-4 sm:p-5 shadow-[0_16px_45px_rgba(0,0,0,0.55)]">
                      {/* Sağ Mor/Fuchsia Aurora Işık Dalgaları */}
                      <div
                        className="pointer-events-none absolute -right-10 -bottom-12 w-80 h-56 rounded-full blur-2xl opacity-80"
                        style={{
                          background:
                            "radial-gradient(circle at 70% 70%, #e879f9 0%, #a855f7 42%, #6366f1 75%, transparent 100%)",
                        }}
                      />

                      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                        {/* Sol: Kozmik Mor Neon Halkalı Kapak Görseli */}
                        <div
                          onClick={() => {
                            setActiveCollection(activeSlide);
                            performSearch(
                              activeSlide.query,
                              activeSlide.title,
                              activeSlide.subtitle
                            );
                          }}
                          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-[#0c061a] border border-purple-300/25 shrink-0 cursor-pointer group shadow-[0_0_35px_rgba(168,85,247,0.35)]"
                        >
                          <img
                            src={
                              currentTrack
                                ? getTrackCover(currentTrack) || activeSlide.cover
                                : activeSlide.cover
                            }
                            alt={activeSlide.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#0c061a]/75 via-transparent to-purple-500/25" />
                          {/* Kozmik Gezegen & Mor/Fuchsia Halka Efekti */}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-black/55 backdrop-blur-[2px] border border-purple-300/70 shadow-[0_0_25px_rgba(192,132,252,0.8),inset_0_0_18px_rgba(232,121,249,0.7)]" />
                            <div className="absolute w-32 h-9 rounded-full border border-fuchsia-400/70 -rotate-12 shadow-[0_0_18px_rgba(232,121,249,0.75)]" />
                          </div>
                        </div>

                        {/* Sağ: SMART PLAYLIST Başlığı, Dinamik Sanatçı Açıklaması ve Oynat Butonu */}
                        <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-200/80">
                                {activeSlide.badge || "SMART PLAYLIST"}
                              </span>
                              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.08em] text-white mt-1 drop-shadow">
                                {activeSlide.title}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={(e) =>
                                openSimilarRecommendations(
                                  currentTrack || displayedTracks[0],
                                  e
                                )
                              }
                              className="p-2 rounded-lg text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/15 transition-colors"
                              title="AI Radyo Başlat"
                            >
                              <Bookmark size={16} />
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-purple-100/85 mt-2 leading-relaxed max-w-md">
                            Son dinlediğin{" "}
                            <button
                              type="button"
                              onClick={(e) => openArtistPage(recentArtistPair[0], e)}
                              className="font-extrabold text-white hover:text-purple-300 uppercase tracking-wide"
                            >
                              {recentArtistPair[0]}
                            </button>{" "}
                            ve{" "}
                            <button
                              type="button"
                              onClick={(e) => openArtistPage(recentArtistPair[1], e)}
                              className="font-extrabold text-white hover:text-purple-300 uppercase tracking-wide"
                            >
                              {recentArtistPair[1]}
                            </button>{" "}
                            frekanslarına göre AI tarafından hazırlandı.
                          </p>

                          <div className="flex items-center gap-3 mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (displayedTracks.length > 0) {
                                  playTrackAtIndex(displayedTracks, 0);
                                } else {
                                  performSearch(
                                    activeSlide.query,
                                    activeSlide.title,
                                    activeSlide.subtitle
                                  );
                                }
                              }}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-purple-200 to-fuchsia-300 hover:scale-105 active:scale-95 text-[#120726] flex items-center justify-center shadow-[0_0_24px_rgba(192,132,252,0.85)] transition-all"
                              title="Akıllı Listeyi Oynat"
                            >
                              <Play size={17} className="fill-current ml-0.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) =>
                                openSimilarRecommendations(
                                  currentTrack || displayedTracks[0],
                                  e
                                )
                              }
                              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-white border border-purple-300/25 backdrop-blur-md flex items-center gap-1.5 transition-all"
                            >
                              <Sparkles size={13} className="text-fuchsia-300" />
                              <span>AI Benzerlerini Üret</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kart Altı Carousel Noktaları (`━ • • •`) */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {COLLECTIONS.map((col, i) => {
                        const isActiveDot = i === discoveryIdx % COLLECTIONS.length;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                              setDiscoveryIdx(i);
                              setActiveCollection(col);
                              performSearch(col.query, col.title, col.subtitle);
                            }}
                            className={`h-1.5 rounded-full transition-all ${
                              isActiveDot
                                ? "w-6 bg-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.9)]"
                                : "w-1.5 bg-purple-900 hover:bg-purple-500"
                            }`}
                            title={col.subtitle}
                          />
                        );
                      })}
                    </div>
                  </section>

                  {/* 2. EXPLORE NEW GENRES */}
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-purple-100 mb-3">
                      EXPLORE NEW GENRES
                    </h3>
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                      {GENRE_PILLS.map((genre) => (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() =>
                            performSearch(
                              genre.query,
                              genre.label,
                              `${genre.label} seçkisi`
                            )
                          }
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${genre.style}`}
                        >
                          {genre.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* 3. FEATURED ARTISTS (2x2 Yatay Sanatçı Kartları - Mor Tema) */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-purple-100">
                        FEATURED ARTISTS
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setArtistPageIdx((p) => (p === 0 ? 1 : 0))
                          }
                          className="w-6 h-6 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/15 flex items-center justify-center text-purple-200/70 hover:text-white transition-colors"
                          title="Önceki Sanatçılar"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setArtistPageIdx((p) => (p === 0 ? 1 : 0))
                          }
                          className="w-6 h-6 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/15 flex items-center justify-center text-purple-200/70 hover:text-white transition-colors"
                          title="Sonraki Sanatçılar"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleFeaturedArtists.map((art) => (
                        <div
                          key={art.name}
                          onClick={(e) => openArtistPage(art.name, e)}
                          className="group flex items-center justify-between p-3 rounded-2xl bg-[#170d30]/85 hover:bg-[#221345] border border-purple-400/15 hover:border-purple-400/45 cursor-pointer transition-all shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={art.avatar}
                              alt={art.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-purple-300/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-bold uppercase tracking-wider text-white truncate">
                                {art.name}
                              </p>
                              <p className="text-[11px] font-medium uppercase tracking-widest text-purple-300/70 truncate mt-0.5">
                                {art.sub}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => openArtistPage(art.name, e)}
                            className="w-8 h-8 rounded-full bg-purple-500/20 group-hover:bg-purple-400 text-purple-100 group-hover:text-[#120726] flex items-center justify-center transition-all shrink-0 shadow"
                          >
                            <Play size={14} className="fill-current ml-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* ÇALMA LİSTELERİM GÖRÜNÜMÜ */}
              {activeView === "playlists" && (
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                        LIBRARY
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
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 transition-all"
                      >
                        <Plus size={15} />
                        <span>Yeni Liste Oluştur</span>
                      </button>
                    </div>
                  </div>

                  {customPlaylists.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl bg-purple-500/[0.04] border border-dashed border-purple-400/20">
                      <ListMusic size={40} className="mx-auto text-purple-400 mb-3" />
                      <h3 className="text-base font-bold text-white">
                        Henüz hiç çalma listen yok
                      </h3>
                      <p className="text-xs text-purple-200/70 mt-1 mb-4">
                        Yeni bir liste oluşturup beğendiğin şarkıları içine atabilirsin.
                      </p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-full bg-purple-500 text-white text-xs font-extrabold"
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
                          className="group p-4 rounded-2xl bg-[#170d30]/80 hover:bg-[#221345] border border-purple-400/15 hover:border-purple-400/45 cursor-pointer transition-all"
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
                              className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-purple-400 text-[#120726] flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                            >
                              <Play size={18} className="fill-current ml-0.5" />
                            </button>
                          </div>
                          <h3 className="font-bold text-sm text-white truncate">
                            {pl.name}
                          </h3>
                          <p className="text-xs text-purple-300/60 mt-0.5">
                            {pl.tracks.length} parça
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* TAM EKRAN SENKRONİZE ŞARKI SÖZLERİ GÖRÜNÜMÜ */}
              {activeView === "lyrics" && (
                <section className="relative rounded-3xl overflow-hidden border border-purple-400/25 bg-[#100821]/90 p-6 md:p-10 h-full min-h-[480px] flex flex-col">
                  {currentTrack && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-20 blur-3xl scale-125"
                      style={{
                        backgroundImage: `url(${getTrackCover(currentTrack)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}
                  <div
                    ref={mainLyricsContainerRef}
                    className="relative z-10 flex-1 overflow-y-auto py-16 px-4 md:px-10 space-y-6"
                  >
                    {!currentTrack ? (
                      <div className="py-24 text-center text-purple-300/50">
                        <MicVocal size={36} className="mx-auto text-purple-400/40 mb-3" />
                        <p className="text-sm font-medium">Şarkı seçilmedi</p>
                      </div>
                    ) : lyricsData.loading ? (
                      <div className="py-24 text-center text-purple-300 flex flex-col items-center gap-3">
                        <Loader2 size={28} className="animate-spin text-purple-400" />
                      </div>
                    ) : lyricsData.synced.length > 0 ? (
                      lyricsData.synced.map((line, i) => {
                        const isActive = i === activeLyricIndex;
                        const isPassed = i < activeLyricIndex;
                        return (
                          <p
                            key={`${line.time}_${i}`}
                            data-lyric-idx={i}
                            onClick={() => seekToSeconds(line.time)}
                            className={`cursor-pointer leading-snug tracking-tight transition-colors duration-300 ${
                              isActive
                                ? "text-purple-200 text-2xl md:text-3xl font-extrabold drop-shadow-[0_0_14px_rgba(192,132,252,0.55)]"
                                : isPassed
                                ? "text-purple-400/35 hover:text-purple-200 text-xl md:text-2xl font-bold"
                                : "text-purple-300/55 hover:text-purple-100 text-xl md:text-2xl font-bold"
                            }`}
                          >
                            {line.text}
                          </p>
                        );
                      })
                    ) : lyricsData.plain ? (
                      <div className="whitespace-pre-line text-lg md:text-xl leading-relaxed font-bold text-purple-100 max-w-2xl">
                        {lyricsData.plain}
                      </div>
                    ) : (
                      <div className="py-24 text-center text-purple-300/50">
                        <p className="text-sm font-semibold">
                          {lyricsData.error || "Söz bulunamadı"}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ŞARKI LİSTESİ TABLOSU (Home, Liked, Recent, Playlist Detail) */}
              {activeView !== "playlists" && activeView !== "lyrics" && (
                <section className="space-y-3 pt-1">
                  {/* Liste Üst Başlığı ve Aksiyonlar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-2.5 border-b border-purple-400/15">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
                        {activeView === "artist"
                          ? "ARTIST DISCOGRAPHY"
                          : activeView === "recommendations"
                          ? "AI FREQUENCY MATCH"
                          : activeView === "liked"
                          ? "FAVORITES"
                          : activeView === "recent"
                          ? "RECENTLY PLAYED"
                          : activeView === "playlist-detail"
                          ? "CUSTOM PLAYLIST"
                          : "TRACKS"}
                      </span>
                      <h2 className="text-lg font-extrabold tracking-wide text-white mt-0.5">
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
                      <p className="text-xs text-purple-200/60">
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
                          displayedTracks.length > 0 &&
                          playTrackAtIndex(displayedTracks, 0)
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400 hover:from-purple-300 hover:to-fuchsia-300 disabled:opacity-40 text-[#120726] text-xs font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                      >
                        <Play size={14} className="fill-current" />
                        <span>Tümünü Çal</span>
                      </button>

                      <button
                        disabled={displayedTracks.length === 0}
                        onClick={() => {
                          if (!displayedTracks.length) return;
                          setShuffle(true);
                          const rand = Math.floor(
                            Math.random() * displayedTracks.length
                          );
                          playTrackAtIndex(displayedTracks, rand);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#190f32] hover:bg-[#231546] disabled:opacity-40 text-purple-100 text-xs font-semibold border border-purple-400/20 transition-all"
                      >
                        <Shuffle size={13} />
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
                    <div className="py-16 text-center rounded-2xl bg-[#150b2b]/60 border border-purple-400/15">
                      <Music2 size={36} className="mx-auto text-purple-400/60 mb-2" />
                      <p className="text-sm font-semibold text-purple-100">
                        Burada henüz şarkı yok
                      </p>
                      <p className="text-xs text-purple-300/60 mt-1">
                        Arama çubuğunu kullanarak veya tür haplarından şarkı keşfedebilirsin.
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
                                isRadioModeRef.current =
                                  activeView === "recommendations";
                                playTrackAtIndex(displayedTracks, idx);
                              }
                            }}
                            className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                              isCurrent
                                ? "bg-purple-500/20 border-purple-400/50 shadow-[0_0_22px_rgba(168,85,247,0.18)]"
                                : "bg-transparent border-transparent hover:bg-[#190f32]/80 hover:border-purple-400/15"
                            }`}
                          >
                            {/* Sıra No / Ekolayzır / Yükleniyor */}
                            <div className="w-6 flex items-center justify-center shrink-0">
                              {isCurrent && isTrackLoading ? (
                                <Loader2
                                  size={16}
                                  className="text-purple-400 animate-spin"
                                />
                              ) : isCurrent && isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className="w-0.5 h-full bg-purple-400 eq-bar eq-bar-1" />
                                  <span className="w-0.5 h-full bg-fuchsia-400 eq-bar eq-bar-2" />
                                  <span className="w-0.5 h-full bg-purple-400 eq-bar eq-bar-3" />
                                  <span className="w-0.5 h-full bg-fuchsia-400 eq-bar eq-bar-4" />
                                </div>
                              ) : (
                                <>
                                  <span
                                    className={`text-xs font-semibold tabular-nums group-hover:hidden ${
                                      isCurrent ? "text-purple-300" : "text-purple-300/50"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <Play
                                    size={14}
                                    className="hidden group-hover:block text-purple-300 fill-current"
                                  />
                                </>
                              )}
                            </div>

                            {/* Gerçek Albüm Kapağı */}
                            <TrackArtwork
                              track={track}
                              className="w-11 h-11 rounded-xl"
                            />

                            {/* Başlık & Tıklanabilir Sanatçı İsimleri */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold truncate ${
                                  isCurrent ? "text-purple-200" : "text-purple-50"
                                }`}
                              >
                                {track.title}
                              </p>
                              <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-purple-200/65 truncate mt-0.5">
                                {splitArtists(track.artist).map(
                                  (art, aIdx, arr) => (
                                    <React.Fragment key={`${art}_${aIdx}`}>
                                      <button
                                        type="button"
                                        onClick={(e) => openArtistPage(art, e)}
                                        className="hover:text-purple-300 hover:underline transition-colors truncate"
                                        title={`${art} sayfasına git`}
                                      >
                                        {art}
                                      </button>
                                      {aIdx < arr.length - 1 && (
                                        <span className="text-purple-400/40">•</span>
                                      )}
                                    </React.Fragment>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Albüm */}
                            <div className="hidden md:block w-40 text-xs text-purple-300/50 truncate">
                              {track.album}
                            </div>

                            {/* Aksiyon Butonları */}
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) =>
                                  openSimilarRecommendations(track, e)
                                }
                                className="p-2 rounded-lg text-purple-300/60 hover:text-purple-200 hover:bg-purple-500/20 transition-colors"
                                title="Bu Şarkıyla Aynı Türde Öner (AI)"
                              >
                                <Sparkles size={15} />
                              </button>

                              <button
                                onClick={() => setTrackForPlaylistModal(track)}
                                className="p-2 rounded-lg text-purple-300/60 hover:text-white hover:bg-purple-500/15 transition-colors"
                                title="Çalma Listesine Ekle"
                              >
                                <ListPlus size={15} />
                              </button>

                              <button
                                onClick={(e) => toggleLikeTrack(track, e)}
                                className={`p-2 rounded-lg transition-colors ${
                                  liked
                                    ? "text-fuchsia-400 hover:bg-fuchsia-500/15"
                                    : "text-purple-300/60 hover:text-white hover:bg-purple-500/15"
                                }`}
                                title={liked ? "Beğeniden Çıkar" : "Beğen"}
                              >
                                <Heart
                                  size={15}
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
                                    className="p-2 rounded-lg text-purple-300/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Bu Listeden Kaldır"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                            </div>

                            {/* Süre */}
                            <div className="w-11 text-right text-xs font-medium text-purple-300/50 tabular-nums">
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

            {/* ===== 3. SAĞ SÜTUN: SYNTHESIA `NOW PLAYING` ENTEGRE OYNATICI (MOR TEMA) + YÜZEN `LYRICS / UP NEXT` KARTI ===== */}
            {isRightSidebarOpen && (
              <aside className="hidden lg:flex relative w-80 xl:w-[345px] shrink-0 bg-[#100821]/80 border-l border-purple-400/10 backdrop-blur-2xl p-5 flex-col justify-between overflow-y-auto overflow-x-hidden">
                {/* Sağ Üst Başlık: NOW PLAYING */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium uppercase tracking-[0.14em] text-white">
                      NOW PLAYING
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFullscreenMode(false)}
                        className="p-1.5 rounded-lg text-purple-300/80 hover:text-white hover:bg-purple-500/20 transition-colors"
                        title="Tam Ekran Modu (F11)"
                      >
                        <Maximize2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShuffle((s) => !s);
                          showToast(
                            !shuffle
                              ? "Karıştırma açıldı"
                              : "Karıştırma kapatıldı"
                          );
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          shuffle
                            ? "text-purple-300 bg-purple-500/20"
                            : "text-purple-300/60 hover:text-white"
                        }`}
                        title="Karıştır"
                      >
                        <Shuffle size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUpNextCardOpen((v) => !v)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isUpNextCardOpen
                            ? "text-purple-300 bg-purple-500/20"
                            : "text-purple-300/60 hover:text-white"
                        }`}
                        title="Lyrics & Up Next Kartını Aç/Kapat"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Büyük Kare Parlayan Mor Albüm Kapağı + Yüzen LYRICS & UP NEXT Cam Kartı */}
                  <div className="relative">
                    {/* Kapak Arkası Mor/Fuchsia Parlama */}
                    <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-tr from-purple-600/35 via-fuchsia-500/25 to-violet-500/35 blur-xl opacity-85" />

                    <div
                      onDoubleClick={() => handleToggleFullscreenMode(false)}
                      className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0c061a] border border-purple-400/45 shadow-[0_0_45px_rgba(168,85,247,0.3)] cursor-pointer group"
                      title="Tam ekran için çift tıkla"
                    >
                      {currentTrack ? (
                        <>
                          <TrackArtwork
                            track={currentTrack}
                            className="w-full h-full rounded-none border-0"
                            iconSize={52}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090514]/85 via-transparent to-black/20" />
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-purple-100/90 drop-shadow">
                              {splitArtists(currentTrack.artist)[0] ||
                                currentTrack.artist}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFullscreenMode(false);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-black/55 hover:bg-purple-600/80 text-purple-100 border border-purple-300/30 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                            title="Tam Ekran Moduna Geç (F11)"
                          >
                            <Maximize2 size={15} />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-purple-300/60 p-6 text-center">
                          <div className="relative w-28 h-28 rounded-full flex items-center justify-center border border-purple-400/45 shadow-[0_0_35px_rgba(168,85,247,0.35)] mb-3">
                            <img
                              src="/mihon-logo.jpg"
                              alt="Mihon"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white">
                            MIHON
                          </p>
                          <p className="text-[11px] text-purple-300/60 mt-1">
                            Bir parçaya tıklayarak başlat
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sağ-Alt Yüzen `LYRICS` & `UP NEXT` Cam Kartı */}
                    {isUpNextCardOpen && (
                      <div className="mt-3 rounded-xl bg-[#170d30]/95 border border-purple-400/20 backdrop-blur-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
                        {/* LYRICS Satırı */}
                        <div
                          onClick={() =>
                            setActiveView(
                              activeView === "lyrics" ? "home" : "lyrics"
                            )
                          }
                          className="flex items-center justify-between pb-2 mb-2 border-b border-purple-400/15 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-100 group-hover:text-purple-300 transition-colors">
                              LYRICS
                            </span>
                            {activeLyricIndex >= 0 &&
                              lyricsData.synced[activeLyricIndex] && (
                                <p className="text-[11px] text-fuchsia-300 font-medium truncate mt-0.5">
                                  “{lyricsData.synced[activeLyricIndex].text}”
                                </p>
                              )}
                          </div>
                          <MoreHorizontal
                            size={14}
                            className="text-purple-300/60 group-hover:text-purple-200 shrink-0"
                          />
                        </div>

                        {/* UP NEXT Bölümü */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-200/80">
                              UP NEXT
                            </span>
                            {currentTrack && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  openSimilarRecommendations(currentTrack, e)
                                }
                                className="text-[10px] font-semibold text-purple-300 hover:underline flex items-center gap-1"
                              >
                                <Sparkles size={10} />
                                <span>AI Öner</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
                            {queue
                              .slice(queueIndex + 1, queueIndex + 5)
                              .map((item, i) => (
                                <div
                                  key={`${item.id}_${i}`}
                                  onClick={() =>
                                    playTrackAtIndex(queue, queueIndex + 1 + i)
                                  }
                                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-purple-500/15 cursor-pointer transition-colors"
                                >
                                  <TrackArtwork
                                    track={item}
                                    className="w-7 h-7 rounded-md"
                                    iconSize={12}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-purple-50 truncate">
                                      {item.title}
                                    </p>
                                    <p className="text-[9px] uppercase tracking-wider text-purple-300/60 truncate">
                                      {item.artist}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            {queue.slice(queueIndex + 1, queueIndex + 5)
                              .length === 0 && (
                              <p className="text-[11px] text-purple-300/40 py-1">
                                Sıradaki parça otomatik seçilecek
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alt Kısım: Şarkı Başlığı, Kalp, Parlayan Mor Seekbar, Oynatma Kontrolleri ve Ses Çubuğu */}
                <div className="mt-4 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold uppercase tracking-wider text-white truncate">
                        {currentTrack ? currentTrack.title : "MIHON READY"}
                      </h3>
                      {currentTrack ? (
                        <div className="flex items-center flex-wrap gap-x-1.5 text-xs font-medium uppercase tracking-widest text-purple-300/75 mt-0.5">
                          {splitArtists(currentTrack.artist).map(
                            (art, aIdx, arr) => (
                              <React.Fragment key={`${art}_${aIdx}`}>
                                <button
                                  type="button"
                                  onClick={(e) => openArtistPage(art, e)}
                                  className="hover:text-purple-200 transition-colors truncate"
                                >
                                  {art}
                                </button>
                                {aIdx < arr.length - 1 && <span>•</span>}
                              </React.Fragment>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-xs uppercase tracking-widest text-purple-300/45 mt-0.5">
                          SELECT A TRACK
                        </p>
                      )}
                    </div>

                    {currentTrack && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setTrackForPlaylistModal(currentTrack)}
                          className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/15 transition-colors"
                          title="Çalma Listesine Ekle"
                        >
                          <ListPlus size={16} />
                        </button>
                        <button
                          onClick={(e) => toggleLikeTrack(currentTrack, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isTrackLiked(currentTrack.id)
                              ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.7)]"
                              : "text-purple-200/80 hover:text-white"
                          }`}
                          title="Beğen"
                        >
                          <Heart
                            size={17}
                            className={
                              isTrackLiked(currentTrack.id) ? "fill-current" : ""
                            }
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Parlayan Mor İlerleme Çubuğu (Seekbar) */}
                  <div className="space-y-1">
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
                      className="helios-slider w-full"
                    />
                    <div className="flex items-center justify-between text-[10px] font-medium text-purple-300/65 tabular-nums">
                      <span>{formatTime(displayedTime)}</span>
                      <span>{formatTime(effectiveDuration)}</span>
                    </div>
                  </div>

                  {/* Ana Oynatma Kontrolleri */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={() => {
                        setShuffle((s) => !s);
                        showToast(
                          !shuffle
                            ? "Karıştırma açıldı"
                            : "Karıştırma kapatıldı"
                        );
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        shuffle
                          ? "text-purple-300 bg-purple-500/20"
                          : "text-purple-300/60 hover:text-white"
                      }`}
                      title="Karıştır"
                    >
                      <Shuffle size={16} />
                    </button>

                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-lg text-purple-100 hover:text-purple-300 transition-colors"
                      title="Önceki Parça"
                    >
                      <SkipBack size={20} className="fill-current" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white via-purple-200 to-fuchsia-400 hover:scale-105 active:scale-95 text-[#120726] flex items-center justify-center shadow-[0_0_28px_rgba(168,85,247,0.75)] transition-all"
                      title="Oynat / Duraklat (Boşluk)"
                    >
                      {isTrackLoading ? (
                        <Loader2 size={22} className="animate-spin text-[#120726]" />
                      ) : isPlaying ? (
                        <Pause size={22} className="fill-current" />
                      ) : (
                        <Play size={22} className="fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleNext(true)}
                      className="p-2 rounded-lg text-purple-100 hover:text-purple-300 transition-colors"
                      title="Sonraki Parça"
                    >
                      <SkipForward size={20} className="fill-current" />
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
                      className={`p-2 rounded-lg transition-colors ${
                        repeatMode !== "off"
                          ? "text-purple-300 bg-purple-500/20"
                          : "text-purple-300/60 hover:text-white"
                      }`}
                      title="Tekrarla"
                    >
                      {repeatMode === "one" ? (
                        <Repeat1 size={16} />
                      ) : (
                        <Repeat size={16} />
                      )}
                    </button>
                  </div>

                  {/* Alt Ses Kaydırıcısı ve Yardımcı Kontroller (Tam Ekran İkonu Dahil!) */}
                  <div className="pt-2 border-t border-purple-400/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsMuted((m) => !m)}
                      className="p-1.5 rounded-lg text-purple-300/70 hover:text-white transition-colors"
                      title="Sesi Kapat / Aç"
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
                      className="helios-slider flex-1"
                    />

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={cyclePlaybackSpeed}
                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold border transition-all ${
                          playbackRate !== 1
                            ? "bg-purple-500/25 text-purple-200 border-purple-400/50"
                            : "bg-white/[0.04] text-purple-300/70 border-white/10 hover:text-white"
                        }`}
                        title="Oynatma Hızı"
                      >
                        {playbackRate}x
                      </button>

                      <button
                        onClick={() =>
                          setActiveView(
                            activeView === "lyrics" ? "home" : "lyrics"
                          )
                        }
                        className={`p-1.5 rounded-md transition-colors ${
                          activeView === "lyrics"
                            ? "text-purple-200 bg-purple-500/25"
                            : "text-purple-300/70 hover:text-white"
                        }`}
                        title="Canlı Şarkı Sözleri"
                      >
                        <MicVocal size={14} />
                      </button>

                      <button
                        onClick={() => handleToggleFullscreenMode(false)}
                        className="p-1.5 rounded-md text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/20 transition-colors"
                        title="Tam Ekran Sahne Modu (F11)"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Sağ Panel Kapalıyken veya Küçük Ekranda Kompakt Alt Oynatıcı */}
          {!isRightSidebarOpen && (
            <footer className="h-20 px-5 bg-[#100821]/95 border-t border-purple-400/15 backdrop-blur-2xl flex items-center justify-between gap-5 shrink-0">
              <div className="flex items-center gap-3 w-64 min-w-0">
                <TrackArtwork
                  track={currentTrack}
                  className="w-12 h-12 rounded-xl"
                  iconSize={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {currentTrack ? currentTrack.title : "Mihon"}
                  </p>
                  <p className="text-[11px] text-purple-300/70 truncate">
                    {currentTrack ? currentTrack.artist : "Parça seçilmedi"}
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-purple-100 hover:text-purple-300"
                  >
                    <SkipBack size={17} className="fill-current" />
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="w-9 h-9 rounded-full bg-purple-400 text-[#120726] flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.6)]"
                  >
                    {isPlaying ? (
                      <Pause size={16} className="fill-current" />
                    ) : (
                      <Play size={16} className="fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleNext(true)}
                    className="p-1.5 text-purple-100 hover:text-purple-300"
                  >
                    <SkipForward size={17} className="fill-current" />
                  </button>
                </div>
                <div className="w-full flex items-center gap-2.5">
                  <span className="text-[10px] text-purple-300/70 tabular-nums">
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
                  <span className="text-[10px] text-purple-300/70 tabular-nums">
                    {formatTime(effectiveDuration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 w-56">
                <button
                  onClick={() => handleToggleFullscreenMode(false)}
                  className="p-2 rounded-lg text-purple-200 bg-purple-500/20 border border-purple-400/40"
                  title="Tam Ekran Modu (F11)"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={() => setIsRightSidebarOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/25 text-purple-200 border border-purple-400/45"
                >
                  Now Playing Aç
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* ===== SİNEMATİK TAM EKRAN SAHNE MODU (F11 / Tam Ekran Butonu) ===== */}
      {isFullscreenStage && (
        <div className="fixed inset-0 z-40 bg-[#070312] flex flex-col justify-between p-6 md:p-10 overflow-hidden select-none">
          {/* Arka Plan Bulanık Albüm Kapağı & Mor Aurora */}
          {currentTrack && (
            <div
              className="pointer-events-none absolute inset-0 opacity-30 blur-[90px] scale-125 transition-all duration-700"
              style={{
                backgroundImage: `url(${getTrackCover(currentTrack)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(circle at 25% 35%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(217,70,239,0.28), transparent 55%)",
            }}
          />

          {/* Üst Bar: Marka + Tam Ekrandan Çıkış */}
          <div
            data-tauri-drag-region
            className="relative z-10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src="/mihon-logo.jpg"
                alt="Mihon"
                className="w-8 h-8 rounded-xl object-cover border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              />
              <div>
                <span className="text-sm font-light tracking-[0.35em] uppercase text-white block">
                  MIHON
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-300">
                  IMMERSIVE FULLSCREEN STAGE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleFullscreenMode(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/25 hover:bg-purple-500/40 text-purple-100 border border-purple-400/50 text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all"
              >
                <Minimize2 size={14} />
                <span>Tam Ekrandan Çık (ESC / F11)</span>
              </button>
            </div>
          </div>

          {/* Orta Sahne: Sol Dev Parlayan Kapak & Sağ Canlı Senkronize Sözler */}
          <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-0 my-6">
            {/* Sol: Dev Albüm Kapağı & Parça Bilgisi */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start justify-center space-y-6">
              <div className="relative group">
                <div className="pointer-events-none absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-purple-600/45 via-fuchsia-500/35 to-indigo-500/40 blur-2xl opacity-90" />
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96 rounded-3xl overflow-hidden bg-[#100821] border border-purple-300/45 shadow-[0_0_70px_rgba(168,85,247,0.45)]">
                  <TrackArtwork
                    track={currentTrack}
                    className="w-full h-full rounded-none border-0"
                    iconSize={72}
                  />
                </div>
              </div>

              <div className="text-center lg:text-left max-w-md w-full">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wide text-white truncate drop-shadow">
                  {currentTrack ? currentTrack.title : "MIHON"}
                </h1>
                <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-purple-300 mt-1 truncate">
                  {currentTrack ? currentTrack.artist : "Kozmik Müzik Deneyimi"}
                </p>
              </div>
            </div>

            {/* Sağ: Canlı Senkronize Şarkı Sözleri */}
            <div
              ref={fullscreenLyricsRef}
              className="lg:col-span-7 h-full max-h-[58vh] overflow-y-auto px-4 md:px-8 py-10 space-y-6 rounded-3xl bg-[#110824]/55 border border-purple-400/20 backdrop-blur-xl"
            >
              {!currentTrack ? (
                <div className="py-20 text-center text-purple-300/50">
                  <MicVocal size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-base font-semibold">
                    Bir şarkı başlattığında canlı sözler burada akar
                  </p>
                </div>
              ) : lyricsData.loading ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-purple-400" />
                </div>
              ) : lyricsData.synced.length > 0 ? (
                lyricsData.synced.map((line, i) => {
                  const isActive = i === activeLyricIndex;
                  const isPassed = i < activeLyricIndex;
                  return (
                    <p
                      key={`fs_${line.time}_${i}`}
                      data-lyric-idx={i}
                      onClick={() => seekToSeconds(line.time)}
                      className={`cursor-pointer leading-snug tracking-tight transition-colors duration-300 ${
                        isActive
                          ? "text-white text-2xl sm:text-4xl font-black drop-shadow-[0_0_20px_rgba(217,70,239,0.75)]"
                          : isPassed
                          ? "text-purple-400/30 hover:text-purple-200 text-xl sm:text-2xl font-bold"
                          : "text-purple-200/50 hover:text-purple-100 text-xl sm:text-2xl font-bold"
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : lyricsData.plain ? (
                <div className="whitespace-pre-line text-lg sm:text-2xl leading-relaxed font-bold text-purple-100">
                  {lyricsData.plain}
                </div>
              ) : (
                <div className="py-20 text-center text-purple-300/60">
                  <p className="text-base font-semibold">
                    {lyricsData.error || "Bu parça için senkronize söz bulunamadı"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alt Bar: Tam Ekran Oynatma Kontrolleri & Seekbar */}
          <div className="relative z-10 max-w-4xl w-full mx-auto bg-[#130a29]/85 border border-purple-400/25 rounded-3xl px-6 py-4 backdrop-blur-2xl shadow-[0_12px_50px_rgba(0,0,0,0.7)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-purple-200/80 tabular-nums w-10 text-right">
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
              <span className="text-xs font-semibold text-purple-200/80 tabular-nums w-10">
                {formatTime(effectiveDuration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentTrack && (
                  <>
                    <button
                      onClick={(e) => toggleLikeTrack(currentTrack, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        isTrackLiked(currentTrack.id)
                          ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40"
                          : "bg-white/[0.04] text-purple-200 border-white/10"
                      }`}
                    >
                      <Heart
                        size={17}
                        className={
                          isTrackLiked(currentTrack.id) ? "fill-current" : ""
                        }
                      />
                    </button>
                    <button
                      onClick={(e) =>
                        openSimilarRecommendations(currentTrack, e)
                      }
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-400/35 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>AI Benzerleri</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShuffle((s) => !s)}
                  className={`p-2 rounded-lg ${
                    shuffle ? "text-purple-300" : "text-purple-300/50 hover:text-white"
                  }`}
                >
                  <Shuffle size={18} />
                </button>
                <button
                  onClick={handlePrev}
                  className="p-2 text-white hover:text-purple-300 transition-colors"
                >
                  <SkipBack size={24} className="fill-current" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white via-purple-200 to-fuchsia-400 text-[#120726] flex items-center justify-center shadow-[0_0_35px_rgba(192,132,252,0.85)] hover:scale-105 transition-all"
                >
                  {isPlaying ? (
                    <Pause size={26} className="fill-current" />
                  ) : (
                    <Play size={26} className="fill-current ml-1" />
                  )}
                </button>
                <button
                  onClick={() => handleNext(true)}
                  className="p-2 text-white hover:text-purple-300 transition-colors"
                >
                  <SkipForward size={24} className="fill-current" />
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
                  className={`p-2 rounded-lg ${
                    repeatMode !== "off"
                      ? "text-purple-300"
                      : "text-purple-300/50 hover:text-white"
                  }`}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 size={18} />
                  ) : (
                    <Repeat size={18} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 w-44 justify-end">
                <Volume2 size={16} className="text-purple-300/80" />
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
                  }}
                  style={{ "--progress": `${(isMuted ? 0 : volume) * 100}%` }}
                  className="helios-slider w-24"
                />
              </div>
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
        onPause={() => {
          setIsPlaying(false);
          persistPlaybackState(audioRef.current?.currentTime || currentTime);
          tauriInvoke("clear_discord_presence").catch(() => {});
        }}
        onLoadedData={() => applyAudioSettings()}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (Number.isFinite(dur) && dur > 0) setDuration(dur);
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

