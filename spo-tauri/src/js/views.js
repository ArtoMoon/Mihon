// ==========================================================
// Helios — görünümler, yönlendirici ve liste bileşenleri
// ==========================================================
import { api } from "./api.js";
import { $, $$, h, icon, iconButton, eqBars, formatTotal, greeting } from "./dom.js";
import { player } from "./player.js";
import { library } from "./state.js";
import { toast, promptDialog, confirmDialog, openMenu } from "./ui.js";

export const CURATED = [
  { id: "global", name: "Global Hit Listesi", q: "top global hits 2026", desc: "Dünyada şu an en çok dinlenenler", hue: 12 },
  { id: "tr-pop", name: "Türkçe Pop", q: "türkçe pop hit şarkılar", desc: "Yerli pop'un parlayan yıldızları", hue: 330 },
  { id: "synth", name: "Synthwave & Retro", q: "synthwave retrowave", desc: "Neon ışıklar, 80'ler ruhu", hue: 285 },
  { id: "lofi", name: "Lo-Fi Odak", q: "lofi hip hop beats", desc: "Çalışırken arka plan sesi", hue: 35 },
  { id: "rock", name: "Rock Klasikleri", q: "classic rock hits", desc: "Zamansız gitar riffleri", hue: 0 },
  { id: "house", name: "Deep House", q: "deep house mix", desc: "Derin ve akışkan ritimler", hue: 195 },
  { id: "tr-rap", name: "Türkçe Rap", q: "türkçe rap", desc: "Sokakların sesi", hue: 50 },
  { id: "chill", name: "Akustik Akşam", q: "acoustic chill songs", desc: "Sakin, sıcak, yumuşak", hue: 150 },
];

const gradient = (hue) =>
  `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${(hue + 45) % 360} 70% 32%))`;

// ==========================================================
// Yönlendirici
// ==========================================================
const viewEl = () => $("#view");
const scroller = () => $("#main-scroll");

const router = {
  stack: [],
  pos: -1,
  get current() {
    return this.stack[this.pos] ?? { name: "home", params: {} };
  },
};

const ROUTES = {
  home: homeView,
  search: searchView,
  liked: likedView,
  recent: recentView,
  playlist: playlistView,
  mix: mixView,
};

export function navigate(name, params = {}, { replace = false } = {}) {
  const cur = router.current;
  if (!replace && cur.name === name && JSON.stringify(cur.params) === JSON.stringify(params) && router.pos >= 0) {
    return render();
  }
  if (replace && router.pos >= 0) router.stack[router.pos] = { name, params };
  else {
    router.stack = router.stack.slice(0, router.pos + 1);
    router.stack.push({ name, params });
    router.pos = router.stack.length - 1;
  }
  render();
  scroller().scrollTo({ top: 0 });
}

export const goBack = () => router.pos > 0 && (router.pos--, render());
export const goForward = () => router.pos < router.stack.length - 1 && (router.pos++, render());

export function render() {
  const { name, params } = router.current;
  const view = (ROUTES[name] ?? homeView)(params);
  view.classList.add("view-enter");
  viewEl().replaceChildren(view);
  syncNav();
  syncCurrent();
}

/** Kitaplık değişince mevcut görünüm etkileniyorsa yeniden çiz. */
export function refreshIfShowing(kind) {
  const { name } = router.current;
  const affected = { liked: ["liked"], recent: ["recent", "home"], playlists: ["playlist"] }[kind] ?? [];
  if (!affected.includes(name)) return;
  const top = scroller().scrollTop;
  render();
  scroller().scrollTop = top;
}

function syncNav() {
  const { name, params } = router.current;
  $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === name));
  $$(".pl-link").forEach((n) => n.classList.toggle("active", name === "playlist" && n.dataset.id === params.id));
  $("#btn-back").disabled = router.pos <= 0;
  $("#btn-forward").disabled = router.pos >= router.stack.length - 1;
  const input = $("#search-input");
  if (name !== "search" && document.activeElement !== input) input.value = "";
}

/** Çalan parçayı tüm listelerde işaretle. */
export function syncCurrent() {
  const id = player.current?.id;
  $$(".track-row").forEach((r) => {
    r.classList.toggle("current", r.dataset.id === id);
    r.classList.toggle("loading", player.loading && r.dataset.id === id);
  });
}

/** Beğeni butonlarını güncelle (yeniden çizmeden). */
export function syncLikes() {
  $$(".like-btn").forEach((b) => {
    const on = library.isLiked(b.dataset.id);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
  });
}

// ==========================================================
// Ortak bileşenler
// ==========================================================
export function likeButton(track, cls = "") {
  const on = library.isLiked(track.id);
  const btn = iconButton("heart", "Beğen", () => {
    const liked = library.toggleLike(track);
    toast(liked ? "Beğenilenlere eklendi" : "Beğenilenlerden çıkarıldı");
  }, `like-btn ${cls}${on ? " on" : ""}`);
  btn.dataset.id = track.id;
  btn.setAttribute("aria-pressed", on);
  return btn;
}

/** Bir parça için eylem menüsü. */
export function trackMenu(track, anchor, { playlistId } = {}) {
  const playlists = library.playlists;
  openMenu(anchor, [
    { label: "Sıradaki olarak çal", icon: "queue", onSelect: () => { player.playNext(track); toast("Sıraya eklendi"); } },
    {
      label: library.isLiked(track.id) ? "Beğenilenlerden çıkar" : "Beğen",
      icon: "heart",
      onSelect: () => library.toggleLike(track),
    },
    "divider",
    { heading: "Listeye ekle" },
    ...playlists.map((pl) => ({
      label: pl.name,
      icon: "music",
      meta: pl.tracks.length,
      onSelect: () =>
        library.addToPlaylist(pl.id, track)
          ? toast(`“${pl.name}” listesine eklendi`)
          : toast(`Zaten “${pl.name}” listesinde`),
    })),
    {
      label: "Yeni liste oluştur…",
      icon: "plus",
      onSelect: async () => {
        const pl = await createPlaylistFlow([track]);
        if (pl) toast(`“${pl.name}” oluşturuldu`);
      },
    },
    ...(playlistId
      ? ["divider", {
          label: "Bu listeden kaldır",
          icon: "trash",
          danger: true,
          onSelect: () => { library.removeFromPlaylist(playlistId, track.id); toast("Listeden kaldırıldı"); },
        }]
      : []),
  ]);
}

export async function createPlaylistFlow(tracks = []) {
  const name = await promptDialog({
    title: "Yeni çalma listesi",
    message: "Listene bir isim ver, şarkılarını bir araya topla.",
    placeholder: "Örn: Gece Sürüşü, Kodlama…",
    confirmText: "Oluştur",
  });
  if (!name) return null;
  return library.createPlaylist(name, tracks);
}

function trackRow(track, i, tracks, opts) {
  const row = h(
    "div",
    {
      class: "track-row",
      role: "row",
      tabindex: "0",
      dataset: { id: track.id },
      style: { "--i": Math.min(i, 24) },
      onclick: () => player.playList(tracks, i),
      onkeydown: (e) => e.key === "Enter" && player.playList(tracks, i),
      oncontextmenu: (e) => {
        e.preventDefault();
        trackMenu(track, { x: e.clientX, y: e.clientY }, opts);
      },
    },
    h("div", { class: "c-idx" }, h("span", { class: "idx" }, i + 1), icon("play", "idx-play"), eqBars(), h("span", { class: "row-spinner" })),
    h(
      "div",
      { class: "c-title" },
      h("img", { class: "thumb", src: track.thumbnail || null, loading: "lazy", alt: "", draggable: "false" }),
      h("div", { class: "meta" }, h("div", { class: "t-name" }, track.title), h("div", { class: "t-artist" }, track.artist)),
    ),
    h("div", { class: "c-album" }, track.album || ""),
    h(
      "div",
      { class: "c-actions" },
      likeButton(track, "row-btn"),
      iconButton("more", "Diğer", (e) => trackMenu(track, e.currentTarget, opts), "row-btn"),
    ),
    h("div", { class: "c-dur" }, track.duration || ""),
  );
  return row;
}

export function trackList(tracks, opts = {}) {
  return h(
    "div",
    { class: "tracklist", role: "table" },
    h(
      "div",
      { class: "tl-head", role: "row" },
      h("div", { class: "c-idx" }, "#"),
      h("div", { class: "c-title" }, "Başlık"),
      h("div", { class: "c-album" }, "Albüm"),
      h("div", { class: "c-actions" }),
      h("div", { class: "c-dur" }, icon("clock")),
    ),
    tracks.map((t, i) => trackRow(t, i, tracks, opts)),
  );
}

const skeletonList = (n = 8) =>
  h("div", { class: "tracklist" }, Array.from({ length: n }, (_, i) =>
    h("div", { class: "skeleton-row", style: { "--i": i } }, h("i", { class: "sk-thumb" }), h("i", { class: "sk-line" }), h("i", { class: "sk-line short" }))));

const emptyState = (iconName, title, sub, action) =>
  h("div", { class: "empty" }, h("div", { class: "empty-icon" }, icon(iconName)), h("h3", null, title), h("p", null, sub), action);

function section(title, content, extra) {
  return h("section", { class: "section" }, h("div", { class: "section-head" }, h("h2", null, title), extra), content);
}

/** Arama sonucunu asenkron olarak bir konteynere yükler. */
function asyncTracks(query, opts = {}) {
  const box = h("div", { class: "async-box" }, skeletonList());
  api
    .search(query)
    .then((results) => {
      opts.onLoad?.(results);
      box.replaceChildren(
        results.length
          ? trackList(opts.limit ? results.slice(0, opts.limit) : results, opts)
          : emptyState("search", "Sonuç bulunamadı", `“${query}” için eşleşen parça yok.`),
      );
      syncCurrent();
    })
    .catch((err) => {
      box.replaceChildren(emptyState("close", "Yüklenemedi", String(err)));
      toast(String(err), { error: true });
    });
  return box;
}

function curatedCard(p, i) {
  return h(
    "button",
    {
      class: "card",
      type: "button",
      style: { "--i": i },
      onclick: () => navigate("mix", { id: p.id }),
    },
    h("div", { class: "card-art", style: { background: gradient(p.hue) } },
      h("span", { class: "card-art-title" }, p.name),
      h("span", { class: "card-play", "aria-hidden": "true" }, icon("play"))),
    h("div", { class: "card-name" }, p.name),
    h("div", { class: "card-sub" }, p.desc),
  );
}

function trackCard(track, i, list) {
  return h(
    "button",
    { class: "card", type: "button", style: { "--i": i }, onclick: () => player.playList(list, i) },
    h("div", { class: "card-art" },
      h("img", { src: track.thumbnail || null, alt: "", loading: "lazy", draggable: "false" }),
      h("span", { class: "card-play", "aria-hidden": "true" }, icon("play"))),
    h("div", { class: "card-name" }, track.title),
    h("div", { class: "card-sub" }, track.artist),
  );
}

/** Liste kapağı: ilk 4 parçanın kolajı ya da renk geçişi. */
function collageArt(tracks, hue = 16, iconName = "music") {
  const thumbs = tracks.map((t) => t.thumbnail).filter(Boolean);
  if (thumbs.length >= 4) {
    return h("div", { class: "cover collage" }, thumbs.slice(0, 4).map((src) => h("img", { src, alt: "", draggable: "false" })));
  }
  if (thumbs.length) return h("div", { class: "cover" }, h("img", { src: thumbs[0], alt: "", draggable: "false" }));
  return h("div", { class: "cover", style: { background: gradient(hue) } }, icon(iconName, "cover-icon"));
}

/** `tracks` dizi ya da (asenkron yüklenen listeler için) dizi döndüren fonksiyon olabilir. */
function collectionHeader({ art, kicker, title, meta, tracks, actions = [] }) {
  const list = () => (typeof tracks === "function" ? tracks() : tracks);
  const playBtn = h(
    "button",
    {
      class: "btn-play-lg",
      type: "button",
      "aria-label": "Oynat",
      disabled: !list().length,
      onclick: () => player.playList(list(), 0),
    },
    icon("play"),
  );
  return h(
    "header",
    { class: "collection-head" },
    art,
    h("div", { class: "collection-info" },
      h("span", { class: "kicker" }, kicker),
      h("h1", { class: "collection-title" }, title),
      h("p", { class: "collection-meta" }, meta),
      h("div", { class: "collection-actions" },
        playBtn,
        iconButton("shuffle", "Karıştırarak çal", () => player.playShuffled(list()), "btn-ghost-round"),
        actions)),
  );
}

const metaLine = (tracks) => (tracks.length ? `${tracks.length} parça · ${formatTotal(tracks)}` : "Henüz parça yok");

// ==========================================================
// Görünümler
// ==========================================================
function homeView() {
  const date = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const recent = library.recent.slice(0, 10);
  return h(
    "div",
    { class: "page" },
    h("header", { class: "hero" },
      h("span", { class: "kicker" }, date),
      h("h1", { class: "hero-title" }, greeting()),
      h("p", { class: "hero-sub" }, "Senin için derlenen listeler ve şu an popüler olan parçalar.")),
    section("Senin için listeler", h("div", { class: "grid" }, CURATED.map(curatedCard))),
    recent.length > 0 &&
      section("Son çalınanlar", h("div", { class: "shelf" }, recent.map((t, i) => trackCard(t, i, recent))),
        h("button", { class: "link-btn", type: "button", onclick: () => navigate("recent") }, "Tümünü gör")),
    section("Bugünün popülerleri", asyncTracks("top hits 2026", { limit: 20 })),
  );
}

function searchView({ q = "" }) {
  if (!q) {
    return h(
      "div",
      { class: "page" },
      h("header", { class: "hero compact" }, h("h1", { class: "hero-title" }, "Ara"),
        h("p", { class: "hero-sub" }, "Şarkı, sanatçı ya da albüm ara — ya da bir türe göz at.")),
      section("Türlere göz at", h("div", { class: "grid" }, CURATED.map(curatedCard))),
    );
  }
  return h(
    "div",
    { class: "page" },
    h("header", { class: "hero compact" }, h("span", { class: "kicker" }, "Arama sonuçları"), h("h1", { class: "hero-title" }, q)),
    asyncTracks(q),
  );
}

function mixView({ id }) {
  const p = CURATED.find((c) => c.id === id) ?? CURATED[0];
  let loaded = [];
  const head = collectionHeader({
    art: h("div", { class: "cover", style: { background: gradient(p.hue) } }, h("span", { class: "cover-text" }, p.name)),
    kicker: "Önerilen liste",
    title: p.name,
    meta: p.desc,
    tracks: () => loaded,
  });
  const playBtn = $(".btn-play-lg", head);
  return h("div", { class: "page" }, head, asyncTracks(p.q, {
    onLoad: (r) => {
      loaded = r;
      playBtn.disabled = !r.length;
      $(".collection-meta", head).textContent = `${p.desc} · ${metaLine(r)}`;
    },
  }));
}

function likedView() {
  const tracks = [...library.liked];
  return h(
    "div",
    { class: "page" },
    collectionHeader({
      art: h("div", { class: "cover liked-cover" }, icon("heart", "cover-icon")),
      kicker: "Kitaplık",
      title: "Beğenilenler",
      meta: metaLine(tracks),
      tracks,
    }),
    tracks.length
      ? trackList(tracks)
      : emptyState("heart", "Henüz beğeni yok", "Parçaların yanındaki kalbe dokunarak buraya ekleyebilirsin."),
  );
}

function recentView() {
  const tracks = [...library.recent];
  const clear = tracks.length > 0 &&
    iconButton("trash", "Geçmişi temizle", async () => {
      if (await confirmDialog({ title: "Geçmiş temizlensin mi?", message: "Son çalınanlar listesi silinecek.", confirmText: "Temizle", danger: true })) {
        library.clearRecent();
      }
    }, "btn-ghost-round");
  return h(
    "div",
    { class: "page" },
    collectionHeader({
      art: collageArt(tracks, 210, "clock"),
      kicker: "Geçmiş",
      title: "Son Çalınanlar",
      meta: metaLine(tracks),
      tracks,
      actions: [clear],
    }),
    tracks.length ? trackList(tracks) : emptyState("clock", "Geçmiş boş", "Çaldığın şarkılar burada görünecek."),
  );
}

function playlistView({ id }) {
  const pl = library.getPlaylist(id);
  if (!pl) return emptyState("music", "Liste bulunamadı", "Bu çalma listesi silinmiş olabilir.");
  const tracks = [...pl.tracks];

  const rename = iconButton("list", "Yeniden adlandır", async () => {
    const name = await promptDialog({ title: "Listeyi yeniden adlandır", value: pl.name, confirmText: "Kaydet" });
    if (name) library.renamePlaylist(pl.id, name);
  }, "btn-ghost-round");
  const del = iconButton("trash", "Listeyi sil", async () => {
    const ok = await confirmDialog({
      title: `“${pl.name}” silinsin mi?`,
      message: "Bu işlem geri alınamaz.",
      confirmText: "Sil",
      danger: true,
    });
    if (!ok) return;
    library.deletePlaylist(pl.id);
    toast(`“${pl.name}” silindi`);
    navigate("home", {}, { replace: true });
  }, "btn-ghost-round");

  return h(
    "div",
    { class: "page" },
    collectionHeader({
      art: collageArt(tracks, 260),
      kicker: "Çalma listesi",
      title: pl.name,
      meta: metaLine(tracks),
      tracks,
      actions: [rename, del],
    }),
    tracks.length
      ? trackList(tracks, { playlistId: pl.id })
      : emptyState("plus", "Bu liste henüz boş", "Bir parçanın ⋯ menüsünden “Listeye ekle” ile şarkı ekleyebilirsin."),
  );
}

// ==========================================================
// Kenar çubuğu: çalma listeleri
// ==========================================================
export function renderSidebarPlaylists() {
  const box = $("#playlist-nav");
  if (!library.playlists.length) {
    box.replaceChildren(h("p", { class: "sidebar-hint" }, "Henüz listen yok. + ile oluştur."));
    return;
  }
  box.replaceChildren(
    ...library.playlists.map((pl) => {
      const thumb = pl.tracks.find((t) => t.thumbnail)?.thumbnail;
      return h(
        "button",
        {
          class: "pl-link",
          type: "button",
          dataset: { id: pl.id },
          onclick: () => navigate("playlist", { id: pl.id }),
        },
        thumb
          ? h("img", { class: "pl-thumb", src: thumb, alt: "", draggable: "false" })
          : h("span", { class: "pl-thumb" }, icon("music")),
        h("span", { class: "pl-text" }, h("span", { class: "pl-name" }, pl.name), h("span", { class: "pl-count" }, `${pl.tracks.length} parça`)),
      );
    }),
  );
  syncNav();
}
