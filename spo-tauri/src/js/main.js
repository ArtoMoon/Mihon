// ==========================================================
// Helios — giriş noktası: arayüz bağlantıları ve olaylar
// ==========================================================
import { api } from "./api.js";
import { applyAccentFrom } from "./color.js";
import { $, $$, h, icon, debounce, formatTime, formatBytes } from "./dom.js";
import { player } from "./player.js";
import { library, prefs } from "./state.js";
import { toast, confirmDialog, isDialogOpen } from "./ui.js";
import {
  navigate, goBack, goForward, refreshIfShowing, syncCurrent, syncLikes,
  renderSidebarPlaylists, createPlaylistFlow, likeButton, trackMenu,
} from "./views.js";

// ---------- Pencere kontrolleri ----------
$("#tb-minimize").addEventListener("click", api.window.minimize);
$("#tb-maximize").addEventListener("click", api.window.toggleMaximize);
$("#tb-close").addEventListener("click", api.window.close);

// ---------- Gezinme ----------
$$(".nav-item").forEach((btn) => btn.addEventListener("click", () => navigate(btn.dataset.view)));
$("#btn-back").addEventListener("click", goBack);
$("#btn-forward").addEventListener("click", goForward);
$("#btn-new-playlist").addEventListener("click", async () => {
  const pl = await createPlaylistFlow();
  if (pl) navigate("playlist", { id: pl.id });
});
document.addEventListener("mouseup", (e) => {
  if (e.button === 3) goBack();
  if (e.button === 4) goForward();
});

// ---------- Arama ----------
const searchInput = $("#search-input");
const runSearch = (q, replace) => navigate("search", { q }, { replace });
const liveSearch = debounce((q) => q.length >= 2 && runSearch(q, true), 450);

searchInput.addEventListener("input", () => liveSearch(searchInput.value.trim()));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) runSearch(q, true);
  }
});
searchInput.addEventListener("focus", () => {
  if (!searchInput.value) navigate("search", {});
});

// ---------- Oynatıcı çubuğu ----------
const seek = $("#seek");
const volume = $("#volume");
const setRangeFill = (input, ratio) => input.style.setProperty("--p", `${(ratio * 100).toFixed(2)}%`);
let seeking = false;

seek.addEventListener("input", () => {
  seeking = true;
  setRangeFill(seek, seek.value / 1000);
  $("#t-cur").textContent = formatTime((seek.value / 1000) * player.duration);
});
seek.addEventListener("change", () => {
  player.seek((seek.value / 1000) * player.duration);
  seeking = false;
});

volume.addEventListener("input", () => player.setVolume(volume.value / 100));
volume.addEventListener("wheel", (e) => {
  e.preventDefault();
  player.setVolume(player.volume + (e.deltaY < 0 ? 0.05 : -0.05));
}, { passive: false });

$("#btn-play").addEventListener("click", () => togglePlay());
$("#btn-next").addEventListener("click", () => player.next(true));
$("#btn-prev").addEventListener("click", () => player.prev());
$("#btn-shuffle").addEventListener("click", () => toast(player.toggleShuffle() ? "Karıştırma açık" : "Karıştırma kapalı"));
$("#btn-repeat").addEventListener("click", () =>
  toast({ off: "Tekrar kapalı", all: "Listeyi tekrarla", one: "Parçayı tekrarla" }[player.cycleRepeat()]));
$("#btn-mute").addEventListener("click", () => player.toggleMute());
$("#btn-panel").addEventListener("click", () => setPanel(!document.body.classList.contains("panel-open")));
$("#btn-np-close").addEventListener("click", () => setPanel(false));
$("#pl-more").addEventListener("click", (e) => player.current && trackMenu(player.current, e.currentTarget));

/** Henüz parça seçilmemişse ekrandaki ilk parçayı çal. */
function togglePlay() {
  if (player.current) player.togglePlay();
  else $(".track-row")?.click();
}

function setPanel(open) {
  document.body.classList.toggle("panel-open", open);
  $("#btn-panel").classList.toggle("on", open);
  prefs.npPanel = open;
}

// ---------- Oynatıcı olayları ----------
player.addEventListener("track", ({ detail: t }) => {
  // Alt çubuk
  $("#pl-cover").src = t.thumbnail || "assets/logo.png";
  $("#pl-title").textContent = t.title;
  $("#pl-artist").textContent = t.artist;
  $("#pl-like").replaceChildren(likeButton(t, "sm"));
  document.body.classList.add("has-track");

  // Şimdi çalıyor paneli
  $("#np-cover").src = t.thumbnail || "assets/logo.png";
  $("#np-title").textContent = t.title;
  $("#np-artist").textContent = t.artist;
  $("#np-album").textContent = t.album || "";

  // Ortam arka planı ve dinamik vurgu rengi
  $("#ambient").style.backgroundImage = t.thumbnail ? `url("${t.thumbnail}")` : "";
  applyAccentFrom(t.thumbnail);

  $("#t-total").textContent = t.duration || "0:00";
  $("#t-cur").textContent = "0:00";
  seek.value = 0;
  setRangeFill(seek, 0);

  document.title = `${t.title} · ${t.artist} — Helios`;
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.artist,
      album: t.album,
      artwork: t.thumbnail ? [{ src: t.thumbnail, sizes: "400x400" }] : [],
    });
  }
  syncCurrent();
  renderQueue();
});

player.addEventListener("started", ({ detail }) => library.pushRecent(detail));
player.addEventListener("queue", renderQueue);

player.addEventListener("status", () => {
  document.body.classList.toggle("playing", player.playing);
  document.body.classList.toggle("loading", player.loading);
  $("#btn-play").setAttribute("aria-label", player.playing ? "Duraklat" : "Oynat");
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = player.playing ? "playing" : "paused";
  syncCurrent();
});

player.addEventListener("time", () => {
  if (seeking) return;
  const d = player.duration;
  const ratio = d ? player.currentTime / d : 0;
  seek.value = Math.round(ratio * 1000);
  setRangeFill(seek, ratio);
  $("#t-cur").textContent = formatTime(player.currentTime);
  if (d) $("#t-total").textContent = formatTime(d);
});

player.addEventListener("modes", syncModes);
function syncModes() {
  $("#btn-shuffle").classList.toggle("on", player.shuffle);
  const r = $("#btn-repeat");
  r.classList.toggle("on", player.repeat !== "off");
  r.classList.toggle("one", player.repeat === "one");
}

player.addEventListener("volume", () => {
  const v = player.muted ? 0 : player.volume;
  volume.value = Math.round(v * 100);
  setRangeFill(volume, v);
  const name = v === 0 ? "mute" : v < 0.5 ? "volumeLow" : "volume";
  $("#btn-mute").replaceChildren(icon(name));
});

player.addEventListener("error", ({ detail }) => toast(detail, { error: true }));

// ---------- Sıradaki parçalar ----------
function renderQueue() {
  const box = $("#np-queue");
  const upNext = player.upNext.slice(0, 30);
  $("#np-queue-count").textContent = player.upNext.length ? `${player.upNext.length}` : "";
  if (!upNext.length) {
    box.replaceChildren(h("p", { class: "np-empty" }, "Sırada parça yok."));
    return;
  }
  box.replaceChildren(
    ...upNext.map((t, i) =>
      h(
        "button",
        { class: "q-item", type: "button", onclick: () => player.jumpTo(player.index + 1 + i) },
        h("img", { src: t.thumbnail || null, alt: "", loading: "lazy", draggable: "false" }),
        h("span", { class: "q-text" }, h("span", { class: "q-title" }, t.title), h("span", { class: "q-artist" }, t.artist)),
        h("span", { class: "q-dur" }, t.duration || ""),
      ),
    ),
  );
}

// ---------- Kitaplık olayları ----------
library.addEventListener("change", ({ detail: kind }) => {
  if (kind === "liked") {
    syncLikes();
    $("#liked-count").textContent = library.liked.length || "";
  }
  if (kind === "playlists") renderSidebarPlaylists();
  refreshIfShowing(kind);
});

// ---------- Önbellek ----------
async function refreshCache() {
  try {
    const info = await api.cacheInfo();
    $("#cache-size").textContent = formatBytes(info.bytes);
    $("#cache-files").textContent = `${info.files} parça önbellekte`;
  } catch {
    /* yoksay */
  }
}
$("#btn-clear-cache").addEventListener("click", async () => {
  const ok = await confirmDialog({
    title: "Önbellek temizlensin mi?",
    message: "İndirilmiş tüm ses dosyaları silinir; parçalar tekrar çalındığında yeniden indirilir.",
    confirmText: "Temizle",
    danger: true,
  });
  if (!ok) return;
  try {
    await api.clearCache();
    toast("Önbellek temizlendi");
  } catch (err) {
    toast(String(err), { error: true });
  }
  refreshCache();
});
setInterval(refreshCache, 15_000);

// ---------- Klavye kısayolları ----------
document.addEventListener("keydown", (e) => {
  if (isDialogOpen()) return;
  const typing = e.target.matches("input:not([type=range]), textarea");

  if (e.key === "Escape" && typing) return e.target.blur();
  if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    return searchInput.focus();
  }
  if (e.altKey && e.key === "ArrowLeft") return goBack();
  if (e.altKey && e.key === "ArrowRight") return goForward();
  if (typing) return;

  const actions = {
    "/": () => searchInput.focus(),
    " ": () => togglePlay(),
    m: () => player.toggleMute(),
    l: () => player.current && library.toggleLike(player.current),
    s: () => $("#btn-shuffle").click(),
    r: () => $("#btn-repeat").click(),
    ArrowUp: () => player.setVolume(player.volume + 0.05),
    ArrowDown: () => player.setVolume(player.volume - 0.05),
    ArrowRight: () => (e.ctrlKey ? player.next(true) : player.seekBy(5)),
    ArrowLeft: () => (e.ctrlKey ? player.prev() : player.seekBy(-5)),
  };
  const action = actions[e.key] ?? actions[e.key.toLowerCase()];
  if (action && !(e.target.matches("button") && e.key === " ")) {
    e.preventDefault();
    action();
  }
});

// ---------- Windows medya tuşları ----------
if ("mediaSession" in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler("play", () => player.audio.play());
  ms.setActionHandler("pause", () => player.audio.pause());
  ms.setActionHandler("nexttrack", () => player.next(true));
  ms.setActionHandler("previoustrack", () => player.prev());
  ms.setActionHandler("seekto", (d) => player.seek(d.seekTime));
}

// ---------- Başlat ----------
setPanel(prefs.npPanel);
syncModes();
player.setVolume(player.volume);
$("#liked-count").textContent = library.liked.length || "";
renderSidebarPlaylists();
renderQueue();
navigate("home");
refreshCache();
