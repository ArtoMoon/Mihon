// ==========================================================
// Helios — oynatıcı motoru (kuyruk, karıştırma, tekrar, ses)
// Olaylar: track, status, time, modes, volume, queue, error
// ==========================================================
import { api } from "./api.js";
import { store } from "./state.js";

const REPEAT_CYCLE = { off: "all", all: "one", one: "off" };

class Player extends EventTarget {
  audio = new Audio();
  queue = [];
  index = -1;
  current = null;
  loading = false;
  shuffle = store.get("shuffle", false);
  repeat = store.get("repeat", "off");
  volume = store.get("volume", 0.35);
  muted = false;
  #token = 0;

  constructor() {
    super();
    this.audio.preload = "auto";
    const a = this.audio;
    a.addEventListener("play", () => this.#emit("status"));
    a.addEventListener("pause", () => this.#emit("status"));
    a.addEventListener("timeupdate", () => this.#emit("time"));
    a.addEventListener("durationchange", () => this.#emit("time"));
    a.addEventListener("ended", () => this.#onEnded());
    a.addEventListener("error", () => {
      if (a.getAttribute("src")) this.#emit("error", "Ses dosyası çözümlenemedi");
    });
    this.#applyVolume();
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  // ---- Durum ----
  get playing() {
    return !this.audio.paused && !!this.audio.getAttribute("src");
  }
  get currentTime() {
    return this.audio.currentTime;
  }
  get duration() {
    const d = this.audio.duration;
    return Number.isFinite(d) && d > 0 ? d : this.current?.duration_sec || 0;
  }
  /** Mevcut parçadan sonra çalınacak parçalar. */
  get upNext() {
    return this.index < 0 ? [] : this.queue.slice(this.index + 1);
  }

  // ---- Oynatma ----
  playList(tracks, startIndex = 0) {
    if (!tracks.length) return;
    this.queue = [...tracks];
    this.index = Math.max(0, Math.min(startIndex, tracks.length - 1));
    this.#emit("queue");
    return this.#load();
  }

  playShuffled(tracks) {
    if (!tracks.length) return;
    if (!this.shuffle) this.toggleShuffle();
    return this.playList(tracks, Math.floor(Math.random() * tracks.length));
  }

  /** Parçayı sıradaki olarak ekle. */
  playNext(track) {
    if (this.index < 0) return this.playList([track], 0);
    this.queue.splice(this.index + 1, 0, track);
    this.#emit("queue");
  }

  jumpTo(queueIndex) {
    if (queueIndex < 0 || queueIndex >= this.queue.length) return;
    this.index = queueIndex;
    this.#emit("queue");
    return this.#load();
  }

  async #load() {
    const track = this.queue[this.index];
    if (!track) return;
    const token = ++this.#token;

    this.current = track;
    this.loading = true;
    this.audio.pause();
    this.#emit("track", track);
    this.#emit("status");

    try {
      const src = await api.prepareTrack(track.id);
      if (token !== this.#token) return;
      this.audio.src = src;
      await this.audio.play();
      this.#emit("started", track);
      this.#prefetchNext();
    } catch (err) {
      if (token !== this.#token) return;
      console.error("[Helios] Oynatma hatası:", err);
      this.#emit("error", `Çalınamadı: ${err?.message ?? err}`);
    } finally {
      if (token === this.#token) {
        this.loading = false;
        this.#emit("status");
      }
    }
  }

  #prefetchNext() {
    const i = this.#nextIndex(false);
    const next = i != null ? this.queue[i] : null;
    if (next && next.id !== this.current?.id) api.prepareTrack(next.id).catch(() => {});
  }

  #nextIndex(userInitiated) {
    const n = this.queue.length;
    if (!n) return null;
    if (this.shuffle && n > 1) {
      let r;
      do r = Math.floor(Math.random() * n);
      while (r === this.index);
      return r;
    }
    if (this.index + 1 < n) return this.index + 1;
    return this.repeat === "all" || userInitiated ? 0 : null;
  }

  #onEnded() {
    if (this.repeat === "one") {
      this.audio.currentTime = 0;
      this.audio.play();
      return;
    }
    this.next(false);
  }

  next(userInitiated = true) {
    const i = this.#nextIndex(userInitiated);
    if (i == null) {
      this.#emit("status");
      return;
    }
    this.index = i;
    this.#emit("queue");
    this.#load();
  }

  prev() {
    if (this.audio.currentTime > 3 || this.queue.length <= 1) {
      this.audio.currentTime = 0;
      return;
    }
    this.index = (this.index - 1 + this.queue.length) % this.queue.length;
    this.#emit("queue");
    this.#load();
  }

  togglePlay() {
    if (!this.audio.getAttribute("src")) return;
    this.audio.paused ? this.audio.play() : this.audio.pause();
  }

  seek(seconds) {
    if (!this.audio.getAttribute("src")) return;
    this.audio.currentTime = Math.max(0, Math.min(seconds, this.duration || 0));
    this.#emit("time");
  }

  seekBy(delta) {
    this.seek(this.audio.currentTime + delta);
  }

  // ---- Modlar ----
  toggleShuffle() {
    this.shuffle = !this.shuffle;
    store.set("shuffle", this.shuffle);
    this.#emit("modes");
    return this.shuffle;
  }

  cycleRepeat() {
    this.repeat = REPEAT_CYCLE[this.repeat] ?? "off";
    store.set("repeat", this.repeat);
    this.#emit("modes");
    return this.repeat;
  }

  // ---- Ses ----
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.muted = false;
    store.set("volume", this.volume);
    this.#applyVolume();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.#applyVolume();
  }

  #applyVolume() {
    this.audio.volume = this.muted ? 0 : this.volume;
    this.#emit("volume");
  }
}

export const player = new Player();
