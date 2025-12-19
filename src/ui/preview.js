// src/ui/preview.js

import { on } from "../core/events.js";

const overlay = document.getElementById("previewOverlay");
const image = document.getElementById("previewImage");
const prevBtn = document.getElementById("previewPrev");
const nextBtn = document.getElementById("previewNext");

if (!overlay || !image || !prevBtn || !nextBtn) {
  console.warn("Preview overlay elements missing");
}

let canvases = [];
let currentIndex = null;

// Cache canvases as they render
on("pdf:pageRendered", ({ canvas }) => {
  canvases.push(canvas);

  // Desktop: double click
  canvas.addEventListener("dblclick", () => {
    openPreview(canvases.indexOf(canvas));
  });

  // Mobile: long press
  let timer = null;
  canvas.addEventListener("touchstart", () => {
    timer = setTimeout(() => {
      openPreview(canvases.indexOf(canvas));
    }, 500);
  }, { passive: true });

  canvas.addEventListener("touchend", () => clearTimeout(timer));
  canvas.addEventListener("touchmove", () => clearTimeout(timer));
});

// ---- CORE FUNCTIONS ----
function openPreview(index) {
  if (index < 0 || index >= canvases.length) return;

  currentIndex = index;
  image.src = canvases[index].toDataURL("image/png");
  overlay.classList.remove("hidden");
}

function closePreview() {
  overlay.classList.add("hidden");
  image.src = "";
  currentIndex = null;
}

function updateImage() {
  if (currentIndex === null) return;
  image.src = canvases[currentIndex].toDataURL("image/png");
}

// ---- NAVIGATION ----
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex > 0) {
    currentIndex--;
    updateImage();
  }
});

nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex < canvases.length - 1) {
    currentIndex++;
    updateImage();
  }
});

// ---- CLOSE ----
overlay.addEventListener("click", closePreview);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePreview();
});
