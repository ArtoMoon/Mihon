// ==========================================================
// Helios — SVG ikon seti (Lucide tarzı, 24x24)
// ==========================================================
const F = 'fill="currentColor" stroke="none"';

export const ICONS = {
  play: `<path ${F} d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/>`,
  pause: `<rect ${F} x="6" y="4" width="4.5" height="16" rx="1.2"/><rect ${F} x="13.5" y="4" width="4.5" height="16" rx="1.2"/>`,
  next: `<path ${F} d="M5 5.2v13.6a1 1 0 0 0 1.55.83L16 13.2V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.8L6.55 4.37A1 1 0 0 0 5 5.2z"/>`,
  prev: `<path ${F} d="M19 5.2v13.6a1 1 0 0 1-1.55.83L8 13.2V18a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v4.8l9.45-6.43A1 1 0 0 1 19 5.2z"/>`,
  shuffle: `<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>`,
  repeat: `<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>`,
  heart: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  close: `<path d="M18 6 6 18M6 6l12 12"/>`,
  trash: `<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  search: `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>`,
  home: `<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>`,
  compass: `<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>`,
  library: `<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  list: `<path d="M3 6h13M3 12h13M3 18h9"/><path d="M19 15v6M16 18h6"/>`,
  music: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  volume: `<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`,
  volumeLow: `<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`,
  mute: `<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>`,
  panel: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>`,
  queue: `<path d="M3 5h12M3 12h12M3 19h8"/><path ${F} d="M17 14v7l5-3.5z"/>`,
  chevronLeft: `<path d="m15 18-6-6 6-6"/>`,
  chevronRight: `<path d="m9 18 6-6-6-6"/>`,
  minimize: `<path d="M5 12h14"/>`,
  maximize: `<rect x="5" y="5" width="14" height="14" rx="2"/>`,
  disc: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/>`,
  sparkles: `<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>`,
  more: `<circle ${F} cx="5" cy="12" r="1.8"/><circle ${F} cx="12" cy="12" r="1.8"/><circle ${F} cx="19" cy="12" r="1.8"/>`,
  database: `<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>`,
};

