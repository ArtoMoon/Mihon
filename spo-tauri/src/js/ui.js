// ==========================================================
// Helios — arayüz bileşenleri: bildirim, diyalog, açılır menü
// ==========================================================
import { $, h, icon } from "./dom.js";

// ---------- Toast ----------
let toastTimer;
export function toast(message, { error = false } = {}) {
  const el = $("#toast");
  el.replaceChildren(icon(error ? "close" : "sparkles"), h("span", null, message));
  el.classList.toggle("error", error);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ---------- Diyaloglar (<dialog>) ----------
function bindBackdropClose(dialog) {
  if (dialog.dataset.bound) return;
  dialog.dataset.bound = "1";
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close("cancel");
  });
}

function openDialog(dialog) {
  bindBackdropClose(dialog);
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener("close", () => resolve(dialog.returnValue), { once: true }),
  );
}

/** Metin girişi isteyen diyalog. @returns {Promise<string|null>} */
export async function promptDialog({ title, message = "", placeholder = "", value = "", confirmText = "Kaydet" }) {
  const dlg = $("#dlg-prompt");
  $(".dlg-title", dlg).textContent = title;
  $(".dlg-message", dlg).textContent = message;
  $(".dlg-confirm", dlg).textContent = confirmText;
  const input = $("input", dlg);
  input.placeholder = placeholder;
  input.value = value;
  queueMicrotask(() => input.select());
  const result = await openDialog(dlg);
  const text = input.value.trim();
  return result === "ok" && text ? text : null;
}

/** Onay diyaloğu. @returns {Promise<boolean>} */
export async function confirmDialog({ title, message = "", confirmText = "Onayla", danger = false }) {
  const dlg = $("#dlg-confirm");
  $(".dlg-title", dlg).textContent = title;
  $(".dlg-message", dlg).textContent = message;
  const btn = $(".dlg-confirm", dlg);
  btn.textContent = confirmText;
  btn.classList.toggle("danger", danger);
  return (await openDialog(dlg)) === "ok";
}

export const isDialogOpen = () => !!document.querySelector("dialog[open]");

// ---------- Açılır menü (Popover API) ----------
/**
 * @param {HTMLElement|{x:number,y:number}} anchor
 * @param {Array<{label:string, icon?:string, meta?:string, danger?:boolean, onSelect?:Function} | "divider" | {heading:string}>} items
 */
export function openMenu(anchor, items) {
  const menu = $("#menu");
  menu.replaceChildren(
    ...items.map((item) => {
      if (item === "divider") return h("div", { class: "menu-divider", role: "separator" });
      if (item.heading) return h("div", { class: "menu-heading" }, item.heading);
      return h(
        "button",
        {
          class: `menu-item${item.danger ? " danger" : ""}`,
          role: "menuitem",
          type: "button",
          disabled: item.disabled,
          onclick: () => {
            menu.hidePopover();
            item.onSelect?.();
          },
        },
        item.icon ? icon(item.icon) : h("span", { class: "menu-spacer" }),
        h("span", { class: "menu-label" }, item.label),
        item.meta != null && h("span", { class: "menu-meta" }, item.meta),
      );
    }),
  );

  if (menu.matches(":popover-open")) menu.hidePopover();
  menu.showPopover();

  // Konumlandırma: çapanın altına/üstüne, ekran sınırları içinde
  const { width, height } = menu.getBoundingClientRect();
  let x, y;
  if (anchor instanceof Element) {
    const r = anchor.getBoundingClientRect();
    x = r.right - width;
    y = r.bottom + 6;
    if (y + height > innerHeight - 12) y = r.top - height - 6;
  } else {
    ({ x, y } = anchor);
    if (y + height > innerHeight - 12) y -= height;
  }
  menu.style.left = `${Math.max(12, Math.min(x, innerWidth - width - 12))}px`;
  menu.style.top = `${Math.max(12, y)}px`;
}

