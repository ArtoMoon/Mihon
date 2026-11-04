// ==========================================================
// Helios — kapak görselinden dinamik vurgu rengi çıkarma
// Görsel CORS izni vermezse sessizce varsayılan renge döner.
// ==========================================================
const cache = new Map();
const SIZE = 32;

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
};

function analyse(img) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

  // Ton kovaları: canlı ve orta parlaklıktaki pikselleri ödüllendir
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < 0.12 || l > 0.92 || s < 0.18) continue;
    const key = Math.round(h / 15) % 24;
    const weight = s * s * (1 - Math.abs(l - 0.5));
    const b = buckets.get(key) ?? { w: 0, h: 0, s: 0 };
    b.w += weight; b.h += h * weight; b.s += s * weight;
    buckets.set(key, b);
  }
  let best = null;
  for (const b of buckets.values()) if (!best || b.w > best.w) best = b;
  if (!best || best.w < 0.5) return null;

  return {
    h: Math.round(best.h / best.w),
    s: Math.round(Math.min(0.9, Math.max(0.55, best.s / best.w)) * 100),
    l: 62,
  };
}

/** @returns {Promise<{h:number,s:number,l:number}|null>} */
export function extractAccent(url) {
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    const timer = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timer);
      try { resolve(analyse(img)); } catch { resolve(null); }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
  cache.set(url, promise);
  return promise;
}

const DEFAULT = { h: 16, s: 86, l: 59 }; // Helios turuncusu #F06B3C

export async function applyAccentFrom(url) {
  const c = (await extractAccent(url)) ?? DEFAULT;
  const root = document.documentElement.style;
  root.setProperty("--accent-h", c.h);
  root.setProperty("--accent-s", `${c.s}%`);
  root.setProperty("--accent-l", `${c.l}%`);
}

