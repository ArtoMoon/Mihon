// ==========================================================
// Helios — kalıcı durum ve kütüphane (beğeniler, geçmiş, listeler)
// localStorage anahtarları önceki sürümle uyumludur.
// ==========================================================

export const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const RECENT_LIMIT = 50;

/** Sadece kalıcı olması gereken alanları sakla. */
const slim = ({ id, title, artist, album, duration, duration_sec, thumbnail }) => ({
  id, title, artist, album, duration, duration_sec, thumbnail,
});

class Library extends EventTarget {
  liked = store.get("liked", []);
  recent = store.get("recent", []);
  playlists = store.get("custom_playlists", []);

  #commit(kind) {
    const keys = { liked: "liked", recent: "recent", playlists: "custom_playlists" };
    store.set(keys[kind], this[kind]);
    this.dispatchEvent(new CustomEvent("change", { detail: kind }));
  }

  // ---- Beğeniler ----
  isLiked(id) {
    return this.liked.some((t) => t.id === id);
  }

  /** @returns {boolean} yeni beğeni durumu */
  toggleLike(track) {
    const liked = this.isLiked(track.id);
    this.liked = liked ? this.liked.filter((t) => t.id !== track.id) : [slim(track), ...this.liked];
    this.#commit("liked");
    return !liked;
  }

  // ---- Geçmiş ----
  pushRecent(track) {
    this.recent = [slim(track), ...this.recent.filter((t) => t.id !== track.id)].slice(0, RECENT_LIMIT);
    this.#commit("recent");
  }

  clearRecent() {
    this.recent = [];
    this.#commit("recent");
  }

  // ---- Çalma listeleri ----
  getPlaylist(id) {
    return this.playlists.find((p) => p.id === id);
  }

  createPlaylist(name, tracks = []) {
    const playlist = { id: `pl_${Date.now()}`, name, tracks: tracks.map(slim), createdAt: Date.now() };
    this.playlists = [...this.playlists, playlist];
    this.#commit("playlists");
    return playlist;
  }

  renamePlaylist(id, name) {
    const pl = this.getPlaylist(id);
    if (!pl) return;
    pl.name = name;
    this.#commit("playlists");
  }

  deletePlaylist(id) {
    this.playlists = this.playlists.filter((p) => p.id !== id);
    this.#commit("playlists");
  }

  /** @returns {boolean} eklendiyse true, zaten varsa false */
  addToPlaylist(id, track) {
    const pl = this.getPlaylist(id);
    if (!pl || pl.tracks.some((t) => t.id === track.id)) return false;
    pl.tracks.push(slim(track));
    this.#commit("playlists");
    return true;
  }

  removeFromPlaylist(id, trackId) {
    const pl = this.getPlaylist(id);
    if (!pl) return;
    pl.tracks = pl.tracks.filter((t) => t.id !== trackId);
    this.#commit("playlists");
  }
}

export const library = new Library();

/** Arayüz tercihleri */
export const prefs = {
  get npPanel() { return store.get("ui_np_panel", true); },
  set npPanel(v) { store.set("ui_np_panel", v); },
};

