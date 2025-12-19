// src/ui/pdfInfo.js

import { on } from "../core/events.js";

const btn = document.getElementById("infoBtn");
const panel = document.getElementById("infoPanel");

const nameEl = document.getElementById("infoName");
const pagesEl = document.getElementById("infoPages");
const sizeEl = document.getElementById("infoSize");

if (!btn || !panel) {
  console.warn("PDF info UI elements missing");
}

// Toggle panel
btn.addEventListener("click", (e) => {
  e.stopPropagation();
  panel.classList.toggle("hidden");
});

// Close when clicking outside
document.addEventListener("click", () => {
  panel.classList.add("hidden");
});

// Update info when metadata arrives
on("pdf:meta", (meta) => {
  nameEl.textContent = meta.name || "–";
  pagesEl.textContent = meta.totalPages || "–";
  sizeEl.textContent = formatSize(meta.size);
});

// Clear on reset
on("pdf:reset", () => {
  nameEl.textContent = "–";
  pagesEl.textContent = "–";
  sizeEl.textContent = "–";
});

// Helpers
function formatSize(bytes) {
  if (!bytes) return "–";
  const mb = bytes / (1024 * 1024);
  return mb < 1
    ? `${Math.round(bytes / 1024)} KB`
    : `${mb.toFixed(2)} MB`;
}
