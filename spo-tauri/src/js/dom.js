// ==========================================================
// Helios — DOM yardımcıları
// ==========================================================
import { ICONS } from "./icons.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * Hafif hyperscript yardımcısı.
 * h("button", { class: "btn", onclick: fn }, "Metin", childNode)
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === "class") el.className = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key === "style" && typeof value === "object") {
      for (const [prop, v] of Object.entries(value)) el.style.setProperty(prop, v);
    } else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) el.setAttribute(key, "");
    else el.setAttribute(key, value);
  }
  el.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
  return el;
}

const tpl = document.createElement("template");

/** İkon adından yeni bir <svg> öğesi üretir. */
export function icon(name, cls = "") {
  tpl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon ${cls}">${ICONS[name] ?? ""}</svg>`;
  return tpl.content.firstElementChild;
}

/** Yalnızca ikon içeren, erişilebilir buton. */
export function iconButton(name, label, onClick, cls = "") {
  return h(
    "button",
    {
      class: `icon-btn ${cls}`,
      type: "button",
      title: label,
      "aria-label": label,
      onclick: (e) => {
        e.stopPropagation();
        onClick?.(e);
      },
    },
    icon(name),
  );
}

/** Ekolayzır animasyon çubukları (çalan parça göstergesi). */
export const eqBars = () => h("span", { class: "eq" }, h("i"), h("i"), h("i"), h("i"));

export const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

export const formatTotal = (tracks) => {
  const total = tracks.reduce((sum, t) => sum + (t.duration_sec || 0), 0);
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  return h ? `${h} sa ${m} dk` : `${m} dk`;
};

export const formatBytes = (bytes) => {
  if (!bytes) return "0 MB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i >= 2 ? 1 : 0)} ${units[i]}`;
};

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}
