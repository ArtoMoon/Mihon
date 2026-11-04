// ==========================================================
// Helios — Rust arka uç köprüsü
// Komutlar: search, prepare_track, cache_info, clear_cache,
//           minimize_window, toggle_maximize, close_window
// ==========================================================
const { invoke, convertFileSrc } = window.__TAURI__.core;

const SEARCH_TTL = 10 * 60 * 1000; // 10 dk oturum içi önbellek
const searchCache = new Map();

export const api = {
  /** YouTube Music araması (kısa süreli bellek önbelleğiyle). */
  async search(query) {
    const key = query.trim().toLowerCase();
    const hit = searchCache.get(key);
    if (hit && Date.now() - hit.at < SEARCH_TTL) return hit.results;
    const results = await invoke("search", { query });
    searchCache.set(key, { at: Date.now(), results });
    return results;
  },

  /** Parçayı önbelleğe alır ve <audio> için çalınabilir URL döndürür. */
  async prepareTrack(id) {
    const path = await invoke("prepare_track", { id });
    return convertFileSrc(path);
  },

  cacheInfo: () => invoke("cache_info"),
  clearCache: () => invoke("clear_cache"),

  window: {
    minimize: () => invoke("minimize_window").catch(() => {}),
    toggleMaximize: () => invoke("toggle_maximize").catch(() => {}),
    close: () => invoke("close_window").catch(() => {}),
  },
};

